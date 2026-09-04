import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { GoogleGenAI } from '@google/genai';

function getFallbackAdvisory(commodity: string, modalPrice: number, recommendation: string): string {
  const comm = commodity || 'Fasal';
  const price = modalPrice > 0 ? `₹${modalPrice}/quintal` : 'bhav';
  if (recommendation === 'SELL_NOW') {
    return `${comm} ke daam is samay ${price} ke achhe level par hain aur aane wale dino me mandi aavak badh sakti hai. Abhi bechna munafedar rahega.`;
  }
  return `${comm} ke bhav me tezi ka rukh hai aur aavak santulit hai. Agar safe storage suvidha ho, toh 7-10 din ruko behtar daam milne ki sambhavna hai.`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, market, district, state, commodity, modalPrice, trend, recommendation } = body;

    const commName = commodity || 'Crop';
    const mktName = market || 'APMC Mandi';
    const distName = district || '';
    const stName = state || '';
    const mPrice = parseFloat(modalPrice) || 0;
    const trnd = trend || 'STABLE';
    const rec = recommendation || 'HOLD';

    // 1. Check 24-hour cache in Firestore if valid doc ID is provided
    if (id && typeof id === 'string' && !id.startsWith('mock_')) {
      try {
        const docRef = doc(db, 'mandi_rates', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const cachedText = data.advisoryText;
          const updatedAt = data.advisoryUpdatedAt;

          if (cachedText) {
            let updatedMs = 0;
            if (updatedAt?.toMillis) {
              updatedMs = updatedAt.toMillis();
            } else if (typeof updatedAt === 'number') {
              updatedMs = updatedAt;
            } else if (updatedAt instanceof Date) {
              updatedMs = updatedAt.getTime();
            }

            const nowMs = Date.now();
            // If updated within 24 hours (86,400,000 ms), return cached advisory
            if (updatedMs > 0 && (nowMs - updatedMs < 24 * 60 * 60 * 1000)) {
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
          model: 'gemini-2.5-flash',
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
    if (id && typeof id === 'string' && !id.startsWith('mock_')) {
      try {
        const docRef = doc(db, 'mandi_rates', id);
        await updateDoc(docRef, {
          advisoryText: generatedAdvisory,
          advisoryUpdatedAt: serverTimestamp(),
        });
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
