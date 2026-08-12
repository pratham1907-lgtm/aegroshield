import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Instantiate Gemini SDK client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
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

    const geminiRes = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: messages,
      config: {
        systemInstruction: systemPrompt,
        // @ts-ignore
        tools: tools,
        temperature: 0.2
      }
    });

    if (geminiRes.functionCalls && geminiRes.functionCalls.length > 0) {
      const call = geminiRes.functionCalls[0];
      if (call.name === 'navigate_to_page') {
        const targetPage = (call.args as any).pageName;
        console.log(`Agent triggered navigation to: ${targetPage}`);
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
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ success: false, error: 'Chat failed: ' + error.message }, { status: 500 });
  }
}
