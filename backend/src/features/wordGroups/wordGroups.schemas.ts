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

export const idParamsSchema = z.object({
	id: z.coerce.number().int().positive(),
});

export const paginationQuerySchema = z.object({
	offset: z.coerce.number().int().min(0).optional(),
	limit: z.coerce.number().int().positive().optional(),
});
