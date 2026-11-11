import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { requireUser, handleAuthError, HttpError } from '@/lib/auth';
import { chatRequestSchema, formatZodError } from '@/lib/validations';
import { checkRateLimit } from '@/lib/rateLimit';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

export async function POST(req: Request) {
  try {
    // 1. User Authentication (Optional for public farming advisory, with strict IP fallback)
    let userId = 'guest';
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const user = await requireUser(req);
        if (user?.id) userId = user.id;
      } catch (authErr) {
        // If expired or invalid token, fall back to guest IP rate limit
      }
    }

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
                     req.headers.get('x-real-ip') ||
                     'guest_client';

    const rateKey = userId !== 'guest' ? `chat_user_${userId}` : `chat_ip_${clientIp}`;
    const maxReqs = userId !== 'guest' ? 30 : 15;

    // 2. Sliding Window Rate Limiting (Prevents quota abuse)
    const rateLimit = checkRateLimit(rateKey, maxReqs, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Bahut zyada requests. Kripya ${rateLimit.resetInSec} seconds intezaar karein. (Too many requests. Please wait ${rateLimit.resetInSec}s).`,
        },
        { status: 429 }
      );
    }

    // 3. Payload Parsing and Strict Input Validation
    const rawBody = await req.json().catch(() => null);
    if (!rawBody) {
      throw new HttpError('Invalid or missing JSON payload in request body', 400);
    }

    const parseResult = chatRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      throw new HttpError(formatZodError(parseResult.error), 400);
    }

    const { messages, context } = parseResult.data;

    // 4. Strict Combined Payload Length Enforcement
    const totalChars = messages.reduce((sum, msg) => {
      return sum + msg.parts.reduce((pSum, part) => pSum + part.text.length, 0);
    }, 0);

    if (totalChars > 8000) {
      throw new HttpError('Total conversation text exceeds maximum allowed limit of 8,000 characters', 400);
    }

    const lastUserQuery = messages[messages.length - 1]?.parts?.[0]?.text || '';
    const userLanguage = context?.language || 'hi-en';

    // Smart Multilingual Agricultural Fallback Advisor (Active if external AI service is offline or rate-capped)
    const getFallbackAgriReply = (query: string, lang: string) => {
      const q = query.toLowerCase();

      if (lang === 'hi') {
        if (q.includes('mandi') || q.includes('bhav') || q.includes('rate') || q.includes('मंडी') || q.includes('भाव')) {
          return "🌾 आज के ताज़ा APMC मंडी भाव देखने के लिए कृपया हमारे '📈 मंडी भाव' पोर्टल पर जाएं, जहां देशभर की मंडियों के प्रति घंटे सत्यापित भाव उपलब्ध हैं।\n\nविशेष फसल सलाह हेतु टोल-फ्री किसान हेल्पलाइन 1800-180-1551 पर संपर्क करें।";
        }
        if (q.includes('khad') || q.includes('खाद') || q.includes('यूरिया') || q.includes('बीज') || q.includes('दवाई') || q.includes('कीटनाशक')) {
          return "🌱 फसल के अनुसार संतुलित खाद (यूरिया, डीएपी, पोटाश) का प्रयोग करें। प्रति एकड़ सही मात्रा जानने के लिए हमारा 'कैलकुलेटर' उपयोग करें या नजदीकी प्रमाणित स्टोर से ऑर्डर करें।\n\nव्हाट्सएप सहायता: +91 98765 43210";
        }
        if (q.includes('tractor') || q.includes('ट्रैक्टर') || q.includes('मशीनरी') || q.includes('किराया')) {
          return "🚜 ट्रैक्टर, रोटावेटर, कंबाइन हार्वेस्टर और स्प्रेयर किराए पर लेने के लिए हमारे 'मशीनरी किराया' पोर्टल पर जाएं जहां सत्यापित कस्टम हायरिंग केंद्रों से उपकरण बुक किए जा सकते हैं।";
        }
        if (q.includes('मजदूर') || q.includes('labour') || q.includes('majdoor')) {
          return "👥 फसल कटाई, बुवाई या छिड़काव के लिए सत्यापित मजदूर दल खोजने के लिए 'खेत मजदूर' अनुभाग देखें।";
        }
        if (q.includes('help') || q.includes('हेल्पलाइन') || q.includes('कॉल') || q.includes('नंबर')) {
          return "📞 किसान सहायता हेल्पलाइन:\n• टोल-फ्री किसान कॉल सेंटर: 1800-180-1551\n• आधिकारिक व्हाट्सएप डेस्क: +91 98765 43210\n• कार्य समय: सुबह 8:00 से रात 8:00 (सभी 7 दिन)";
        }
        return "नमस्ते! मैं AegroShield AI सहायक हूँ। फसल रोग, खाद की मात्रा, उन्नत बीज, ट्रैक्टर किराया, मजदूर और ताज़ा मंडी भाव के बारे में आप मुझसे पूछ सकते हैं।\n\nकिसान हेल्पलाइन: 1800-180-1551 / व्हाट्सएप: +91 98765 43210";
      }

      if (lang === 'en') {
        if (q.includes('mandi') || q.includes('bhav') || q.includes('rate') || q.includes('price')) {
          return "🌾 To check today's live APMC Mandi prices, please visit our '📈 Mandi Rates' portal where hourly verified rates are published.\n\nFor personalized crop advice, contact our Toll-Free Kisan Helpline: 1800-180-1551.";
        }
        if (q.includes('khad') || q.includes('fertilizer') || q.includes('urea') || q.includes('dap') || q.includes('pesticide')) {
          return "🌱 Apply balanced fertilizers (Urea, DAP, MOP) according to soil test and crop stage. Use our Smart Input Calculator to determine exact per-acre dosage or order certified batches from local agri-stores.\n\nWhatsApp Support: +91 98765 43210.";
        }
        if (q.includes('tractor') || q.includes('machinery') || q.includes('rent') || q.includes('harvester')) {
          return "🚜 To rent tractors, rotavators, sprayers, or combine harvesters, visit our '🚜 Machinery Rentals' portal to book from nearby verified Custom Hiring Centres (CHCs).";
        }
        if (q.includes('labour') || q.includes('labor') || q.includes('worker')) {
          return "👥 For harvesting, sowing, or chemical spraying squads, check our '👥 Farm Labour' board to hire verified agricultural teams.";
        }
        if (q.includes('help') || q.includes('helpline') || q.includes('call') || q.includes('contact')) {
          return "📞 24/7 Kisan Sahayata Helpline:\n• Toll-Free Kisan Helpline: 1800-180-1551 (Kisan Call Centre)\n• Official WhatsApp Helpdesk: +91 98765 43210\n• Operating Hours: 8:00 AM – 8:00 PM (Monday to Sunday)";
        }
        return "Hello! I am the AegroShield AI Assistant. You can ask me anything about crop diseases, fertilizer dosages, seed varieties, machinery rental, farm labour, and live APMC mandi rates.\n\nKisan Helpline: 1800-180-1551 / WhatsApp: +91 98765 43210";
      }

      // Default: Hinglish ('hi-en')
      if (q.includes('mandi') || q.includes('bhav') || q.includes('rate') || q.includes('price')) {
        return "🌾 Aaj ke taaza APMC Mandi rates dekhne ke liye aap hamare '📈 Mandi Rates' section par ja sakte hain jaha har ghante verify kiye gaye daam uplabdh hain.\n\nVishesh fasal ki jankari ke liye Kisan Helpline: 1800-180-1551 par call karein.";
      }
      if (q.includes('khad') || q.includes('fertilizer') || q.includes('urea') || q.includes('dap') || q.includes('dawa') || q.includes('pesticide')) {
        return "🌱 Fasal ke anusaar santulit khad (Urea, DAP, MOP) dalein. Prati acre uchit matra ke liye hamara Smart Input Calculator use karein ya local store se certified batch mangwayein.\n\nWhatsApp Sahayata: +91 98765 43210 par message karein.";
      }
      if (q.includes('tractor') || q.includes('kiraya') || q.includes('machinery') || q.includes('harvester')) {
        return "🚜 Tractor, Rotavator, Combine Harvester aur Sprayer kiraye par lene ke liye hamare '🚜 Machinery Rentals' portal par jayein jaha verified CHC centers se equipment book kiya ja sakta hai.";
      }
      if (q.includes('majdoor') || q.includes('labour') || q.includes('labor')) {
        return "👥 Fasal katai, buwai ya spraying ke liye verified majdoor squad book karne ke liye '👥 Farm Labour' section dekhein.";
      }
      if (q.includes('help') || q.includes('helpline') || q.includes('call') || q.includes('phone') || q.includes('contact')) {
        return "📞 Kisan Sahayata Helpline:\n• Toll-Free Helpline: 1800-180-1551 (Kisan Call Centre)\n• WhatsApp Helpdesk: +91 98765 43210\n• Timings: 8:00 AM – 8:00 PM (Somvaar se Ravivaar)";
      }
      return "Namaste! Main AegroShield AI Assistant hoon. Fasal bimari, khad ki matra, beej, tractor kiraya, majdoor aur mandi bhav ke baare me aap mujhse pooch sakte hain.\n\nKisan Helpline: 1800-180-1551 / WhatsApp: +91 98765 43210";
    };

    // 5. Initialize AI Client
    const ai = getGeminiClient();
    if (!ai) {
      return NextResponse.json({
        success: true,
        message: getFallbackAgriReply(lastUserQuery, userLanguage),
      });
    }

    const currentPage = context?.currentPage || 'Unknown Page';

    const languageInstruction =
      userLanguage === 'hi'
        ? `CRITICAL LANGUAGE DIRECTIVE: The user has chosen HINDI (हिन्दी).
You MUST reply ENTIRELY in pure Hindi using the Devanagari script (हिन्दी लिपि).
Do NOT output in English or Roman script.
Use clear, courteous, and accurate agricultural Hindi terms (e.g. फसल, खाद, यूरिया, डीएपी, बीज, कीटनाशक, रोग, मंडी भाव, सिंचाई, उपज).
Even if the user types in English or Roman Hinglish, you MUST formulate your entire response in pure Devanagari Hindi.`
        : userLanguage === 'en'
        ? `CRITICAL LANGUAGE DIRECTIVE: The user has chosen ENGLISH.
You MUST reply ENTIRELY in clear, fluent English.
Use proper agricultural English terminology and accurate dosage recommendations.`
        : `CRITICAL LANGUAGE DIRECTIVE: The user has chosen HINGLISH.
You MUST reply in natural, friendly Hinglish (Hindi written using the English alphabet).
For example: "Aapki gehu ki fasal me nitrogen ki kami lag rahi hai. 1 acre me 45 kg urea ka chhidkaw karein."
Keep tone respectful, encouraging, and easy to read.`;

    const systemPrompt = `You are Aegroshield Assistant, an AI expert and companion for Indian farmers, local agricultural vendors, and platform administrators.
PERSONALITY: Friendly, respectful, practical, farmer-first.

${languageInstruction}

NEVER show raw file names (like .html), paths, or URLs to the user in your messages. Always use friendly names for the pages (e.g., "Agri-Store", "Shopping Cart", "Seller Portal", "Admin Panel").

CONTEXT AWARENESS:
- User's current webpage: ${currentPage}
- District: ${context?.district || 'India'}
- Selected Platform Language: ${userLanguage}

YOUR CAPABILITIES (AGENT ACTIONS):
You have access to a tool called 'navigate_to_page'.
If the user asks to go somewhere, buy fertilizers/seeds/pesticides, check cart, checkout, register as a seller, or access admin master panel, CALL THE TOOL 'navigate_to_page':
- '/' (Home)
- '/marketplace' (Local Agri-Marketplace)
- '/cart' (Shopping Cart)
- '/checkout' (Checkout)
- '/vendor/dashboard' (Seller Dashboard)
- '/admin/dashboard' (Admin Panel)
- '/machinery' (Machinery Booking)
- '/labour' (Farm Labour Board)
- '/market' (Live Mandi Prices)
- '/calculator' (Fertilizer Calculator)

If you use a tool, you DO NOT need to output text, the system will handle the redirect. If just answering, KEEP IT concise (2-4 sentences), highly actionable, and tailored to Indian agricultural seasons.`;

    const tools = [{
      functionDeclarations: [
        {
          name: "navigate_to_page",
          description: "Navigates the user's browser to a specific module/page on the Aegroshield platform.",
          parameters: {
            type: "OBJECT",
            properties: {
              pageName: {
                type: "STRING",
                description: "The next.js route of the target page (e.g., '/login', '/marketplace', '/cart', '/checkout', '/vendor/dashboard', '/admin/dashboard', '/machinery', '/labour', '/market', '/calculator', '/')."
              }
            },
            required: ["pageName"]
          }
        }
      ]
    }];

    // Format messages for @google/genai
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts.map(p => ({ text: p.text.trim() })),
    }));

    let geminiRes;
    try {
      geminiRes = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: formattedMessages,
        config: {
          systemInstruction: systemPrompt,
          // @ts-ignore
          tools: tools,
          temperature: 0.2
        }
      });
    } catch (modelErr: any) {
      console.warn('[Chat] Gemini API error, falling back to local advisor:', modelErr?.message);
      return NextResponse.json({
        success: true,
        message: getFallbackAgriReply(lastUserQuery, userLanguage),
      });
    }

    if (geminiRes.functionCalls && geminiRes.functionCalls.length > 0) {
      const call = geminiRes.functionCalls[0];
      if (call.name === 'navigate_to_page') {
        const targetPage = (call.args as any).pageName;
        return NextResponse.json({ 
          success: true, 
          action: { type: 'navigate', target: targetPage },
          message: "Navigating you there right now..."
        });
      }
    }

    const assistantMessage = geminiRes.text;
    return NextResponse.json({ success: true, message: assistantMessage });
    
  } catch (error: any) {
    if (error instanceof HttpError) {
      return handleAuthError(error);
    }
    console.error('Chat endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Chat failed: ' + (error?.message || 'Internal server error') },
      { status: 500 }
    );
  }
}
