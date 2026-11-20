import { eq } from "drizzle-orm";
import { clerkClient } from "../../clerk.ts";
import * as schema from "../../drizzle/schema.ts";
import { authed } from "../../rest-rpc.ts";

export const accountRouter = {
	remove: authed.handler(async ({ context }) => {
		await context.db
			.delete(schema.users)
			.where(eq(schema.users.clerk_id, context.clerkId));
		await clerkClient.users.deleteUser(context.clerkId);
	}),
};
