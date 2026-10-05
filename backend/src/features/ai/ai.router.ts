import { ORPCError } from "@orpc/server";
import {
	JSONParseError,
	NoObjectGeneratedError,
	NoOutputGeneratedError,
	Output,
	streamText,
	TypeValidationError,
} from "ai";
import { and, eq, sql } from "drizzle-orm";
import type z from "zod";
import db from "../../drizzle/db.ts";
import * as schema from "../../drizzle/schema.ts";
import { authed } from "../../orpc.ts";
import {
	paginationInputSchema,
	wordGroupIdSchema,
} from "../wordGroups/wordGroups.schemas.ts";
import { languageModel, missingModelConfigMessage } from "./ai.model.ts";
import {
	AiGenerationLimitReachedError,
	AiProviderInvalidResponseError,
	AiProviderUnavailableError,
	createGeneratedWordElementSchema,
	type generatedWordsSchema,
	generateWordsInputSchema,
} from "./ai.schemas.ts";

type GenerateWordsInput = z.infer<typeof generateWordsInputSchema>;
type GenerateWordsResponse = z.infer<typeof generatedWordsSchema>;

const aiGenerationLimit = Number(process.env.AI_GENERATION_LIMIT ?? 0);
const aiGenerationWindowMs = 7 * 24 * 60 * 60 * 1000;

const hasAiGenerationLimit =
	Number.isFinite(aiGenerationLimit) && aiGenerationLimit > 0;

const getNextAiGenerationResetAt = (from: Date) =>
	new Date(from.getTime() + aiGenerationWindowMs);

const createWordGenerationPrompt = (input: GenerateWordsInput) => {
	const wordTypes =
		input.wordTypes.length > 0
			? input.wordTypes.join(", ")
			: "any suitable types";

	return [
		"Generate practical vocabulary for a language-learning app.",
		`Topic: ${input.topic}`,
		`Skill level: ${input.skillLevel}`,
		`Word count: ${input.wordCount}`,
		`Word types: ${wordTypes}`,
		`Languages: ${input.includedLanguages.join(", ")}`,
		"Return only vocabulary items that are useful and natural for learners.",
		"Use short words or short phrases only when they are common vocabulary items.",
		"Ensure each item has a translation for every requested language.",
		"Avoid duplicates, numbered labels, explanations, and extra commentary.",
	].join("\n");
};

/** Atomically counts a generation against the quota, or throws if the limit is reached. */
const reserveGeneration = async (clerkId: string) => {
	if (!hasAiGenerationLimit) {
		return;
	}

	const now = new Date();
	const resetAt = getNextAiGenerationResetAt(now);

	const [reserved] = await db
		.update(schema.users)
		.set({
			ai_generation_count: sql<number>`
				case
					when ${schema.users.ai_generation_reset_at} <= ${now}
					then 1
					else ${schema.users.ai_generation_count} + 1
				end
			`,
			ai_generation_reset_at: sql<Date>`
				case
					when ${schema.users.ai_generation_reset_at} <= ${now}
					then ${resetAt}
					else ${schema.users.ai_generation_reset_at}
				end
			`,
		})
		.where(
			and(
				eq(schema.users.clerk_id, clerkId),
				sql<boolean>`
					${schema.users.ai_generation_reset_at} <= ${now}
					or ${schema.users.ai_generation_count} < ${aiGenerationLimit}
				`,
			),
		)
		.returning({ clerkId: schema.users.clerk_id });

	if (reserved) {
		return;
	}

	const [user] = await db
		.select({ resetAt: schema.users.ai_generation_reset_at })
		.from(schema.users)
		.where(eq(schema.users.clerk_id, clerkId));

	if (!user) {
		throw new Error("Authenticated user not found");
	}

	throw new AiGenerationLimitReachedError({
		data: { resetsAt: user.resetAt.toISOString() },
	});
};

/** Best-effort refund of a reserved generation after a failed stream. */
const refundGeneration = async (clerkId: string) => {
	if (!hasAiGenerationLimit) {
		return;
	}

	await db
		.update(schema.users)
		.set({
			ai_generation_count: sql<number>`greatest(${schema.users.ai_generation_count} - 1, 0)`,
		})
		.where(eq(schema.users.clerk_id, clerkId))
		.catch((error) =>
			console.error("AI generation quota refund failed:", error),
		);
};

const toProviderError = (error: unknown) => {
	if (error instanceof ORPCError) {
		return error;
	}

	if (
		NoObjectGeneratedError.isInstance(error) ||
		NoOutputGeneratedError.isInstance(error) ||
		TypeValidationError.isInstance(error) ||
		JSONParseError.isInstance(error)
	) {
		return new AiProviderInvalidResponseError({ cause: error });
	}

	return new AiProviderUnavailableError({ cause: error });
};

export const aiRouter = {
	getUsage: authed.handler(async ({ context }) => {
		if (!hasAiGenerationLimit) {
			return {
				used: 0,
				limit: null,
				remaining: null,
				resetsAt: null,
				canGenerate: true,
			};
		}

		const now = new Date();
		const [user] = await db
			.select({
				used: schema.users.ai_generation_count,
				resetAt: schema.users.ai_generation_reset_at,
			})
			.from(schema.users)
			.where(eq(schema.users.clerk_id, context.clerkId));

		if (!user) {
			throw new Error("Authenticated user not found");
		}

		let used = user.used;
		let resetAt = user.resetAt;

		if (resetAt.getTime() <= now.getTime()) {
			const nextResetAt = getNextAiGenerationResetAt(now);

			const [updatedUser] = await db
				.update(schema.users)
				.set({
					ai_generation_count: 0,
					ai_generation_reset_at: nextResetAt,
				})
				.where(eq(schema.users.clerk_id, context.clerkId))
				.returning({
					used: schema.users.ai_generation_count,
					resetAt: schema.users.ai_generation_reset_at,
				});

			if (!updatedUser) {
				throw new Error("AI generation quota reset failed");
			}

			used = updatedUser.used;
			resetAt = updatedUser.resetAt;
		}

		const remaining = Math.max(aiGenerationLimit - used, 0);

		return {
			used,
			limit: aiGenerationLimit,
			remaining,
			resetsAt: resetAt.toISOString(),
			canGenerate: remaining > 0,
		};
	}),
	listGenerations: authed
		.input(paginationInputSchema)
		.handler(async ({ context, input: { offset, limit } }) => {
			const [totalResult] = await db
				.select({ total: sql`count(*)` })
				.from(schema.ai_generations)
				.where(eq(schema.ai_generations.user_id, context.clerkId));
			const total = Number(totalResult.total);

			const base = db
				.select()
				.from(schema.ai_generations)
				.where(eq(schema.ai_generations.user_id, context.clerkId))
				.orderBy(sql`${schema.ai_generations.created_at} desc`)
				.offset(offset ?? 0);

			const rows = limit ? await base.limit(limit) : await base;

			return {
				generations: rows.map((row) => ({
					id: row.id,
					request: row.request_data,
					response: row.response_data,
					createdAt: row.created_at,
				})),
				pagination: {
					total,
					limit: limit ?? total,
					offset: offset ?? 0,
					pages: limit ? Math.ceil(total / limit) : 1,
				},
			};
		}),
	getGenerationById: authed
		.input(wordGroupIdSchema)
		.handler(async ({ context, input: { id } }) => {
			const [row] = await db
				.select()
				.from(schema.ai_generations)
				.where(
					and(
						eq(schema.ai_generations.id, id),
						eq(schema.ai_generations.user_id, context.clerkId),
					),
				);

			if (!row) {
				throw new ORPCError("NOT_FOUND", {
					message: "AI generation not found",
				});
			}

			return {
				id: row.id,
				request: row.request_data,
				response: row.response_data,
				createdAt: row.created_at,
			};
		}),
	generateWords: authed
		.errors({
			[AiGenerationLimitReachedError.code]: AiGenerationLimitReachedError,
			[AiProviderUnavailableError.code]: AiProviderUnavailableError,
			[AiProviderInvalidResponseError.code]: AiProviderInvalidResponseError,
		})
		.input(generateWordsInputSchema)
		.handler(async function* ({ context, input, signal }) {
			if (!languageModel) {
				throw new AiProviderUnavailableError({
					message: missingModelConfigMessage,
				});
			}

			await reserveGeneration(context.clerkId);

			const words: GenerateWordsResponse = [];
			let failed = false;

			try {
				// streamText reports provider failures here instead of throwing from elementStream.
				let streamError: unknown;
				const { elementStream } = streamText({
					model: languageModel,
					abortSignal: signal,
					system:
						"You generate multilingual vocabulary as strict JSON for a language-learning app.",
					prompt: createWordGenerationPrompt(input),
					output: Output.array({
						element: createGeneratedWordElementSchema(input.includedLanguages),
						maxItems: input.wordCount,
					}),
					onError: ({ error }) => {
						streamError = error;
					},
				});

				for await (const element of elementStream) {
					const word = { id: words.length + 1, ...element };
					words.push(word);
					yield word;
				}

				if (streamError) {
					throw streamError;
				}

				if (words.length === 0) {
					throw new AiProviderInvalidResponseError({
						message: "The AI provider returned no words.",
					});
				}
			} catch (error) {
				// A client that disconnects keeps the charge; provider failures are refunded.
				if (signal?.aborted) {
					throw error;
				}
				failed = true;
				await refundGeneration(context.clerkId);
				throw toProviderError(error);
			} finally {
				// Runs on completion and on client disconnect (generator .return()), so
				// words the user already received are kept in history.
				if (!failed && words.length > 0) {
					await db
						.insert(schema.ai_generations)
						.values({
							user_id: context.clerkId,
							request_data: input,
							response_data: words,
						})
						.catch((error) =>
							console.error("Saving AI generation failed:", error),
						);
				}
			}
		}),
};
