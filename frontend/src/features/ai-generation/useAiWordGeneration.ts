import { useState } from "react";
import type {
	AiGenerationHistoryItem,
	GeneratedWord,
	GeneratedWordTranslation,
	GenerateWordsInput,
	GenerateWordsResponse,
	LanguageName,
	WordGroupInput,
} from "@/types/api";
import { useApiClient } from "../../providers/api-client";

export type AiWordGenerationForm = {
	topic: string;
	skillLevel: string;
	wordCount: number;
	languages: LanguageName[];
	selectedWordTypes: string[];
};

export type AiWordGenerationFormConfig = {
	languageNames: LanguageName[];
	wordTypes: string[];
	maxGeneratedWordsPerRequest: number;
	maxWordLength: number;
};

export type SelectableGeneratedWord = GeneratedWord & {
	isSelected: boolean;
	translations: GeneratedWordTranslation[];
};

const formConfig: AiWordGenerationFormConfig = {
	languageNames: [
		"English",
		"Finnish",
		"French",
		"German",
		"Spanish",
		"Swedish",
	],
	wordTypes: ["Noun", "Verb", "Adjective", "Adverb"],
	maxGeneratedWordsPerRequest: 25,
	maxWordLength: 50,
};

const initialForm: AiWordGenerationForm = {
	topic: "",
	skillLevel: "",
	wordCount: 10,
	languages: ["English", "Finnish"],
	selectedWordTypes: [],
};

const toSelectableGeneratedWords = (
	words: GenerateWordsResponse,
): SelectableGeneratedWord[] =>
	words.map((item) => ({
		...item,
		isSelected: true,
		translations: item.translations.map((t) => ({
			...t,
			word: t.word.slice(0, formConfig.maxWordLength),
		})),
	}));

const formatResetAt = (value: string | null) => {
	if (!value) {
		return null;
	}

	const date = new Date(value);

	if (Number.isNaN(date.getTime())) {
		return null;
	}

	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(date);
};

/**
 * Custom hook for managing AI word generation logic.
 * Handles form state, loading, generation, and saving of words.
 *
 * @returns {Object} Hook values and handlers.
 */
export const useAiWordGeneration = () => {
	const [form, setForm] = useState(initialForm);
	const [generatedWords, setGeneratedWords] = useState<
		SelectableGeneratedWord[]
	>([]);
	const { api } = useApiClient();
	const usageQuery = api.ai.getUsage.useQuery({});
	const generationHistoryQuery = api.ai.listGenerations.useQuery({});
	const generateWordsMutation = api.ai.generateWords.useMutation({
		onSuccess: (words) => {
			setGeneratedWords(toSelectableGeneratedWords(words));
			void generationHistoryQuery.refetch();
		},
		onSettled: () => {
			void usageQuery.refetch();
		},
	});
	const createBulkWordGroupsMutation =
		api.wordGroups.users.createBulk.useMutation();

	const generateWordsErrorMessage = (() => {
		const error = generateWordsMutation.error;

		if (!error) {
			return null;
		}

		switch (error.code) {
			case "AI_GENERATION_LIMIT_REACHED": {
				const resetAt = formatResetAt(error.resetsAt);
				return resetAt
					? `Failed to generate words. AI generation limit reached. Try again after ${resetAt}.`
					: "Failed to generate words. AI generation limit reached. Try again later.";
			}
			case "AI_PROVIDER_UNAVAILABLE":
				return "Failed to generate words. The AI provider is currently unavailable.";
			case "AI_PROVIDER_INVALID_RESPONSE":
				return "Failed to generate words. The AI provider returned an invalid response.";
			case "unknown":
				return "Failed to generate words. Please try again later.";
			default: {
				const exhaustive: never = error;
				return exhaustive;
			}
		}
	})();

	/**
	 * Updates a single field in the form state.
	 *
	 * @param {string} key - Key of the form field to update.
	 * @param {any} value - New value for the specified key.
	 */
	const handleWordGenerationFormChange = <K extends keyof AiWordGenerationForm>(
		key: K,
		value: AiWordGenerationForm[K],
	) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleGenerateWords = () => {
		const payload: GenerateWordsInput = {
			topic: form.topic,
			skillLevel: form.skillLevel,
			wordCount: form.wordCount,
			wordTypes: form.selectedWordTypes,
			includedLanguages: form.languages,
		};

		generateWordsMutation.reset();
		generateWordsMutation.mutate(payload);
	};

	const handleLoadHistoryGeneration = (generation: AiGenerationHistoryItem) => {
		setForm({
			topic: generation.request.topic,
			skillLevel: generation.request.skillLevel,
			wordCount: generation.request.wordCount,
			languages: generation.request.includedLanguages,
			selectedWordTypes: generation.request.wordTypes,
		});
		setGeneratedWords(toSelectableGeneratedWords(generation.response));
	};

	const handleReturnToGenerationForm = () => {
		setGeneratedWords([]);
	};

	/**
	 * Saves the selected generated words to the database.
	 * Filters out unselected and empty translations before submission.
	 */
	const handleSaveWordsToDatabase = async () => {
		const selectedItems = generatedWords.filter((item) => item.isSelected);
		// Filter out empty translations tags so they are not sent to the backend
		const tags = [
			form.topic.toLowerCase(),
			form.skillLevel.toLowerCase(),
		].filter((t) => t.trim() !== "");

		const bulkData: WordGroupInput[] = selectedItems.map((item) => ({
			translations: item.translations
				.filter((t) => t.word?.trim())
				.map((t) => ({
					languageName: t.languageName,
					word: t.word.trim(),
					synonyms: [],
				})),
			tags,
		}));

		try {
			await createBulkWordGroupsMutation.mutateAsync({ bulkData });
			void api.wordGroups.users.list.invalidate({});
			setGeneratedWords([]);
			setForm(initialForm);
		} catch (error) {
			console.error("Saving words failed:", error);
			throw error;
		}
	};

	/**
	 * Updates whether a word item is selected.
	 *
	 * @param {number} id - ID of the word item to update.
	 * @param {boolean} isSelected - New selected state.
	 */
	const handleWordItemSelectChange = (id: number, isSelected: boolean) => {
		setGeneratedWords((prev) =>
			prev.map((w) => (w.id === id ? { ...w, isSelected } : w)),
		);
	};

	/**
	 * Updates the translation for a specific language in a word item.
	 *
	 * @param {number} id - ID of the word item to update.
	 * @param {string} languageName - Target language to update.
	 * @param {string} newWord - New word to set for the translation.
	 */
	const handleWordItemTranslationChange = (
		id: number,
		languageName: LanguageName,
		newWord: string,
	) => {
		setGeneratedWords((prev) =>
			prev.map((wordItem) =>
				wordItem.id === id
					? {
							...wordItem,
							translations: wordItem.translations.map((t) =>
								t.languageName === languageName
									? {
											...t,
											word: newWord.trim().slice(0, formConfig.maxWordLength),
										}
									: t,
							),
						}
					: wordItem,
			),
		);
	};

	return {
		form,
		formConfig,
		usageStatus: usageQuery.data,
		usageLoading: usageQuery.isLoading,
		generationHistory: generationHistoryQuery.data?.generations ?? [],
		generationHistoryLoading: generationHistoryQuery.isLoading,
		generateWordsErrorMessage,
		handleWordGenerationFormChange,
		handleGenerateWords,
		handleLoadHistoryGeneration,
		handleReturnToGenerationForm,
		generatedWords,
		handleSaveWordsToDatabase,
		handleWordItemSelectChange,
		handleWordItemTranslationChange,
		loading:
			generateWordsMutation.isPending || createBulkWordGroupsMutation.isPending,
	};
};

export default useAiWordGeneration;
