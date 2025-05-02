import { z } from 'zod';

const groupTypeEnum = z.enum(["word", "sentence", "text"]);
const languageEnum = z.enum([
  'English',
  'Finnish',
  'French',
  'German',
  'Spanish',
  'Swedish'
]);

const translationGroupFilterSchema = z.object({
  topicId: z.coerce.number().int().optional(),
  groupType: groupTypeEnum.optional(),
  minDifficultyLevel: z.coerce.number().int().min(1).max(5).optional(),
});

const groupDataSchema = z.object({
  groupType: groupTypeEnum,
  difficultyLevel: z.coerce.number().int().min(1).max(5).optional(),
  entries: z.array(z.object({
    language: languageEnum,
    content: z.string().min(1)
  }).strict()),
  meta: z.object({}).optional().nullable(),
});

const topicIdSchema = z.coerce.number().int().min(1);

export const validateGetTranslationGroups = (req, res, next) => {
  const result = translationGroupFilterSchema.safeParse(req.query);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }
  next();
};

export const validateDeleteTranslationGroups = (req, res, next) => {
  const groupIdsSchema = z.array(z.number().int().min(1));
  const result = groupIdsSchema.safeParse(req.body.groupIds);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }
  // check for duplicates
  if (new Set(req.body.groupIds).size !== req.body.groupIds.length) {
    return res.status(400).json({ error: "Duplicate group IDs are not allowed" });
  }
  next();
};

export const validateUpdateTranslationGroup = (req, res, next) => {
  const extendedGroupDataSchema = groupDataSchema.extend({
    groupId: z.number().int().min(1),
  });
  const result = extendedGroupDataSchema.safeParse(req.body.groupData);
  const topicIdResult = topicIdSchema.safeParse(req.body.topicId);
  if (!result.success || !topicIdResult.success) {
    const errors = [
      ...(result.error?.errors || []),
      ...(topicIdResult.error?.errors || [])
    ];
    return res.status(400).json({ error: errors });
  }
  next();
};

export const validateAddTranslationGroups = (req, res, next) => {
  const topicIdSchema = z.coerce.number().int().min(1);
  const groupsDataSchema = z.array(groupDataSchema).nonempty({ message: "At least one group is required" });

  const groupsResult = groupsDataSchema.safeParse(req.body.groupsData);
  const topicIdResult = topicIdSchema.safeParse(req.body.topicId);

  if (!groupsResult.success || !topicIdResult.success) {
    const errors = [
      ...(groupsResult.error?.errors || []),
      ...(topicIdResult.error?.errors || [])
    ];
    return res.status(400).json({ error: errors });
  }
  next();
};

