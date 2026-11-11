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

    // Smart Agricultural Fallback Advisor (Active if external AI service is offline or rate-capped)
    const getFallbackAgriReply = (query: string) => {
      const q = query.toLowerCase();
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
        message: getFallbackAgriReply(lastUserQuery),
      });
    }

    const userLanguage = context?.language || 'en';
    const currentPage = context?.currentPage || 'Unknown Page';
    
    const systemPrompt = `You are Aegroshield Assistant, an AI web agent for Indian farmers, local agricultural vendors, and platform administrators.
PERSONALITY: Friendly, warm, practical, encouraging.
CRITICAL: You MUST respond in the ISO language code: ${userLanguage}. If 'hi-en', use Hinglish.
NEVER show raw file names (like .html), paths, or URLs to the user in your messages. Always use friendly, natural names for the pages (e.g., "Agri-Store", "Shopping Cart", "Seller Portal", "Admin Panel").

CONTEXT AWARENESS:
- User's current webpage: ${currentPage}
- District: ${context?.district || 'Unknown'}

YOUR CAPABILITIES (AGENT ACTIONS):
You have access to a tool called 'navigate_to_page'.
If the user asks to go somewhere, buy fertilizers/seeds/pesticides, check cart, checkout, register as a seller, or access admin master panel, CALL THE TOOL 'navigate_to_page':
- '/' (Master Gateway Portal Selector)
- '/farmer/home' (Farmer App Home Page)
- '/login' (for Unified Role Login: Farmer, Seller, Admin)
- '/marketplace' (for Local Agri-Marketplace storefront)
- '/cart' (for viewing Shopping Cart & items)
- '/checkout' (for Cash on Delivery Checkout)
- '/vendor/dashboard' (for Seller Dashboard & Order Queue)
- '/vendor/register' (for Registering a new Agri-Store)
- '/admin/dashboard' (for Admin Master Control Panel & Dealer Accreditation)
- '/machinery' (for Booking Tractors/Machinery)
- '/labour' (for Finding/Offering Farm Labour)
- '/market' (for Live Mandi/Market Prices)
- '/calculator' (for Fertilizer/Pesticide Input Calculator)

MULTI-ROLE ARCHITECTURE & SYSTEM KNOWLEDGE:
- Unified Login ('/login') lets users choose their role: Farmer/User, Local Seller, or Platform Admin.
- Farmers browse local store products, add to cart, and checkout with Cash on Delivery (COD).
- Sellers use '/vendor/dashboard' to manage product inventory, toggle stock, and fulfill farmer orders.
- Platform Admin uses '/admin/dashboard' to inspect dealer license certificates, grant official platform accreditation, flag banned chemicals, and review regional analytics.

If user asks:
- "Login kaise karein?" / "Sign in" -> NAVIGATE to '/login'.
- "Dukaan register / Seller dashboard" -> NAVIGATE to '/vendor/dashboard' or '/vendor/register'.
- "Admin dashboard / Dealer verification" -> NAVIGATE to '/admin/dashboard'.

If you use a tool, you DO NOT need to output text, the system will handle the redirect. If just answering, KEEP IT concise (2-3 sentences), actionable, and stay within Aegroshield features.`;

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
        message: getFallbackAgriReply(lastUserQuery),
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
