import { route } from "@rest-rpc/core";
import z from "zod";
import { languageNameSchema } from "./wordGroups.schemas.ts";

export const generateWordsInputSchema = z.object({
	topic: z.string(),
	skillLevel: z.string(),
	wordCount: z.int().positive().max(25),
	wordTypes: z.array(z.string()),
	includedLanguages: z.array(languageNameSchema).min(1),
});

export const generatedWordsResponseSchema = z.array(
	z.object({
		id: z.number().int(),
		translations: z
			.array(
				z.object({
					languageName: languageNameSchema,
					word: z.string(),
				}),
			)
			.min(1),
	}),
);

export const generatedWordsTextFormatSchema = z.object({
	items: generatedWordsResponseSchema,
});

export const aiUsageStatusSchema = z.object({
	used: z.number().int().nonnegative(),
	limit: z.number().int().positive().nullable(),
	remaining: z.number().int().nonnegative().nullable(),
	resetsAt: z.string().datetime().nullable(),
	canGenerate: z.boolean(),
});

export const aiGenerationHistoryItemSchema = z.object({
	id: z.number().int().positive(),
	request: generateWordsInputSchema,
	response: generatedWordsResponseSchema,
	createdAt: z.coerce.date(),
});

export const aiGenerationHistoryListQuerySchema = z.object({
	offset: z.coerce.number<number>().int().min(0).optional(),
	limit: z.coerce.number<number>().int().positive().optional(),
});

export const paginatedAiGenerationHistoryResponseSchema = z.object({
	generations: z.array(aiGenerationHistoryItemSchema),
	pagination: z.object({
		total: z.number(),
		limit: z.number(),
		offset: z.number(),
		pages: z.number(),
	}),
});

export const aiGenerationLimitReachedErrorSchema = z.object({
	code: z.literal("AI_GENERATION_LIMIT_REACHED"),
	resetsAt: z.iso.datetime(),
});

export const aiProviderUnavailableErrorSchema = z.object({
	code: z.literal("AI_PROVIDER_UNAVAILABLE"),
	message: z.string(),
});

export const aiProviderInvalidResponseErrorSchema = z.object({
	code: z.literal("AI_PROVIDER_INVALID_RESPONSE"),
	message: z.string(),
});

const apiRoute = route.with({
	pathPrefix: "/api",
	metadata: {
		requiresAuth: true,
	},
	strictStatusCodes: true,
});

export default {
	ai: {
		getUsage: apiRoute.get("ai/usage").response(200, aiUsageStatusSchema),
		listGenerations: apiRoute
			.get("ai/generations")
			.query(aiGenerationHistoryListQuerySchema)
			.response(200, paginatedAiGenerationHistoryResponseSchema),
		getGenerationById: apiRoute
			.get("ai/generations/:id")
			.params(z.object({ id: z.coerce.number<number>().int().positive() }))
			.response(200, aiGenerationHistoryItemSchema),
		generateWords: apiRoute
			.post("ai/generate-words")
			.body(generateWordsInputSchema)
			.response(200, generatedWordsResponseSchema)
			.response(429, aiGenerationLimitReachedErrorSchema)
			.response(502, aiProviderInvalidResponseErrorSchema)
			.response(503, aiProviderUnavailableErrorSchema),
	},
};
