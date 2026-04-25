import z from "zod";
import { contractTools } from "./contractTools.ts";
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

export default contractTools.defineContract({
	ai: {
		getUsage: {
			method: "GET",
			path: "/ai/usage",
			response: aiUsageStatusSchema,
			meta: {
				requiresAuth: true,
			},
		},
		listGenerations: {
			method: "GET",
			path: "/ai/generations",
			request: {
				query: aiGenerationHistoryListQuerySchema,
			},
			response: paginatedAiGenerationHistoryResponseSchema,
			meta: {
				requiresAuth: true,
			},
		},
		getGenerationById: {
			method: "GET",
			path: "/ai/generations/:id",
			request: {
				params: z.object({ id: z.coerce.number().int().positive() }),
			},
			response: aiGenerationHistoryItemSchema,
			meta: {
				requiresAuth: true,
			},
		},
		generateWords: {
			method: "POST",
			path: "/ai/generate-words",
			request: {
				body: generateWordsInputSchema,
			},
			response: generatedWordsResponseSchema,
			meta: {
				requiresAuth: true,
			},
		},
	},
});
