import { contracts } from "@language-learning-app/contracts";
import {
	type generatedWordsResponseSchema,
	generatedWordsTextFormatSchema,
	type generateWordsInputSchema,
} from "@language-learning-app/contracts/ai.ts";
import { RouteResponseError, registerRoutes, router } from "@rest-rpc/express";
import { and, eq, sql } from "drizzle-orm";
import { Router } from "express";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type z from "zod";
import db from "../../drizzle/db.ts";
import * as schema from "../../drizzle/schema.ts";
import { attachClerkId } from "../../middleware/attachClerkId.ts";

type GenerateWordsInput = z.infer<typeof generateWordsInputSchema>;
type GenerateWordsResponse = z.infer<typeof generatedWordsResponseSchema>;

const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL;
const openAiBaseUrl =
	process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const aiGenerationLimit = Number(process.env.AI_GENERATION_LIMIT ?? 0);
const aiGenerationWindowMs = 7 * 24 * 60 * 60 * 1000;

const hasAiGenerationLimit =
	Number.isFinite(aiGenerationLimit) && aiGenerationLimit > 0;

const openai = openAiApiKey
	? new OpenAI({
			apiKey: openAiApiKey,
			baseURL: openAiBaseUrl,
		})
	: null;

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

const generateWordsWithOpenAi = async (
	input: GenerateWordsInput,
): Promise<GenerateWordsResponse> => {
	if (!openai || !openAiModel) {
		throw new RouteResponseError(contracts.ai.generateWords, {
			status: 503,
			body: {
				code: "AI_PROVIDER_UNAVAILABLE",
				message:
					"OpenAI is not configured. Set OPENAI_API_KEY and OPENAI_MODEL in backend/.env.",
			},
		});
	}

	const openAiClient = openai;
	const model = openAiModel;

	try {
		const response = await openAiClient.responses.parse({
			model,
			input: [
				{
					role: "system",
					content:
						"You generate multilingual vocabulary as strict JSON for a language-learning app.",
				},
				{
					role: "user",
					content: createWordGenerationPrompt(input),
				},
			],
			text: {
				format: zodTextFormat(
					generatedWordsTextFormatSchema,
					"generated_words",
				),
			},
		});

		const outputParsed = response.output_parsed;

		if (!outputParsed) {
			throw new RouteResponseError(contracts.ai.generateWords, {
				status: 502,
				body: {
					code: "AI_PROVIDER_INVALID_RESPONSE",
					message: "OpenAI response did not include parsed structured output.",
				},
			});
		}

		return outputParsed.items.map((item, index) => ({
			id: index + 1,
			translations: item.translations,
		}));
	} catch (error) {
		if (error instanceof OpenAI.APIError) {
			throw new RouteResponseError(contracts.ai.generateWords, {
				status: 503,
				body: {
					code: "AI_PROVIDER_UNAVAILABLE",
					message: `OpenAI request failed with status ${error.status ?? "unknown"}: ${error.message}`,
				},
			});
		}

		throw error;
	}
};

const assertCanGenerateWithinLimit = async (clerkId: string) => {
	if (!hasAiGenerationLimit) {
		return;
	}

	const now = new Date();
	const [user] = await db
		.select({
			used: schema.users.ai_generation_count,
			resetAt: schema.users.ai_generation_reset_at,
		})
		.from(schema.users)
		.where(eq(schema.users.clerk_id, clerkId));

	if (!user) {
		throw new Error("Authenticated user not found");
	}

	if (user.resetAt.getTime() <= now.getTime()) {
		return;
	}

	if (user.used >= aiGenerationLimit) {
		throw new RouteResponseError(contracts.ai.generateWords, {
			status: 429,
			body: {
				code: "AI_GENERATION_LIMIT_REACHED",
				resetsAt: user.resetAt.toISOString(),
			},
		});
	}
};

const aiService = router(contracts.ai, {
	getUsage: async ({ context }) => {
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
			.where(eq(schema.users.clerk_id, context.req.clerkId));

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
				.where(eq(schema.users.clerk_id, context.req.clerkId))
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
	},
	listGenerations: async ({ context, offset, limit }) => {
		const [totalResult] = await db
			.select({ total: sql`count(*)` })
			.from(schema.ai_generations)
			.where(eq(schema.ai_generations.user_id, context.req.clerkId));
		const total = Number(totalResult.total);

		const base = db
			.select()
			.from(schema.ai_generations)
			.where(eq(schema.ai_generations.user_id, context.req.clerkId))
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
	},
	getGenerationById: async ({ context, id }) => {
		const [row] = await db
			.select()
			.from(schema.ai_generations)
			.where(
				and(
					eq(schema.ai_generations.id, id),
					eq(schema.ai_generations.user_id, context.req.clerkId),
				),
			);

		if (!row) {
			throw new Error("AI generation not found");
		}

		return {
			id: row.id,
			request: row.request_data,
			response: row.response_data,
			createdAt: row.created_at,
		};
	},
	generateWords: async ({ context, ...input }) => {
		await assertCanGenerateWithinLimit(context.req.clerkId);

		const words = await generateWordsWithOpenAi(input);
		await db.transaction(async (tx) => {
			await tx.insert(schema.ai_generations).values({
				user_id: context.req.clerkId,
				request_data: input,
				response_data: words,
			});

			if (!hasAiGenerationLimit) {
				return;
			}

			const now = new Date();
			const resetAt = getNextAiGenerationResetAt(now);

			const [updatedUser] = await tx
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
						eq(schema.users.clerk_id, context.req.clerkId),
						sql<boolean>`
							${schema.users.ai_generation_reset_at} <= ${now}
							or ${schema.users.ai_generation_count} < ${aiGenerationLimit}
						`,
					),
				)
				.returning({
					clerkId: schema.users.clerk_id,
				});

			if (updatedUser) {
				return;
			}

			throw new Error("AI generation quota update failed");
		});
		return words;
	},
});

export const aiRouter = Router();

registerRoutes(aiRouter, aiService, {
	middleware: [attachClerkId],
});
