import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';

function sanitizeDocIdPart(str: string = ''): string {
  return str.toString().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function getFallbackAdvisory(commodity: string, modalPrice: number, recommendation: string): string {
  const comm = commodity || 'Fasal';
  const price = modalPrice > 0 ? `₹${modalPrice}/quintal` : 'bhav';
  if (recommendation === 'SELL_NOW') {
    return `${comm} ke daam is samay ${price} ke achhe level par hain aur aane wale dino me mandi aavak badh sakti hai. Abhi bechna munafedar rahega.`;
  }
  return `${comm} ke bhav me tezi ka rukh hai aur aavak santulit hai. Agar safe storage suvidha ho, toh 7-10 din ruko behtar daam milne ki sambhavna hai.`;
}

interface DetailedAdvisory {
  sentiment: string;
  storage: string;
  priceTarget: string;
  detailedText: string;
}

function getFallbackDetailedAdvisory(
  commodity: string,
  modalPrice: number,
  recommendation: string,
  trend: string,
  market: string,
  district: string
): DetailedAdvisory {
  const comm = commodity || 'Fasal';
  const isSell = recommendation === 'SELL_NOW';
  const isRising = trend === 'RISING';
  const targetLow = Math.round(modalPrice * 1.04);
  const targetHigh = Math.round(modalPrice * 1.09);

  return {
    sentiment: isSell
      ? `${market || 'Mandi'} (${district}) mein aaj ${comm} ki aavak zyada hai aur mandir prices plateau par hain. Is samay market sentiment weak ho sakta hai — abhi bechna sahi rahega.`
      : `${market || 'Mandi'} (${district}) mein ${comm} ki aavak santulit hai. ${isRising ? 'Bhav mein tezi ka rukh dikh raha hai — kuch din aur ruko.' : 'Market stable hai aur agle 7-10 din mein behtar daam milne ki sambhavna hai.'}`,
    storage: isSell
      ? `Agar storage cost zyada ho rahi hai ya godown mein quality risk hai, toh turant bechna behtar hai. Moth-proof bags aur dry storage ensure karein jab tak sale complete na ho.`
      : `Godown mein ${comm} store karein toh moisture 12-14% se kam rakhein. Pest attack se bachane ke liye HDPE bags use karein aur weekly quality check karein. Minimum 10 din ki storage safe hai agar proper hai.`,
    priceTarget: isSell
      ? `Current modal price ₹${modalPrice}/qtl achha entry point hai bechne ka. Delay se ₹${Math.round(modalPrice * 0.97)}-₹${Math.round(modalPrice * 0.95)}/qtl tak price girne ka risk.`
      : `10 din mein estimated target: ₹${targetLow}–₹${targetHigh}/qtl. Yeh ek conservative estimate hai seasonal demand aur aavak patterns ke basis par.`,
    detailedText: isSell
      ? `BECHO: ${comm} ke daam abhi ₹${modalPrice}/quintal par hain jo ki current season ka uchch sthar hai. Aavak pressure aur aane wale naveen stocks ko dekhtey huey, iss price par bechna strategically sahi hai. Abhi bechkar storage cost aur price-drop risk dono se bachein.`
      : `ROKO: ${comm} ke bhav mein abhi tezi ka mahaul hai. ${market} mandi mein supply stable hai aur demand pressure aa raha hai. Agar aapke paas secure storage hai, toh 7-10 din ruk kar ₹${targetLow}-₹${targetHigh}/quintal ka behtar bhav milne ki ummeed hai.`,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      market,
      district,
      state,
      commodity,
      variety,
      modalPrice,
      trend,
      recommendation,
      depth,
    } = body;

    const isDetailed = depth === 'detailed';

    const commName = commodity || 'Crop';
    const mktName = market || 'APMC Mandi';
    const distName = district || '';
    const stName = state || '';
    const varName = variety || '';
    const mPrice = parseFloat(modalPrice) || 0;
    const trnd = trend || 'STABLE';
    const rec = recommendation || 'HOLD';

    // Determine target docId in 'mandi_rates'
    const sState = sanitizeDocIdPart(stName);
    const sDist = sanitizeDocIdPart(distName);
    const sMkt = sanitizeDocIdPart(mktName);
    const sComm = sanitizeDocIdPart(commName);
    const sVar = sanitizeDocIdPart(varName);
    const fallbackDocId = sVar
      ? `${sState}_${sDist}_${sMkt}_${sComm}_${sVar}`
      : `${sState}_${sDist}_${sMkt}_${sComm}`;
    const effectiveDocId = (id && typeof id === 'string' && !id.startsWith('mock_')) ? id : fallbackDocId;

    // ─── Detailed Advisory Path ───────────────────────────────────────────
    if (isDetailed) {
      // 1. Check 24-hour cache for detailed advisory
      if (effectiveDocId) {
        try {
          const docRef = doc(db, 'mandi_rates', effectiveDocId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            const cachedDetailed = data.detailedAdvisory;
            const updatedAt = data.detailedAdvisoryUpdatedAt;

            if (cachedDetailed && typeof cachedDetailed === 'object' && cachedDetailed.detailedText) {
              let updatedMs = 0;
              if (updatedAt?.toMillis) updatedMs = updatedAt.toMillis();
              else if (typeof updatedAt === 'number') updatedMs = updatedAt;
              else if (updatedAt instanceof Date) updatedMs = updatedAt.getTime();

              const nowMs = Date.now();
              if (updatedMs === 0 || (nowMs - updatedMs < 24 * 60 * 60 * 1000)) {
                return NextResponse.json({
                  success: true,
                  detailed: cachedDetailed,
                  cached: true,
                });
              }
            }
          }
        } catch (cacheErr) {
          console.warn('[mandi-advisory] Detailed cache lookup warning:', cacheErr);
        }
      }

      // 2. Generate detailed advisory via Gemini or fallback
      let detailedAdvisory: DetailedAdvisory = getFallbackDetailedAdvisory(
        commName, mPrice, rec, trnd, mktName, distName
      );

      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const systemInstruction =
            'You are an expert Indian agricultural economist advising a small-scale farmer in conversational, grounded Hinglish. Be direct, practical, and compassionate. No robotic jargon. Structure your advice in 3 separate JSON fields.';

          const userPrompt = `Mandi: ${mktName} (${distName ? `${distName}, ` : ''}${stName})
Fasal (Commodity): ${commName}${varName ? ` (${varName})` : ''}
Modal Price: ₹${mPrice}/Quintal
Market Trend: ${trnd}
Platform Action: ${rec === 'SELL_NOW' ? 'BECHO (Sell Now)' : 'ROKO (Hold 7-10 Days)'}

Generate a JSON object with exactly these 4 fields (each 1-2 sentences in Hinglish):
{
  "sentiment": "Current mandi aavak aur market demand situation explain karein",
  "storage": "Agar kisan ruk ke storage mein rakhe to kya precautions lene chahiye",
  "priceTarget": "10-din ka price target range kya ho sakta hai (concrete numbers mein)",
  "detailedText": "Overall 2-3 line strategy advice in Hinglish combining the key insight"
}

Respond ONLY with valid JSON, no markdown.`;

          const geminiRes = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: userPrompt,
            config: {
              systemInstruction,
              temperature: 0.35,
            },
          });

          if (geminiRes.text && geminiRes.text.trim()) {
            let jsonText = geminiRes.text.trim();
            // Strip markdown code blocks if present
            jsonText = jsonText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
            const parsed = JSON.parse(jsonText);
            if (parsed.sentiment && parsed.detailedText) {
              detailedAdvisory = {
                sentiment: parsed.sentiment || detailedAdvisory.sentiment,
                storage: parsed.storage || detailedAdvisory.storage,
                priceTarget: parsed.priceTarget || detailedAdvisory.priceTarget,
                detailedText: parsed.detailedText || detailedAdvisory.detailedText,
              };
            }
          }
        } catch (geminiErr: any) {
          console.warn('[mandi-advisory] Gemini detailed call failed, using fallback:', geminiErr?.message || geminiErr);
        }
      }

      // 3. Cache in Firestore
      if (effectiveDocId) {
        try {
          const docRef = doc(db, 'mandi_rates', effectiveDocId);
          await setDoc(docRef, {
            detailedAdvisory,
            detailedAdvisoryUpdatedAt: serverTimestamp(),
          }, { merge: true });
        } catch (updateErr) {
          console.warn('[mandi-advisory] Firestore detailed caching warning:', updateErr);
        }
      }

      return NextResponse.json({
        success: true,
        detailed: detailedAdvisory,
        cached: false,
      });
    }

    // ─── Standard (Simple) Advisory Path ────────────────────────────────
    // 1. Check 24-hour cache in Firestore
    if (effectiveDocId) {
      try {
        const docRef = doc(db, 'mandi_rates', effectiveDocId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const cachedText = data.advisoryText;
          const updatedAt = data.advisoryUpdatedAt;

          if (cachedText && typeof cachedText === 'string' && cachedText.trim().length > 10) {
            let updatedMs = 0;
            if (updatedAt?.toMillis) {
              updatedMs = updatedAt.toMillis();
            } else if (typeof updatedAt === 'number') {
              updatedMs = updatedAt;
            } else if (updatedAt instanceof Date) {
              updatedMs = updatedAt.getTime();
            }

            const nowMs = Date.now();
            if (updatedMs === 0 || (nowMs - updatedMs < 24 * 60 * 60 * 1000)) {
              return NextResponse.json({
                success: true,
                advisory: cachedText,
                cached: true,
              });
            }
          }
        }
      } catch (cacheCheckErr) {
        console.warn('[mandi-advisory] Cache lookup warning:', cacheCheckErr);
      }
    }

    // 2. Generate Advisory via Gemini or Fallback
    let generatedAdvisory = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction =
          'You are an expert agricultural economist advising an Indian farmer in simple, clear Hinglish. Provide concise, 2-line practical advice explaining why they should Hold or Sell based on the current price and market trend. Keep it grounded, realistic, and farmer-friendly without robotic jargon.';

        const userPrompt = `Mandi: ${mktName} (${distName ? `${distName}, ` : ''}${stName})
Fasal (Commodity): ${commName}
Current Modal Price: ₹${mPrice}/Quintal
Market Trend: ${trnd}
Platform Action: ${rec === 'SELL_NOW' ? 'BECHO (Sell Now)' : 'ROKO (Hold 7-10 Days)'}

Provide exactly 2 actionable lines in Hinglish for the farmer.`;

        const geminiRes = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: userPrompt,
          config: {
            systemInstruction,
            temperature: 0.3,
          },
        });

        if (geminiRes.text && geminiRes.text.trim().length > 10) {
          generatedAdvisory = geminiRes.text.trim();
        }
      } catch (geminiErr: any) {
        console.warn('[mandi-advisory] Gemini call failed, using heuristic fallback:', geminiErr?.message || geminiErr);
      }
    }

    if (!generatedAdvisory) {
      generatedAdvisory = getFallbackAdvisory(commName, mPrice, rec);
    }

    // 3. Cache generated advisory in Firestore
    if (effectiveDocId) {
      try {
        const docRef = doc(db, 'mandi_rates', effectiveDocId);
        await setDoc(
          docRef,
          {
            advisoryText: generatedAdvisory,
            advisoryUpdatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (updateErr) {
        console.warn('[mandi-advisory] Firestore caching warning:', updateErr);
      }
    }

    return NextResponse.json({
      success: true,
      advisory: generatedAdvisory,
      cached: false,
    });
  } catch (error: any) {
    console.error('[mandi-advisory] Critical route error:', error);
    return NextResponse.json(
      {
        success: false,
        advisory: 'Bhav aur aavak par dhyan rakhein aur local mandi vyapari se sampark karein.',
        error: error?.message || 'Failed to generate advisory',
      },
      { status: 500 }
    );
  }
}
