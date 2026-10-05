import { clerkClient, getAuth } from "@clerk/express";
import { ORPCError, os } from "@orpc/server";
import { eq } from "drizzle-orm";
import type { Request } from "express";
import db from "./drizzle/db.ts";
import * as schema from "./drizzle/schema.ts";

export const upsertClerkUser = async ({
	clerkId,
	email,
	firstName,
	lastName,
}: {
	clerkId: string;
	email: string | null;
	firstName: string | null;
	lastName: string | null;
}) => {
	const [user] = await db
		.insert(schema.users)
		.values({
			clerk_id: clerkId,
			email,
			first_name: firstName,
			last_name: lastName,
		})
		.onConflictDoUpdate({
			target: schema.users.clerk_id,
			set: {
				email,
				first_name: firstName,
				last_name: lastName,
			},
		})
		.returning();

	return user;
};

export const base = os.$context<{ req: Request }>();

const requireAuth = base.middleware(async ({ context, next }) => {
	const { isAuthenticated, userId } = getAuth(context.req);

	if (!isAuthenticated) {
		throw new ORPCError("UNAUTHORIZED");
	}

	const [userInDb] = await db
		.select()
		.from(schema.users)
		.where(eq(schema.users.clerk_id, userId));

	if (!userInDb) {
		const clerkUser = await clerkClient.users.getUser(userId);
		await upsertClerkUser({
			clerkId: clerkUser.id,
			email: clerkUser.emailAddresses[0].emailAddress,
			firstName: clerkUser.firstName,
			lastName: clerkUser.lastName,
		});
	}

	return next({ context: { clerkId: userId } });
});

export const authed = base.use(requireAuth);
