/**
 * Shuffles array with Fisher-Yates algorithm
 * @param {Array} array - array to shuffle
 * @returns {Array} - shuffled array
 */
export const shuffle = (array) => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};

/**
 * Filters word groups based on selected languages and tags
 * @param {Array} wordGroups - array of word groups
 * @param {Array} selectedLanguages - array of selected languages
 * @param {Array} selectedTags - array of selected tags
 * @returns {Array} - filtered array of word groups
 */
export const filterWordGroupsByLanguagesAndTags = (wordGroups, selectedLanguages, selectedTags) => (
  wordGroups.filter(
    (wg) =>
      selectedLanguages.every((lang) =>
        wg.translations.map((t) => t.languageName).includes(lang)
      ) &&
      (selectedTags.length === 0 ||
        selectedTags.some((tag) => wg.tags.includes(tag)))
  ));