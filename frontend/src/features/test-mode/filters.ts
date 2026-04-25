import type { LanguageName, WordGroup } from "@/types/api";

export const filterWordGroupsByLanguagesAndTags = (
  wordGroups: WordGroup[],
  selectedLanguages: [LanguageName, LanguageName],
  selectedTags: string[],
): WordGroup[] =>
  wordGroups.filter(
    (wg) =>
      selectedLanguages.every((lang) =>
        wg.translations.map((t) => t.languageName).includes(lang),
      ) &&
      (selectedTags.length === 0 ||
        selectedTags.some((tag) => wg.tags.includes(tag))),
  );
