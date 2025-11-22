import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware({
  // The landing page and sign-in/up pages are public.
  // The Clerk webhook is also public.
  publicRoutes: ["/", "/sign-in", "/sign-up", "/api/webhooks/clerk"],
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};