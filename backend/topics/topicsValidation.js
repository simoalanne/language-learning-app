import { z } from 'zod';

const topicSchema = z.object({
  name: z.string().min(1, "Topic name is required")
    .max(50, "Topic name must be less than 50 characters")
    .regex(/^[a-zA-Z0-9\s]+$/, "Topic name can only contain letters, numbers, and spaces"),
  isPublic: z.boolean(),
});

const topicIdSchema = z.number().int().positive("Topic ID must be a positive integer");

const topicIdsSchema = z.array(topicIdSchema).min(1, "At least one topic ID is required");

export const validateAddTopic = (req, res, next) => {
  const topicResult = topicSchema.safeParse(req.body);
  if (!topicResult.success) {
    return res.status(400).json({ errors: topicResult.error.errors });
  }
  next();
};

export const validateUpdateTopic = (req, res, next) => {
  const idResult = topicIdSchema.safeParse(req.body.topicId);
  const topicResult = topicSchema.safeParse(req.body);
  const errors = [
    ...(idResult.success ? [] : idResult.error.errors),
    ...(topicResult.success ? [] : topicResult.error.errors),
  ];
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
}

export const validateDeleteTopics = (req, res, next) => {
  const idsResult = topicIdsSchema.safeParse(req.body.topicIds);
  if (!idsResult.success) {
    return res.status(400).json({ errors: idsResult.error.errors });
  }
  next();
};
