// askes-ai/lib/model.ts
import { GoogleGenerativeAI } from '@google/generative-ai'; // Correct import for installed package

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY is not set in the .env file.');
}

export const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
