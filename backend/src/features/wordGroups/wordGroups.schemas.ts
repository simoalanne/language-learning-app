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

export const wordGroupIdSchema = z.object({
	id: z.number().int().positive(),
});

export const paginationInputSchema = z
	.object({
		offset: z.number().int().min(0).optional(),
		limit: z.number().int().positive().optional(),
	})
	.default({});
