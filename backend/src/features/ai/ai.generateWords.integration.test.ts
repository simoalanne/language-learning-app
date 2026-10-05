import "dotenv/config";
import assert from "node:assert/strict";
import type { AddressInfo } from "node:net";
import { after, before, beforeEach, describe, mock, test } from "node:test";
import { clerkClient } from "@clerk/express";
import { createORPCClient, isDefinedError } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { MockLanguageModelV4 } from "ai/test";
import { eq } from "drizzle-orm";
import type { AppRouter } from "../../router.ts";

// Read at module load by ai.router.ts, so it must be set before the app is imported.
const generationLimit = 2;
process.env.AI_GENERATION_LIMIT = String(generationLimit);

type StreamPart = Record<string, unknown> & { type: string };

/** What the mocked model streams for the current test. */
let modelStream: (abortSignal?: AbortSignal) => ReadableStream<StreamPart>;

const model = new MockLanguageModelV4({
	doStream: async ({ abortSignal }) => ({
		stream: modelStream(abortSignal) as never,
	}),
});

mock.module(new URL("./ai.model.ts", import.meta.url).href, {
	namedExports: { languageModel: model, missingModelConfigMessage: "" },
});

const { default: app } = await import("../../app.ts");
const { default: db, pool } = await import("../../drizzle/db.ts");
const schema = await import("../../drizzle/schema.ts");

const usage = {
	inputTokens: { total: 1, noCache: 1, cacheRead: 0, cacheWrite: 0 },
	outputTokens: { total: 1, text: 1, reasoning: 0 },
};

const word = (english: string, finnish: string) => ({
	translations: [
		{ languageName: "English", word: english },
		{ languageName: "Finnish", word: finnish },
	],
});

const words = [
	word("bread", "leipä"),
	word("milk", "maito"),
	word("cheese", "juusto"),
];

const textStart: StreamPart[] = [
	{ type: "stream-start", warnings: [] },
	{ type: "text-start", id: "text" },
];
const delta = (text: string): StreamPart => ({
	type: "text-delta",
	id: "text",
	delta: text,
});
const textFinish: StreamPart[] = [
	{ type: "text-end", id: "text" },
	{ type: "finish", finishReason: { unified: "stop", raw: "stop" }, usage },
];

const streamOf = (parts: StreamPart[]) =>
	new ReadableStream<StreamPart>({
		start(controller) {
			for (const part of parts) controller.enqueue(part);
			controller.close();
		},
	});

/** Streams the given parts, then stays open until the request is aborted. */
const hangingStreamOf = (parts: StreamPart[]) => (abortSignal?: AbortSignal) =>
	new ReadableStream<StreamPart>({
		start(controller) {
			for (const part of parts) controller.enqueue(part);
			abortSignal?.addEventListener("abort", () =>
				controller.error(abortSignal.reason),
			);
		},
	});

const input = {
	topic: "food",
	skillLevel: "beginner",
	wordCount: words.length,
	wordTypes: [],
	includedLanguages: ["English", "Finnish"] as ("English" | "Finnish")[],
};

describe("ai.generateWords streaming", () => {
	const server = app.listen(0);
	let clerkUserId: string;
	let client: RouterClient<AppRouter>;

	const getUser = async () => {
		const [user] = await db
			.select()
			.from(schema.users)
			.where(eq(schema.users.clerk_id, clerkUserId));
		return user;
	};

	const getGenerations = () =>
		db
			.select()
			.from(schema.ai_generations)
			.where(eq(schema.ai_generations.user_id, clerkUserId));

	/** Consumes the stream, optionally stopping early, and captures any error. */
	const generate = async (stopAfter?: number) => {
		const received: unknown[] = [];
		const controller = new AbortController();
		try {
			const stream = await client.ai.generateWords(input, {
				signal: controller.signal,
			});
			for await (const generated of stream) {
				received.push(generated);
				if (received.length === stopAfter) {
					controller.abort();
					break;
				}
			}
			return { received, error: undefined };
		} catch (error) {
			return { received, error };
		}
	};

	before(async () => {
		const testRunId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		const clerkUser = await clerkClient.users.createUser({
			emailAddress: [`ai-generate-${testRunId}@example.com`],
			firstName: "Generate",
			lastName: "Integration",
			password: `Ai-generate-${testRunId}-pass1`,
			skipPasswordChecks: true,
		});
		clerkUserId = clerkUser.id;
		const session = await clerkClient.sessions.createSession({
			userId: clerkUser.id,
		});

		const { port } = server.address() as AddressInfo;
		client = createORPCClient(
			new RPCLink({
				origin: `http://localhost:${port}`,
				url: "/rpc",
				// Session tokens are short-lived, so fetch a fresh one per request.
				headers: async () => {
					const token = await clerkClient.sessions.getToken(session.id);
					return { authorization: `Bearer ${token.jwt}` };
				},
			}),
		);

		// The auth middleware creates the local user row on first request.
		await client.ai.getUsage();
	});

	beforeEach(async () => {
		await db
			.delete(schema.ai_generations)
			.where(eq(schema.ai_generations.user_id, clerkUserId));
		await db
			.update(schema.users)
			.set({
				ai_generation_count: 0,
				ai_generation_reset_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
			})
			.where(eq(schema.users.clerk_id, clerkUserId));
	});

	after(async () => {
		await db.delete(schema.users).where(eq(schema.users.clerk_id, clerkUserId));
		await clerkClient.users.deleteUser(clerkUserId).catch(() => {});
		server.close();
		await pool.end();
	});

	test("streams each word as it is generated and saves the generation", async () => {
		modelStream = () =>
			streamOf([
				...textStart,
				delta('{"elements":['),
				...words.flatMap((w, i) => [
					delta(i > 0 ? "," : ""),
					delta(JSON.stringify(w)),
				]),
				delta("]}"),
				...textFinish,
			]);

		const { received, error } = await generate();

		assert.equal(error, undefined);
		assert.deepEqual(
			received,
			words.map((w, i) => ({ id: i + 1, ...w })),
		);

		const generations = await getGenerations();
		assert.equal(generations.length, 1);
		assert.deepEqual(generations[0].response_data, received);
		assert.equal((await getUser()).ai_generation_count, 1);
	});

	test("keeps words already sent when the client disconnects mid-stream", async () => {
		modelStream = hangingStreamOf([
			...textStart,
			delta('{"elements":['),
			delta(JSON.stringify(words[0])),
			delta(","),
			delta('{"translations":[{"languageName":"Eng'),
		]);

		const { received, error } = await generate(1);

		assert.equal(error, undefined);
		assert.deepEqual(received, [{ id: 1, ...words[0] }]);

		// The server notices the disconnect asynchronously; wait for the save.
		let generations = await getGenerations();
		for (let i = 0; i < 50 && generations.length === 0; i++) {
			await new Promise((resolve) => setTimeout(resolve, 100));
			generations = await getGenerations();
		}
		assert.equal(generations.length, 1);
		assert.deepEqual(generations[0].response_data, received);
		assert.equal((await getUser()).ai_generation_count, 1);
	});

	test("refunds quota and saves nothing when the provider fails mid-stream", async () => {
		modelStream = () =>
			streamOf([
				...textStart,
				delta('{"elements":['),
				delta(JSON.stringify(words[0])),
				// elementStream emits an element only once the next one has started.
				delta(',{"translations":[{"languageName":"Eng'),
				{ type: "error", error: new Error("provider exploded") },
			]);

		const { received, error } = await generate();

		assert.deepEqual(received, [{ id: 1, ...words[0] }]);
		assert.ok(isDefinedError(error), `expected defined error, got ${error}`);
		assert.equal(error.code, "AI_PROVIDER_UNAVAILABLE");
		assert.equal((await getGenerations()).length, 0);
		assert.equal((await getUser()).ai_generation_count, 0);
	});

	test("refunds quota when the provider returns no words", async () => {
		modelStream = () =>
			streamOf([...textStart, delta('{"elements":[]}'), ...textFinish]);

		const { received, error } = await generate();

		assert.deepEqual(received, []);
		assert.ok(isDefinedError(error), `expected defined error, got ${error}`);
		assert.equal(error.code, "AI_PROVIDER_INVALID_RESPONSE");
		assert.equal((await getGenerations()).length, 0);
		assert.equal((await getUser()).ai_generation_count, 0);
	});

	test("rejects with a typed error once the limit is reached, without calling the model", async () => {
		await db
			.update(schema.users)
			.set({ ai_generation_count: generationLimit })
			.where(eq(schema.users.clerk_id, clerkUserId));
		const modelCallsBefore = model.doStreamCalls.length;

		const { received, error } = await generate();

		assert.deepEqual(received, []);
		assert.ok(isDefinedError(error), `expected defined error, got ${error}`);
		assert.equal(error.code, "AI_GENERATION_LIMIT_REACHED");
		assert.equal(model.doStreamCalls.length, modelCallsBefore);
		assert.equal((await getUser()).ai_generation_count, generationLimit);
	});
});
