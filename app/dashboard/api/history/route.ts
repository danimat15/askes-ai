// askes-ai/app/api/history/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { consultation_sessions } from '@/drizzle/schema';
import { currentUser } from '@clerk/nextjs/server'; // Use currentUser

export async function GET(req: Request) {
  try {
    const user = await currentUser(); // Get the full user object
    console.log("Attempting to fetch history for user:", user?.id); // Debugging log

    if (!user || !user.id) { // Check for user existence and ID
      console.log("Rejecting request: No authenticated user found."); // Debugging log
      return new Response("Unauthorized", { status: 401 });
    }

    const sessions = await db.query.consultation_sessions.findMany({
      where: eq(consultation_sessions.createdBy, user.id), // Use user.id for createdBy
      orderBy: [desc(consultation_sessions.createdAt)],
    });

    return NextResponse.json(sessions);

  } catch (error) {
    console.error('Error fetching history:', error);
    return NextResponse.json({ error: 'Failed to fetch consultation history' }, { status: 500 });
  }
}
