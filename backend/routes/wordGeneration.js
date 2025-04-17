import express from "express";
import { GoogleGenAI } from "@google/genai"
import { verifyToken } from "./auth.js";

const wordGenerationRouter = express.Router();
wordGroupsRouter.use(verifyToken);

wordGenerationRouter.post("/generate", async (req, res) => {
  const { skillLevel, includedLanguages, wordCount, topic, wordType } = req.body;
  //parameters e
  const prompt = `Generate a JSON array containing ${wordCount || 10} unique items. Each item should be a ${wordType || "word or a very short expression"}.
  All items must:
  - Be related to the topic: "${topic || "general"}"
  - Be appropriate for a learner at skill level: "${skillLevel || "average"}"
  
  Each item must have this structure:
  {
    "id": <number>,
    "translations": [
      { "languageName": "English", "word": "..." },
      { "languageName": "Finnish", "word": "..." },
      ...
    ]
  }
  
  Requirements:
  - Translations must be included for all of the following languages: ${includedLanguages.join(", ")}
  - All entries must be unique
  - Do not include any explanations or extra text — only return a JSON array in the format shown above
  `;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      contents: prompt,
    });
    console.log("AI response: ", response);
    const parsedResponse = parseAIResponseToJson(response);
    res.json(parsedResponse);
    // parse the json code block and return it as a response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating words! Please try again later" });
  }
});


/**
 * Parses the AI response to JSON format. The response should always be a JSON code block meaning
 * it starts with ```json and ends with ```.
 * This function removes the code block markers and parses the JSON string to a valid JSON object
 * that can be send as a response to the client.
 * @param {string} response - The AI response containing the JSON code block.
 * @returns {object} - The parsed JSON object.
 */
const parseAIResponseToJson = (response) => JSON.parse(response.text.replace(/```json/g, '').replace(/```/g, ''));

export default wordGenerationRouter;
