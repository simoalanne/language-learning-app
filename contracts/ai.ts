import { route, router } from "@rest-rpc/core";
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
	offset: z.coerce.number().int().min(0).optional(),
	limit: z.coerce.number().int().positive().optional(),
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

export default router(
	{
		ai: {
			getUsage: route({
				method: "GET",
				path: "/ai/usage",
				response: aiUsageStatusSchema,
			}),
			listGenerations: route({
				method: "GET",
				path: "/ai/generations",
				query: aiGenerationHistoryListQuerySchema,
				response: paginatedAiGenerationHistoryResponseSchema,
			}),
			getGenerationById: route({
				method: "GET",
				path: "/ai/generations/:id",
				pathParams: z.object({ id: z.coerce.number().int().positive() }),
				response: aiGenerationHistoryItemSchema,
			}),
			generateWords: route({
				method: "POST",
				path: "/ai/generate-words",
				body: generateWordsInputSchema,
				responses: {
					200: generatedWordsResponseSchema,
					429: aiGenerationLimitReachedErrorSchema,
					502: aiProviderInvalidResponseErrorSchema,
					503: aiProviderUnavailableErrorSchema,
				},
			}),
		},
	},
	{
		metadata: {
			requiresAuth: true,
		},
	},
);
