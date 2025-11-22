// askes-ai/drizzle/schema.ts
import { pgTable, bigserial, text, timestamp, integer, jsonb } from "drizzle-orm/pg-core";

// Define the users table
export const users = pgTable("users", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  clerkId: text("clerk_id").notNull().unique(), // Clerk User ID
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  credits: integer("credits").default(10).notNull(), 
  createdAt: timestamp("created_at").defaultNow(),
});

// Define the consultation_sessions table
export const consultation_sessions = pgTable("consultation_sessions", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  sessionId: text("session_id").notNull().unique(), // Unique ID for each session
  createdBy: text("created_by").notNull(), // Stores the clerkId of the user
  notes: text("notes"), // User's initial symptoms/notes
  selectedDoctor: jsonb("selected_doctor").notNull(), // JSON object of the selected AI doctor agent
  conversation: jsonb("conversation"), // Full conversation transcript (text and/or image data)
  report: jsonb("report"), // Generated medical report in JSON format
  createdAt: timestamp("created_at").defaultNow(),
});
