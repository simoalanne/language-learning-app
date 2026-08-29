import { clerkClient, getAuth } from "@clerk/express";
import type { ExtendedExpressMiddleware } from "@rest-rpc/express";
import { eq } from "drizzle-orm";
import db from "../drizzle/db.ts";
import * as schema from "../drizzle/schema.ts";
import { upsertClerkUser } from "../integrations/clerk/clerk.webhook.ts";

declare global {
	namespace Express {
		interface Request {
			clerkId: string;
		}
	}
}

export const attachClerkId: ExtendedExpressMiddleware = async (
	req,
	res,
	next,
	route,
) => {
	if (route.metadata?.requiresAuth !== true) return next();

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
};
