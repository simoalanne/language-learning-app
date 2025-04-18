import { generateWordsWithAI } from "../services/aiService.js";

export const generateWords = async (req, res) => {
  try {
    const words = await generateWordsWithAI(req.body);
    res.json(words);
  } catch (error) {
    console.error("Error generating AI words:", error);
    res.status(500).json({ error: "Failed to generate words. Try again later." });
  }
};
