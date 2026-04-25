import { verifyWebhook } from "@clerk/express/webhooks";
import { eq } from "drizzle-orm";
import type { Express, Request, Response } from "express";
import express from "express";
import db from "../../drizzle/db.ts";
import * as schema from "../../drizzle/schema.ts";

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

const deleteClerkUser = async (clerkId: string) => {
	await db.delete(schema.users).where(eq(schema.users.clerk_id, clerkId));
};

const handleClerkWebhook = async (req: Request, res: Response) => {
	try {
		const event = await verifyWebhook(req);

		if (event.type === "user.created" || event.type === "user.updated") {
			await upsertClerkUser({
				clerkId: event.data.id,
				email: event.data.email_addresses[0]?.email_address ?? null,
				firstName: event.data.first_name ?? null,
				lastName: event.data.last_name ?? null,
			});

			return res.status(200).json({ received: true });
		}

		if (event.type === "user.deleted" && event.data.id) {
			await deleteClerkUser(event.data.id);
			return res.status(200).json({ received: true });
		}

		return res.status(200).json({ ignored: true });
	} catch (error) {
		console.error("Clerk webhook verification failed:", error);
		return res.status(400).json({ error: "Invalid webhook signature" });
	}
};

export const mountClerkWebhook = (app: Express) => {
	app.post(
		"/api/auth/clerk/webhooks",
		express.raw({ type: "application/json" }),
		handleClerkWebhook,
	);
};
