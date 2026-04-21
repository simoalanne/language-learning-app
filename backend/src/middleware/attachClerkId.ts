import { clerkClient, getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import db from "../drizzle/db.ts";
import * as schema from "../drizzle/schema.ts";
import { defineMiddleware } from "../initServives.ts";
import { upsertClerkUser } from "../integrations/clerk/clerk.webhook.ts";

declare global {
	namespace Express {
		interface Request {
			clerkId: string;
		}
	}
}

export const attachClerkId = defineMiddleware(async (req, res, next) => {
	if (!req.contract.meta?.requiresAuth) return next();

	const { isAuthenticated, userId } = getAuth(req);

	if (!isAuthenticated) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}

	const [userInDb] = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.clerk_id, userId));

	if (userInDb) {
		req.clerkId = userId;
		return next();
	}

	const clerkUser = await clerkClient.users.getUser(userId);
	await upsertClerkUser({
		clerkId: clerkUser.id,
		email: clerkUser.emailAddresses[0].emailAddress,
		firstName: clerkUser.firstName,
		lastName: clerkUser.lastName,
	});
	req.clerkId = userId;
	next();
});
