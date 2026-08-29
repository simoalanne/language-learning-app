import { clerkClient } from "@clerk/express";
import { contracts } from "@language-learning-app/contracts";
import { registerRoutes, router } from "@rest-rpc/express";
import { eq } from "drizzle-orm";
import { Router } from "express";
import db from "../../drizzle/db.ts";
import * as schema from "../../drizzle/schema.ts";
import { attachClerkId } from "../../middleware/attachClerkId.ts";

const accountService = router(contracts.account, {
	remove: async ({ context }) => {
		const clerkId = context.req.clerkId;

		await db.delete(schema.users).where(eq(schema.users.clerk_id, clerkId));
		await clerkClient.users.deleteUser(clerkId);
	},
});

export const accountRouter = Router();

registerRoutes(accountRouter, accountService, {
	middleware: [attachClerkId],
});
