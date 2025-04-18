import { useState, useContext } from "react";
import { AuthContext } from "../Authorisation/AuthContext";
import { addWordGroupsBulk, generateWords } from "../api/api";

const formConfig = {
  languageNames: ["English", "Finnish", "French", "German", "Spanish", "Swedish"],
  wordTypes: ["Noun", "Verb", "Adjective", "Adverb"],
  maxGeneratedWordsPerRequest: 25,
  maxWordLength: 50,
};

const initialForm = {
  topic: "",
  skillLevel: "",
  wordCount: 10,
  languages: ["English", "Finnish"],
  selectedWordTypes: [],
};

/**
 * Custom hook for managing AI word generation logic.
 * Handles form state, loading, generation, and saving of words.
 *
 * @returns {Object} Hook values and handlers.
 */
export const useAiWordGeneration = () => {
  const [form, setForm] = useState(initialForm);
  const [generatedWords, setGeneratedWords] = useState([]);
  const [loading, setLoading] = useState(false);

  const { token } = useContext(AuthContext);

  /**
   * Updates a single field in the form state.
   *
   * @param {string} key - Key of the form field to update.
   * @param {any} value - New value for the specified key.
   */
  const handleWordGenerationFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Submits the form and fetches generated words from the backend.
   * Adds `isSelected` flag and trims word lengths.
   *
   * @param {Event} e - The form submission event.
   */
  const handleWordGenerationFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const words = await generateWords(
        {
          topic: form.topic,
          skillLevel: form.skillLevel,
          wordCount: form.wordCount,
          wordTypes: form.selectedWordTypes,
          includedLanguages: form.languages,
        }, token
      );

      const generated = words.map(item => ({
        ...item,
        isSelected: true,
        translations: item.translations.map(t => ({
          ...t,
          word: t.word.slice(0, formConfig.maxWordLength),
        })),
      }));

      setGeneratedWords(generated);
    } catch (error) {
      console.error("Word generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Saves the selected generated words to the database.
   * Filters out unselected and empty translations before submission.
   */
  const handleSaveWordsToDatabase = async () => {
    setLoading(true);
    const selectedItems = generatedWords.filter((item) => item.isSelected);
    // Filter out empty translations tags so they are not sent to the backend
    const tags = [form.topic.toLowerCase(), form.skillLevel.toLowerCase()].filter(t => t.trim() !== "");

    const bulkData = selectedItems.map((item) => ({
      translations: item.translations
        .filter(t => t.word?.trim())
        .map((t) => ({
          languageName: t.languageName,
          word: t.word.trim(),
          synonyms: [],
        })),
      tags,
    }));

    try {
      await addWordGroupsBulk(bulkData, token);
      setGeneratedWords([]);
      setForm(initialForm);
    } catch (error) {
      console.error("Saving words failed:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates whether a word item is selected.
   *
   * @param {number} id - ID of the word item to update.
   * @param {boolean} isSelected - New selected state.
   */
  const handleWordItemSelectChange = (id, isSelected) => {
    setGeneratedWords(prev =>
      prev.map((w) => w.id === id ? { ...w, isSelected } : w)
    );
  };

  /**
   * Updates the translation for a specific language in a word item.
   *
   * @param {number} id - ID of the word item to update.
   * @param {string} languageName - Target language to update.
   * @param {string} newWord - New word to set for the translation.
   */
  const handleWordItemTranslationChange = (id, languageName, newWord) => {
    setGeneratedWords(prev =>
      prev.map((wordItem) =>
        wordItem.id === id
          ? {
            ...wordItem,
            translations: wordItem.translations.map(t =>
              t.languageName === languageName
                ? { ...t, word: newWord.trim().slice(0, formConfig.maxWordLength) }
                : t
            ),
          }
          : wordItem
      )
    );
  };

  return {
    form,
    formConfig,
    handleWordGenerationFormChange,
    handleWordGenerationFormSubmit,
    generatedWords,
    handleSaveWordsToDatabase,
    handleWordItemSelectChange,
    handleWordItemTranslationChange,
    loading,
  };
};

export default useAiWordGeneration;