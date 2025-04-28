import { z } from "zod";

const idSchema = z.number().positive();
const languageEnum = z.enum(["English", "Finnish", "French", "German", "Spanish", "Swedish"]);
const wordTypeEnum = z.enum(["noun", "verb", "adjective"]).optional();
const toneEnum = z.enum(["serious", "playful"]);
const sentenceTypeEnum = z.enum(["statement", "question", "exclamation"]);

const wordGroupSchema = z.object({
  wordType: wordTypeEnum,
  difficultyLevel: z.number().min(1).max(5),
  words: z.array(
    z.object({
      language: languageEnum,
      word: z.string().min(1),
      synonyms: z.array(z.string()).max(2)
    })
  ).min(2)
});


const sentenceGroupSchema = z.object({
  sentenceType: sentenceTypeEnum,
  sentences: z.array(
    z.object({
      language: languageEnum,
      sentence: z.string().min(1)
    })
  ).min(2)
});


const longTextGroupSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  tone: toneEnum,
  longTexts: z.array(
    z.object({
      language: languageEnum,
      title: z.string().min(1),
      body: z.string().min(1),
    })
  ).min(2)
});

const idsSchema = z.array(z.number().positive()).min(1);

export const validateGetTranslationGroups = (req, res, next) => {
  const { topicId } = req.params;
  const result = idSchema.safeParse(Number(topicId));
  if (!result.success) {
    return res.status(400).json({ error: "Invalid topic ID" });
  }
  next();
}

export const validateAddWordGroup = (req, res, next) => {
  const { wordGroup, topicId } = req.body;
  const wgResult = wordGroupSchema.safeParse(wordGroup);
  const topicIdResult = idSchema.safeParse(Number(topicId));
  const errors = [
    ...wgResult.error?.errors || [],
    ...topicIdResult.error?.errors || []
  ].map(err => err.message);
  if (!wgResult.success || !topicIdResult.success) {
    return res.status(400).json({ errors });
  }
  next();
}

export const validateAddSentenceGroup = (req, res, next) => {
  const { sentenceGroup, topicId } = req.body;
  const sgResult = sentenceGroupSchema.safeParse(sentenceGroup);
  const topicIdResult = idSchema.safeParse(Number(topicId));
  const errors = [
    ...sgResult.error?.errors || [],
    ...topicIdResult.error?.errors || []
  ].map(err => err.message);
  if (!sgResult.success || !topicIdResult.success) {
    return res.status(400).json({ errors });
  }
  next();
}

export const validateAddLongTextGroup = (req, res, next) => {
  const { longTextGroup, topicId } = req.body;
  const ltgResult = longTextGroupSchema.safeParse(longTextGroup);
  const topicIdResult = idSchema.safeParse(Number(topicId));
  const errors = [
    ...ltgResult.error?.errors || [],
    ...topicIdResult.error?.errors || []
  ].map(err => err.message);
  if (!ltgResult.success || !topicIdResult.success) {
    return res.status(400).json({ errors });
  }
  next();
}

export const validateUpdateWordGroup = (req, res, next) => {
  const { wordGroup, groupId, topicId } = req.body;
  const wgResult = wordGroupSchema.safeParse(wordGroup);
  const groupIdResult = idSchema.safeParse(groupId);
  const topicIdResult = idSchema.safeParse(topicId);
  const errors = [
    ...wgResult.error?.errors || [],
    ...groupIdResult.error?.errors || [],
    ...topicIdResult.error?.errors || []
  ].map(err => err.message);
  if (!wgResult.success || !groupIdResult.success || !topicIdResult.success) {
    return res.status(400).json({ errors });
  }
  next();
}

export const validateUpdateSentenceGroup = (req, res, next) => {
  const { sentenceGroup, groupId, topicId } = req.body;
  const sgResult = sentenceGroupSchema.safeParse(sentenceGroup);
  const groupIdResult = idSchema.safeParse(groupId);
  const topicIdResult = idSchema.safeParse(topicId);
  const errors = [
    ...sgResult.error?.errors || [],
    ...groupIdResult.error?.errors || [],
    ...topicIdResult.error?.errors || []
  ].map(err => err.message);
  if (!sgResult.success || !groupIdResult.success || !topicIdResult.success) {
    return res.status(400).json({ errors });
  }
  next();
}

export const validateUpdateLongTextGroup = (req, res, next) => {
  const { longTextGroup, groupId, topicId } = req.body;
  const ltgResult = longTextGroupSchema.safeParse(longTextGroup);
  const groupIdResult = idSchema.safeParse(groupId);
  const topicIdResult = idSchema.safeParse(topicId);
  const errors = [
    ...ltgResult.error?.errors || [],
    ...groupIdResult.error?.errors || [],
    ...topicIdResult.error?.errors || []
  ].map(err => err.message);
  if (!ltgResult.success || !groupIdResult.success || !topicIdResult.success) {
    return res.status(400).json({ errors });
  }
  next();
}

export const validateDeleteTranslationGroups = (req, res, next) => {
  const groupIds = req.body.groupIds;

  const result = idsSchema.safeParse(groupIds);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors.map(err => err.message) });
  }
  next();
}
