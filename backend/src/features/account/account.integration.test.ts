import "dotenv/config";
import assert from "node:assert/strict";
import { after, afterEach, beforeEach, describe, test } from "node:test";
import { clerkClient } from "@clerk/express";
import { eq } from "drizzle-orm";
import request from "supertest";
import app from "../../app.ts";
import db, { pool } from "../../drizzle/db.ts";
import * as schema from "../../drizzle/schema.ts";

const createdClerkUserIds = new Set<string>();

const deleteClerkUserIfPresent = async (userId: string) => {
	try {
		await clerkClient.users.deleteUser(userId);
	} catch {
		// Treat an already-deleted user as successful cleanup.
	}
};

describe("account deletion", () => {
	let clerkUserId: string | null = null;

	beforeEach(() => {
		clerkUserId = null;
	});

	afterEach(async () => {
		if (!clerkUserId) {
			return;
		}

		await db.delete(schema.users).where(eq(schema.users.clerk_id, clerkUserId));
		await deleteClerkUserIfPresent(clerkUserId);
		createdClerkUserIds.delete(clerkUserId);
	});

	after(async () => {
		await Promise.all([...createdClerkUserIds].map(deleteClerkUserIfPresent));
		await pool.end();
	});

	test("deletes the authenticated account from the app database and Clerk", async () => {
		const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		const emailAddress = `account-delete-${testRunId}@example.com`;
		const password = `Account-delete-${testRunId}-pass1`;
		const clerkUser = await clerkClient.users.createUser({
			emailAddress: [emailAddress],
			firstName: "Delete",
			lastName: "Integration",
			password,
			skipPasswordChecks: true,
		});
		clerkUserId = clerkUser.id;
		createdClerkUserIds.add(clerkUser.id);

		const session = await clerkClient.sessions.createSession({
			userId: clerkUser.id,
		});
		const token = await clerkClient.sessions.getToken(session.id);

		await request(app)
			.post("/api/word-groups/users")
			.set("Authorization", `Bearer ${token.jwt}`)
			.send({
				translations: [
					{ languageName: "English", word: "hello" },
					{ languageName: "Finnish", word: "hei" },
				],
				tags: ["integration-test"],
			})
			.expect(201);

		const usersBeforeDeletion = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.clerk_id, clerkUser.id));
		assert.equal(usersBeforeDeletion.length, 1);

		const wordGroupsBeforeDeletion = await db
			.select()
			.from(schema.word_groups)
			.where(eq(schema.word_groups.user_id, clerkUser.id));
		assert.equal(wordGroupsBeforeDeletion.length, 1);

		await request(app)
			.delete("/api/account")
			.set("Authorization", `Bearer ${token.jwt}`)
			.expect(204);

		const usersAfterDeletion = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.clerk_id, clerkUser.id));
		assert.equal(usersAfterDeletion.length, 0);

		const wordGroupsAfterDeletion = await db
			.select()
			.from(schema.word_groups)
			.where(eq(schema.word_groups.user_id, clerkUser.id));
		assert.equal(wordGroupsAfterDeletion.length, 0);

		await assert.rejects(() => clerkClient.users.getUser(clerkUser.id));
		createdClerkUserIds.delete(clerkUser.id);
	});
});
