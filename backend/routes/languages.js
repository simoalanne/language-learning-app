import express from "express";
import { getAllLanguages } from "../database/db.js";
const languagesRouter = express.Router();

languagesRouter.get("/", async (_, res) => {
  try {
    const languages = await getAllLanguages();
    res.json(languages.map((lang) => ({ languageName: lang.language_name })));
  } catch (error) {
    console.error(err);
    res.status(500).json({ error });
  }
});

export default languagesRouter;
