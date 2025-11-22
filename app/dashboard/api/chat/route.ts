// askes-ai/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { ai } from '@/config/model'; // Import the centralized AI client

import 'dotenv/config';

// The GOOGLE_API_KEY check is now handled in lib/model.ts
// if (!process.env.GOOGLE_API_KEY) {
//   throw new Error('GOOGLE_API_KEY is not set in the .env file.');
// }

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Remove direct instantiation

export async function POST(req: Request) {
  try {
    const { prompt, image } = await req.json();

    let model;
    let chat;
    let response;

    if (image) {
      // Use Gemini Pro Vision for multimodal input
      model = ai.getGenerativeModel({ model: "gemini-pro-vision" }); // Use ai.getGenerativeModel
      
      const imageParts = [
        {
          inlineData: {
            data: image.split(',')[1], // Extract base64 part
            mimeType: image.split(',')[0].split(':')[1].split(';')[0], // Extract mime type
          },
        },
      ];

      // For multimodal, sendMessage expects content parts directly, not chat history through startChat.
      // For a single turn, we send the prompt and image parts together.
      response = await model.generateContent([prompt, ...imageParts]);
      
    } else {
      // Use Gemini Pro for text-only input
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      chat = model.startChat({
        history: [], // For a single turn, history might be empty or managed client-side
      });
      response = await chat.sendMessage(prompt);
    }

    const textResponse = response.response.text();
    return NextResponse.json({ response: textResponse });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Failed to get response from Gemini' }, { status: 500 });
  }
}
