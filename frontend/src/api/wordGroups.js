export const normalizeLanguageName = (languageName) => {
  if (typeof languageName !== "string" || languageName.length === 0) {
    return languageName;
  }

  return languageName.charAt(0).toUpperCase() + languageName.slice(1).toLowerCase();
};

export const normalizeWordGroup = (group) => ({
  ...group,
  translations: Array.isArray(group?.translations)
    ? group.translations.map((translation) => ({
      ...translation,
      languageName: normalizeLanguageName(translation?.languageName),
      synonyms: Array.isArray(translation?.synonyms) ? translation.synonyms : [],
    }))
    : [],
  tags: Array.isArray(group?.tags) ? group.tags : [],
});
