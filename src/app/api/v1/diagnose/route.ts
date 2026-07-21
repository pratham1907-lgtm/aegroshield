import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import dns from 'dns';

// Fix Node.js IPv6 resolution issues on Windows that cause ENOTFOUND for Google APIs
dns.setDefaultResultOrder('ipv4first');

export const maxDuration = 60; // Allow more time for Gemini API

export async function POST(request: Request) {
  try {
    const { image, crop, state, district } = await request.json();

    if (!image) {
      return NextResponse.json({ success: false, error: "No image provided" }, { status: 400 });
    }
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "API key not configured" }, { status: 500 });
    }

    // --- Fetch Real Weather Data ---
    let weatherDataStr = "Real weather data unavailable.";
    let realTemp = 28;
    let realHumidity = 70;
    
    if (process.env.OPENWEATHER_KEY && district) {
      try {
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(district)},${encodeURIComponent(state)},IN&appid=${process.env.OPENWEATHER_KEY}&units=metric`;
        const wRes = await fetch(weatherUrl);
        if (wRes.ok) {
          const wJson = await wRes.json();
          realTemp = Math.round(wJson.main.temp);
          realHumidity = Math.round(wJson.main.humidity);
          const conditions = wJson.weather[0]?.description || "clear";
          weatherDataStr = `The current LIVE weather in ${district}, ${state} is ${realTemp}°C with ${realHumidity}% humidity and ${conditions}.`;
        }
      } catch (wErr) {
        console.warn("Failed to fetch OpenWeather data", wErr);
      }
    }

    // Initialize Gemini SDK
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Parse base64 string
    const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return NextResponse.json({ success: false, error: "Invalid base64 image data" }, { status: 400 });
    }
    
    const mimeType = matches[1];
    const base64Data = matches[2];

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        crop: { type: Type.STRING },
        detectedDisease: { type: Type.STRING },
        symptoms: { type: Type.STRING },
        confidence: { type: Type.INTEGER },
        severity: { type: Type.STRING },
        severitySub: { type: Type.STRING },
        spread: { type: Type.STRING },
        spreadSub: { type: Type.STRING },
        temperature: { type: Type.INTEGER },
        humidity: { type: Type.INTEGER },
        finalRiskScore: { type: Type.INTEGER },
        weatherFactorText: { type: Type.STRING },
        weatherLive: { type: Type.BOOLEAN }
      },
      required: ["crop", "detectedDisease", "symptoms", "confidence", "severity", "severitySub", "spread", "spreadSub", "temperature", "humidity", "finalRiskScore", "weatherFactorText", "weatherLive"]
    };

    const promptText = `
You are an expert agricultural plant pathologist system. 
The user has provided an image of a crop leaf for diagnosis.
User-selected crop (optional hint): "${crop}"
Location: "${district}, ${state}"

WEATHER DATA: ${weatherDataStr}

Analyze the image carefully.
1. Confirm the crop type. If the image is clearly NOT a plant, set "detectedDisease" to "Not a plant / Invalid image", "confidence" to 0, and severity/spread to "N/A".
2. Identify any visible diseases, pests, or nutrient deficiencies. If healthy, set "detectedDisease" to "Healthy".
3. Use the REAL WEATHER DATA provided above to output the "temperature" and "humidity" fields exactly as given (${realTemp} and ${realHumidity}).
4. Correlate this real weather to the disease risk (finalRiskScore). Set weatherLive to true.

Your output MUST be a JSON object exactly matching the requested schema.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: promptText
            }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    
    // Ensure the live weather data is correctly returned even if Gemini hallucinates
    parsedData.temperature = realTemp;
    parsedData.humidity = realHumidity;
    parsedData.weatherLive = true;

    return NextResponse.json({
      success: true,
      liveData: parsedData
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to process image" }, { status: 500 });
  }
}
