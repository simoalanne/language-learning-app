import express from "express";
import { getAllLanguages } from "../database/db.js";
const languagesRouter = express.Router();

languagesRouter.get("/", async (_, res) => {
  const languages = await getAllLanguages();
  res.json(
    languages.map((lang) => ({ languageName: lang.language_name }))
  );
});

export default languagesRouter;
