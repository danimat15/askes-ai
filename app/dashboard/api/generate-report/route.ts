// askes-ai/app/api/generate-report/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { consultation_sessions } from '@/drizzle/schema';
import { ai } from '@/config/model'; // Import the centralized AI client
import { eq } from 'drizzle-orm';
import 'dotenv/config';

// The GOOGLE_API_KEY check is now handled in lib/model.ts
// if (!process.env.GOOGLE_API_KEY) {
//     throw new Error('GOOGLE_API_KEY is not set in the .env file.');
// }

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY); // Remove direct instantiation

export async function POST(req: Request) {
    try {
        const { sessionId, conversation } = await req.json();

        if (!sessionId || !conversation) {
            return NextResponse.json({ error: 'Session ID and conversation are required.' }, { status: 400 });
        }

        // Fetch session details to get the selected doctor's prompt and user notes
        const sessionDetails = await db.query.consultation_sessions.findFirst({
            where: eq(consultation_sessions.sessionId, sessionId),
        });

        if (!sessionDetails) {
            return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
        }

        const selectedDoctor = sessionDetails.selectedDoctor as any; // Cast to any to access properties
        const userNotes = sessionDetails.notes;

        const model = ai.getGenerativeModel({ model: "gemini-1.5-flash" }); // Use ai.getGenerativeModel

        const prompt = `
            Anda adalah asisten AI yang bertugas membuat laporan konsultasi medis.
            Berikut adalah detail sesi konsultasi:
            - Catatan Awal Pasien: "${userNotes}"
            - Spesialis yang Dikonsultasikan: "${selectedDoctor.specialization}" (${selectedDoctor.name})
            - Prompt Sistem Spesialis: "${selectedDoctor.prompt}"
            - Transkrip Percakapan: ${JSON.stringify(conversation, null, 2)}

            Harap buat laporan medis terstruktur dalam format JSON, meliputi poin-poin berikut:
            {
                "chief_complaint": "Keluhan utama pasien",
                "summary_of_conversation": "Ringkasan singkat dari percakapan",
                "identified_symptoms": ["Daftar gejala yang teridentifikasi"],
                "possible_conditions": ["Kemungkinan kondisi/diagnosis (jika relevan)"],
                "medication_mentioned": ["Obat yang disebutkan/disarankan (jika ada)"],
                "recommendations": ["Saran umum, misalnya istirahat, hidrasi, pantau gejala, konsultasi lebih lanjut"],
                "disclaimer": "Laporan ini dihasilkan oleh AI dan bukan merupakan diagnosis medis. Selalu konsultasikan dengan profesional kesehatan untuk diagnosis dan penanganan yang tepat."
            }
            
            Pastikan output Anda HANYA berupa JSON.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Attempt to parse the response, handling markdown fences
        const cleanResponseText = responseText.replace(/```json|```/g, '').trim();
        const generatedReport = JSON.parse(cleanResponseText);

        // Update the session in the database
        await db.update(consultation_sessions)
            .set({ report: generatedReport, conversation: conversation })
            .where(eq(consultation_sessions.sessionId, sessionId));

        return NextResponse.json({ success: true, report: generatedReport });

    } catch (error) {
        console.error('Error in generate-report API:', error);
        return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
    }
}
