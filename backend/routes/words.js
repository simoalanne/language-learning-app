import express from "express";
import { getAllWords } from "../database/db.js";
const wordsRouter = express.Router();

wordsRouter.get("/", async (_, res) => {
  const words = await getAllWords();
  res.json(words);
});

export default wordsRouter;
