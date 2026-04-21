import z from "zod";
import { contractTools } from "./contractTools.ts";
import { languageNameSchema } from "./wordGroups.schemas.ts";

export default contractTools.defineContract({
	ai: {
		generateWords: {
			method: "POST",
			path: "/ai/generate-words",
			request: {
				body: z.object({
					topic: z.string(),
					skillLevel: z.string(),
					wordCount: z.int().positive().max(25),
					wordTypes: z.array(z.string()),
					includedLanguages: z.array(languageNameSchema).min(1),
				}),
			},
			response: z.array(
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
			),
			meta: {
				requiresAuth: true,
			},
		},
	},
});
