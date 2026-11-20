import { createClerkClient } from "@clerk/backend";

export const clerkClient = createClerkClient({
	secretKey: process.env.CLERK_SECRET_KEY,
	publishableKey: process.env.BUN_PUBLIC_CLERK_PUBLISHABLE_KEY,
});
