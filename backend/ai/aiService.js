import { GoogleGenAI } from "@google/genai";

const cefrMap = {
  1: "A1",
  2: "A2",
  3: "B1/B2",
  4: "C1/C2",
  5: "C2",
};

const cefrReverseMap = {
  "A1": 1,
  "A2": 2,
  "B1": 3,
  "B2": 3,
  "C1": 4,
  "C2": 5,
};


/**
 * Parses the AI response to JSON format. The response from the AI assuming it only contains JSON
 * means that the json will be in a code block starting with ```json and ending with ```. There should
 * be a better way to do this but haven't found one yet.
 * 
 * @param {string} response - The AI response containing the JSON code block.
 * @returns {object} - The parsed JSON object.
 * @throws Will throw an error if the JSON parsing fails.
 */
const parseAIResponseToJson = (response) => {
  try {
    const rawText = response?.text?.replace(/```json/g, "").replace(/```/g, "");
    return JSON.parse(rawText);
  } catch (err) {
    console.error("JSON Parsing Error:", err);
    throw new Error("Unable to get valid response from the AI");
  }
};
export const generateWordsWithAI = async ({ includedLanguages, minDifficultyLevel, maxDifficultyLevel, wordAmount, wordType, topic }) => {
  const prompt = `
  You are tasked with generating vocabulary translation tasks for a language learner.
  Generate a JSON array containing ${wordAmount} unique ${wordType || "words"}.
  All items must be related to the topic: "${topic}" and must fall within the difficulty range of ${minDifficultyLevel} to ${maxDifficultyLevel}.

  Difficulty levels and their CEFR equivalents:
  - 1 = A1
  - 2 = A2
  - 3 = B1/B2
  - 4 = C1/C2
  - 5 = C2

  Each item must be a JSON object with the following structure:
  {
    "id": <number>,
    "translations": [
      { "languageName": "language1", "word": "word1", "difficulty": <difficulty as integer>, "cefrLevel": "<CEFR_LEVEL>" },
      { "languageName": "language2", "word": "<word>", "difficulty": <difficulty as integer>, "cefrLevel": "<CEFR_LEVEL>" },
      ...
    ]
  }
  Requirements:
  - Translations must be included for: ${includedLanguages?.join(", ")}
  - Words must be grammatically correct and follow language-specific rules.
  - Avoid words that are identical across multiple translation languages.
  - Ensure words fit within the specified difficulty range.
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
