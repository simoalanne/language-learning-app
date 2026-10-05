import { error } from "@orpc/server";
import z from "zod";
import { languageNameSchema } from "../wordGroups/wordGroups.schemas.ts";

export const generateWordsInputSchema = z.object({
	topic: z.string(),
	skillLevel: z.string(),
	wordCount: z.int().positive().max(25),
	wordTypes: z.array(z.string()),
	includedLanguages: z.array(languageNameSchema).min(1),
});

export const generatedWordsSchema = z.array(
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

/** Schema the model streams elements of; only allows the requested languages. */
export const createGeneratedWordElementSchema = (
	languages: z.infer<typeof languageNameSchema>[],
) =>
	z.object({
		translations: z
			.array(z.object({ languageName: z.enum(languages), word: z.string() }))
			.length(languages.length),
	});

export const AiGenerationLimitReachedError = error(
	"AI_GENERATION_LIMIT_REACHED",
	{
		message: "AI generation limit reached",
		data: z.object({ resetsAt: z.iso.datetime() }),
	},
);

export const AiProviderUnavailableError = error("AI_PROVIDER_UNAVAILABLE", {
	message: "AI provider is unavailable",
});

export const AiProviderInvalidResponseError = error(
	"AI_PROVIDER_INVALID_RESPONSE",
	{ message: "AI provider returned an invalid response" },
);
