import type {
	ApiRequest	,
} from "@language-learning-app/contracts";
import { defineService } from "../../initServives.ts";

const sampleWords = [
	{
		topic: "travel",
		translations: {
			english: "airport",
			finnish: "lentokentta",
			swedish: "flygplats",
		},
	},
	{
		topic: "travel",
		translations: {
			english: "ticket",
			finnish: "lippu",
			swedish: "biljett",
		},
	},
	{
		topic: "food",
		translations: {
			english: "apple",
			finnish: "omena",
			swedish: "apple",
		},
	},
	{
		topic: "food",
		translations: {
			english: "bread",
			finnish: "leipa",
			swedish: "brod",
		},
	},
	{
		topic: "general",
		translations: {
			english: "book",
			finnish: "kirja",
			swedish: "bok",
		},
	},
	{
		topic: "general",
		translations: {
			english: "house",
			finnish: "talo",
			swedish: "hus",
		},
	},
];

type SupportedLanguageName =
	ApiRequest<"ai.generateWords">["includedLanguages"][number];

const translationKeyByLanguage: Partial<
	Record<
		SupportedLanguageName,
		keyof (typeof sampleWords)[number]["translations"]
	>
> = {
	English: "english",
	Finnish: "finnish",
	Swedish: "swedish",
};

const toTitleCase = (value: string) => {
	if (!value) {
		return value;
	}

	return value.charAt(0).toUpperCase() + value.slice(1);
};

// TODO: replace with a cheap AI API to get proper output instead of the sample words
// this used to use Gemini API, but it is both an overkill and nowadays unnecessarily expensive.
export const aiService = defineService("ai", {
	generateWords: async ({ context, ...input }) => {
		const normalizedTopic = input.topic.toLowerCase();
		const matchingWords = sampleWords.filter(
			(entry) => entry.topic === normalizedTopic,
		);
		const fallbackWords =
			matchingWords.length > 0 ? matchingWords : sampleWords;
		return Array.from({ length: input.wordCount }, (_, index) => {
			const entry = fallbackWords[index % fallbackWords.length];

			return {
				id: index + 1,
				translations: input.includedLanguages.map((languageName) => ({
					languageName,
					word: (() => {
						const translationKey = translationKeyByLanguage[languageName];
						return translationKey
							? entry.translations[translationKey]
							: `${toTitleCase(languageName)} ${index + 1}`;
					})(),
				})),
			};
		});
	},
});
