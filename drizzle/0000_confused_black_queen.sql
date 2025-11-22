CREATE TABLE "consultation_sessions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"created_by" text NOT NULL,
	"notes" text,
	"selected_doctor" jsonb NOT NULL,
	"conversation" jsonb,
	"report" jsonb,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "consultation_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"credits" integer DEFAULT 10 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
