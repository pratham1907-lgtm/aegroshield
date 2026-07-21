import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Instantiate Gemini SDK client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();
    const userLanguage = context?.language || 'en';
    const currentPage = context?.currentPage || 'Unknown Page';
    
    const systemPrompt = `You are Aegroshield Assistant, an AI web agent for Indian farmers.
PERSONALITY: Friendly, warm, practical, encouraging.
CRITICAL: You MUST respond in the ISO language code: ${userLanguage}. If 'hi-en', use Hinglish.
NEVER show raw file names (like .html), paths, or URLs to the user in your messages. Always use friendly, natural names for the pages (e.g., "Machinery Booking", "Crop Diagnosis").

CONTEXT AWARENESS:
- User's current webpage: ${currentPage}
- Crop context: ${context?.crop || 'Unknown'}
- District: ${context?.district || 'Unknown'}

YOUR CAPABILITIES (AGENT ACTIONS):
You have access to a tool called 'navigate_to_page'. 
If the user asks to go somewhere, rent something, check prices, or access a specific feature, DO NOT just tell them to click a link. Instead, CALL THE TOOL 'navigate_to_page' with the corresponding page name:
- '/predict' (for Crop Disease Diagnosis)
- '/machinery' (for Booking Tractors/Machinery)
- '/labour' (for Finding/Offering Farm Labour)
- '/market' (for Live Market Prices)
- '/calculator' (for Fertilizer/Pesticide Input Calculator)
- '/' (Home page)

If you use a tool, you DO NOT need to output text, the system will handle the redirect. If you are just answering a question without navigating, KEEP IT concise (2-3 sentences), actionable, and stay within Aegroshield features.`;

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
                description: "The next.js route of the target page (e.g., '/predict', '/machinery', '/labour', '/market', '/calculator', '/')."
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
        temperature: 0.2 // Lower temp for more reliable tool calling
      }
    });

    // Check if the model decided to call a function
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

    // Standard text response fallback
    const assistantMessage = geminiRes.text;
    return NextResponse.json({ success: true, message: assistantMessage });
    
  } catch (error: any) {
    console.error('Chat endpoint error:', error);
    return NextResponse.json({ success: false, error: 'Chat failed: ' + error.message }, { status: 500 });
  }
}
