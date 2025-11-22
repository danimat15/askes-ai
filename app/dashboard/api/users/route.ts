// askes-ai/app/api/users/route.ts
import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();

    if (!user || !user.primaryEmailAddress || !user.id) {
        return new Response("Unauthorized or missing user data", { status: 401 });
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.clerkId, user.id), // Use clerkId for query
    });

    if (existingUser) {
      return NextResponse.json(existingUser);
    }

    // If not, create a new user
    const newUser = await db.insert(users).values({
      clerkId: user.id, // Use Clerk's user.id
      name: user.fullName || `${user.firstName} ${user.lastName || ''}`, 
      email: user.primaryEmailAddress.emailAddress,
      // 'credits' has a default value in the schema
    }).returning();
    
    return NextResponse.json(newUser[0]);

  } catch (error) {
    console.error("Error in /dashboard/api/users:", error);
    return NextResponse.json({ error: "An internal error occurred." }, { status: 500 });
  }
}
