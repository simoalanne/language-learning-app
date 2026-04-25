import type { LanguageName, WordGroup } from "@/types/api";

export const normalizeLanguageName = (
	languageName: unknown,
): LanguageName | unknown => {
	if (typeof languageName !== "string" || languageName.length === 0) {
		return languageName;
	}

	return `${languageName.charAt(0).toUpperCase()}${languageName
		.slice(1)
		.toLowerCase()}` as LanguageName;
};

export const normalizeWordGroup = (group: WordGroup): WordGroup => ({
	...group,
	translations: Array.isArray(group?.translations)
		? group.translations.map((translation) => ({
				...translation,
				languageName: normalizeLanguageName(
					translation?.languageName,
				) as LanguageName,
				synonyms: Array.isArray(translation?.synonyms)
					? translation.synonyms
					: [],
			}))
		: [],
	tags: Array.isArray(group?.tags) ? group.tags : [],
});
