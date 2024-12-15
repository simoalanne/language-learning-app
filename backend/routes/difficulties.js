import express from 'express';
import { getAllDifficultyLevels } from '../db.js';

const difficultiesRouter = express.Router();

difficultiesRouter.get('/', async (_, res) => {
  const difficultyLevels = await getAllDifficultyLevels();
  res.json(difficultyLevels);
});

export default difficultiesRouter;