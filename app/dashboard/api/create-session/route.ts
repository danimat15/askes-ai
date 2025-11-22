// askes-ai/app/api/create-session/route.ts
import { db } from '@/lib/db';
import { consultation_sessions } from '@/drizzle/schema';
import { currentUser } from '@clerk/nextjs/server'; // Use currentUser
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const user = await currentUser(); // Get the full user object

    if (!user || !user.id) { // Check for user existence and ID
      console.log("Rejecting session creation: No authenticated user found.");
      return new Response("Unauthorized", { status: 401 });
    }

    const { selectedAgent, notes } = await req.json();

    if (!selectedAgent || !notes) {
      return NextResponse.json({ error: 'Selected agent and notes are required.' }, { status: 400 });
    }

    const sessionId = crypto.randomUUID();
    
    // Insert new session into the database
    const newSession = await db.insert(consultation_sessions).values({
      sessionId: sessionId,
      createdBy: user.id, // Use Clerk's user.id for createdBy
      notes: notes,
      selectedDoctor: selectedAgent, // Store the full agent object as JSON
    }).returning({ sessionId: consultation_sessions.sessionId, id: consultation_sessions.id });

    // Assuming newSession will have at least one element with the inserted session ID
    if (newSession.length > 0) {
      return NextResponse.json({ sessionId: newSession[0].sessionId, dbId: newSession[0].id });
    } else {
      return NextResponse.json({ error: 'Failed to create session in database.' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
