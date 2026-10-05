import { clerkClient } from "@clerk/express";
import { eq } from "drizzle-orm";
import db from "../../drizzle/db.ts";
import * as schema from "../../drizzle/schema.ts";
import { authed } from "../../orpc.ts";

export const accountRouter = {
	remove: authed.handler(async ({ context }) => {
		await db
			.delete(schema.users)
			.where(eq(schema.users.clerk_id, context.clerkId));
		await clerkClient.users.deleteUser(context.clerkId);
	}),
};
