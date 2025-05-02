import { z } from 'zod';

const languageEnum = z.enum([
  'English',
  'Finnish',
  'French',
  'German',
  'Spanish',
  'Swedish'
]);

const wordGenerationSchema = z.object({
  includedLanguages: z.array(languageEnum).min(2, { message: 'At least two languages are required' }),
  minDifficultyLevel: z.number().min(1).max(5, { message: 'Difficulty level must be a number between 1 and 5' }),
  maxDifficultyLevel: z.number().min(1).max(5, { message: 'Difficulty level must be a number between 1 and 5' }),
  wordAmount: z.number().min(1).max(25, { message: 'Word amount must be a number between 1 and 25' }),
  wordType: z.enum(['noun', 'verb', 'adjective']).optional(),
  topic: z.string().min(1, 50, { message: 'Topic must be a string with a maximum length of 50 characters' }),
});

export const validateWordGeneration = (req, res, next) => {
  if (req.body.minDifficultyLevel > req.body.maxDifficultyLevel) {
    return res.status(400).json({ error: 'Max difficulty level must be greater than or equal to min difficulty level' });
  }
  const result = wordGenerationSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }
  next();
};
