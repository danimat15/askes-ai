// askes-ai/app/api/suggest-specialist/route.ts
import { NextResponse } from 'next/server';
import { aiAgents, Agent } from '@/lib/agents';
import { ai } from '@/config/model'; // Import the centralized AI client

import 'dotenv/config';

// The GOOGLE_API_KEY check is now handled in lib/model.ts
// if (!process.env.GOOGLE_API_KEY) {
//   throw new Error('GOOGLE_API_KEY is not set in the .env file.');
// }

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Remove direct instantiation

export async function POST(req: Request) {
  try {
    const { symptoms } = await req.json();

    if (!symptoms) {
      return NextResponse.json({ error: 'Symptoms are required.' }, { status: 400 });
    }

    const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use ai.getGenerativeModel

    const specialistList = aiAgents.map(agent => ({
      id: agent.id,
      specialization: agent.specialization,
      description: agent.description,
    }));

    // Following the ai-agent-bps prompting strategy
    const response = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            { text: `System context: ${JSON.stringify(specialistList)}` }
          ]
        },
        {
          role: "user",
          parts: [
            { text: `User question: ${symptoms}. Based on this question, please suggest a ranked list of agent IDs. Return an object in JSON format only with a key "suggested_agent_ids", for example: {"suggested_agent_ids": [2, 1]}` }
          ]
        }
      ],
    });

    const rawResp = response.response.text();
    console.log("Gemini Raw Response:", rawResp);

    const cleanedResp = rawResp.trim().replace(/```json|```/g, "").trim();
    
    let parsedResponse: any;
    try {
      parsedResponse = JSON.parse(cleanedResp);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", cleanedResp);
      throw new Error("Gagal parsing JSON dari Gemini: " + cleanedResp);
    }

    const suggestedIds = parsedResponse.suggested_agent_ids;

    if (!Array.isArray(suggestedIds)) {
      throw new Error(`Model returned an invalid response format.`);
    }

    const suggestedAgents = suggestedIds
      .map(id => aiAgents.find(agent => agent.id === id))
      .filter((agent): agent is Agent => agent !== undefined);

    if (suggestedAgents.length === 0) {
      const fallbackAgent = aiAgents.find(agent => agent.id === 1);
      return NextResponse.json({ suggestedAgents: fallbackAgent ? [fallbackAgent] : [] });
    }

    return NextResponse.json({ suggestedAgents });

  } catch (error: any) {
    console.error('Error in suggest-specialist API:', error.message);
    return NextResponse.json({ error: `Failed to get suggestion from Gemini: ${error.message}` }, { status: 500 });
  }
}
