// askes-ai/app/api/session/[sessionId]/route.ts
import { currentUser } from '@clerk/nextjs/server'; // Use currentUser

export async function GET(req: Request, { params }: { params: { sessionId: string } }) {
  try {
    const { sessionId } = params;
    const user = await currentUser(); // Get the full user object

    if (!user || !user.id) { // Check for user existence and ID
      return new Response("Unauthorized", { status: 401 });
    }
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required.' }, { status: 400 });
    }

    const session = await db.query.consultation_sessions.findFirst({
      where: eq(consultation_sessions.sessionId, sessionId),
    });

    // Ensure the fetched session belongs to the authenticated user
    if (!session || session.createdBy !== user.id) { // Use user.id for comparison
        return new Response("Session not found or unauthorized access", { status: 404 });
    }

    return NextResponse.json(session);

  } catch (error) {
    console.error('Error fetching session details:', error);
    return NextResponse.json({ error: 'Failed to fetch session details' }, { status: 500 });
  }
}
