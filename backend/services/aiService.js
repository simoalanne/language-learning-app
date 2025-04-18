import { GoogleGenAI } from "@google/genai";

/**
 * Parses the AI response to JSON format. The response from the AI assuming it only contains JSON
 * means that the json will be in a code block starting with ```json and ending with ```. There should
 * be a better way to do this but haven't found one yet.
 * 
 * @param {string} response - The AI response containing the JSON code block.
 * @returns {object} - The parsed JSON object.
 * @throws Will throw an error if the JSON parsing fails.
 */
export const parseAIResponseToJson = (response) => {
  try {
    const rawText = response?.text?.replace(/```json/g, "").replace(/```/g, "");
    return JSON.parse(rawText);
  } catch (err) {
    console.error("JSON Parsing Error:", err);
    throw new Error("Unable to get valid response from the AI");
  }
};

/**
 * Generates words based on the provided parameters using Google's Gemini AI API. Right now
 * this does just a single call and restricts the number of words per request to 25. This could also be
 * changed to concurrently call the API multiple times to get more words but that could easily
 * lead to many duplicates and therefore a waste of API calls. 25 is also more than enough
 * for most use cases and the user can just ask for more words if they need them. 
 * 
 * Prompt could also be changed in the future so that the model could get more context about the user
 * for example passing some user data about their skill levels and what words they already know.
 * and don't want generated again. For now this implementation is good enough.
 *
 * @param {Object} params - The parameters for generating words.
 * @param {string} params.skillLevel - The skill level of the learner (e.g., "beginner", "intermediate").
 * @param {Array<string>} params.includedLanguages - The languages to include in the translations.
 * @param {number} params.wordCount - The number of words to generate.
 * @param {string} params.topic - The topic for the vocabulary.
 * @param {Array<string>} params.wordTypes - The types of words to generate (e.g., "nouns", "verbs").
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of generated words with translations.
 * @throws Will throw an error if the AI response is invalid or if the API call fails.
 */
export const generateWordsWithAI = async ({ skillLevel, includedLanguages, wordCount, topic, wordTypes }) => {
  const maximumWordCount = 25;
  const prompt = `
    You are tasked with generating vocabulary translation tasks for a language learner.
    Generate a JSON array containing ${Math.min(wordCount || 10, maximumWordCount)} unique ${wordTypes?.join(" or ") || "words or short expressions"}.
    All items must be related to "${topic || "general"}" and appropriate for skill level "${skillLevel || "average"}".
    
    Each item must have:
    {
      "id": <number>,
      "translations": [
        { "languageName": "English", "word": "..." },
        { "languageName": "Finnish", "word": "..." },
        ...
      ]
    }
    
    Requirements:
    - Translations must be included for: ${includedLanguages?.join(", ")}
    - Words must be grammatically correct and follow language-specific rules.
    - Avoid words that are identical across multiple translation languages.
    - Provide only a JSON array in the response.
  `;
  // The client needs to be initialized here because if initialized in the top level the environment variables
  // may be undefined and therefore the API key would be invalid.
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    contents: prompt,
  });

  return parseAIResponseToJson(response);
};
