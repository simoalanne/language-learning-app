import type { ApiRequest, ApiResponse } from "@language-learning-app/contracts";
import { generatedWordsTextFormatSchema } from "@language-learning-app/contracts/ai.ts";
import { and, eq, sql } from "drizzle-orm";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import db from "../../drizzle/db.ts";
import * as schema from "../../drizzle/schema.ts";
import { defineService } from "../../initServives.ts";

type GenerateWordsInput = ApiRequest<"ai.generateWords">;
type GenerateWordsResponse = ApiResponse<"ai.generateWords">;

const openAiApiKey = process.env.OPENAI_API_KEY;
const openAiModel = process.env.OPENAI_MODEL;
const openAiBaseUrl =
	process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const aiGenerationLimit = Number(process.env.AI_GENERATION_LIMIT ?? 0);
const aiGenerationWindowMs = 30 * 24 * 60 * 60 * 1000;

const hasOpenAiConfig = Boolean(openAiApiKey && openAiModel);
const hasAiGenerationLimit =
	Number.isFinite(aiGenerationLimit) && aiGenerationLimit > 0;

const openai = openAiApiKey
	? new OpenAI({
			apiKey: openAiApiKey,
			baseURL: openAiBaseUrl,
		})
	: null;

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
		throw new Error(
			"OpenAI is not configured. Set OPENAI_API_KEY and OPENAI_MODEL in backend/.env.",
		);
	}

	try {
		const response = await openai.responses.parse({
			model: openAiModel,
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

		if (!response.output_parsed) {
			throw new Error(
				"OpenAI response did not include parsed structured output",
			);
		}

		return response.output_parsed.items.map((item, index) => ({
			id: index + 1,
			translations: item.translations,
		}));
	} catch (error) {
		if (error instanceof OpenAI.APIError) {
			throw new Error(
				`OpenAI request failed with status ${error.status ?? "unknown"}: ${error.message}`,
			);
		}

		throw error;
	}
};

const getLimitResetError = async (
	clerkId: string,
	dbClient: Pick<typeof db, "select"> = db,
) => {
	const [existingUser] = await dbClient
		.select({
			resetAt: schema.users.ai_generation_reset_at,
		})
		.from(schema.users)
		.where(eq(schema.users.clerk_id, clerkId));

	const resetAtLabel =
		existingUser?.resetAt instanceof Date
			? existingUser.resetAt.toISOString()
			: "the next reset window";

	return new Error(
		`AI generation limit reached. Try again after ${resetAtLabel}.`,
	);
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
		return;
	}

	const isExpired =
		!user.resetAt || new Date(user.resetAt).getTime() <= now.getTime();

	if (!isExpired && user.used >= aiGenerationLimit) {
		throw await getLimitResetError(clerkId);
	}
};

export const aiService = defineService("ai", {
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
			.where(eq(schema.users.clerk_id, context.clerkId));

		if (!user) {
			return {
				used: 0,
				limit: aiGenerationLimit,
				remaining: aiGenerationLimit,
				resetsAt: null,
				canGenerate: true,
			};
		}

		const isExpired =
			!user.resetAt || new Date(user.resetAt).getTime() <= now.getTime();
		const used = isExpired ? 0 : user.used;
		const remaining = Math.max(aiGenerationLimit - used, 0);

		return {
			used,
			limit: aiGenerationLimit,
			remaining,
			resetsAt: isExpired ? null : (user.resetAt?.toISOString() ?? null),
			canGenerate: remaining > 0,
		};
	},
	listGenerations: async ({ context, offset, limit }) => {
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
	},
	getGenerationById: async ({ context, id }) => {
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
		if (!hasOpenAiConfig) {
			throw new Error(
				"OpenAI is not configured. Set OPENAI_API_KEY and OPENAI_MODEL in backend/.env.",
			);
		}

		await assertCanGenerateWithinLimit(context.clerkId);

		const words = await generateWordsWithOpenAi(input);
		await db.transaction(async (tx) => {
			await tx.insert(schema.ai_generations).values({
				user_id: context.clerkId,
				request_data: input,
				response_data: words,
			});

			if (!hasAiGenerationLimit) {
				return;
			}

			const now = new Date();
			const resetAt = new Date(now.getTime() + aiGenerationWindowMs);

			const [updatedUser] = await tx
				.update(schema.users)
				.set({
					ai_generation_count: sql<number>`
						case
							when ${schema.users.ai_generation_reset_at} is null
								or ${schema.users.ai_generation_reset_at} <= ${now}
							then 1
							else ${schema.users.ai_generation_count} + 1
						end
					`,
					ai_generation_reset_at: sql<Date>`
						case
							when ${schema.users.ai_generation_reset_at} is null
								or ${schema.users.ai_generation_reset_at} <= ${now}
							then ${resetAt}
							else ${schema.users.ai_generation_reset_at}
						end
					`,
				})
				.where(
					and(
						eq(schema.users.clerk_id, context.clerkId),
						sql<boolean>`
							${schema.users.ai_generation_reset_at} is null
							or ${schema.users.ai_generation_reset_at} <= ${now}
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

			throw await getLimitResetError(context.clerkId, tx);
		});
		return words;
	},
});
