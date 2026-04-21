import z from "zod";

export const languageNameSchema = z.enum([
	"English",
	"Finnish",
	"French",
	"German",
	"Spanish",
	"Swedish",
]);

export const translationSchema = z.object({
	languageName: languageNameSchema,
	word: z.string().trim().min(1),
	synonyms: z.array(z.string()).optional().default([]),
});

export const wordGroupInputSchema = z.object({
	translations: z.array(translationSchema).min(2),
	tags: z.array(z.string()).optional().default([]),
});

export const wordGroupSchema = wordGroupInputSchema.extend({
	id: z.number().int().positive(),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
});

export const wordGroupIdParamsSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export const wordGroupListQuerySchema = z.object({
	offset: z.coerce.number().int().min(0).optional(),
	limit: z.coerce.number().int().positive().optional(),
});

export const paginatedWordGroupsResponseSchema = z.object({
	wordGroups: z.array(wordGroupSchema),
	pagination: z.object({
		total: z.number(),
		limit: z.number(),
		offset: z.number(),
		pages: z.number(),
	}),
});

export const createBulkWordGroupsSchema = z.object({
	bulkData: z.array(wordGroupInputSchema).min(1),
});

export const wordGroupMutationResponseSchema = z.object({
	id: z.number().int().positive(),
});
