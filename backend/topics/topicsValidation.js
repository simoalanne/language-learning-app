import { z } from 'zod';

const topicSchema = z.object({
  name: z.string().max(75, "Name cannot be longer than 75 characters"),
  description: z.string().max(200, "Description cannot be longer than 200 characters"),
  tags: z.array(z.string().max(50, "No tag can be longer than 50 characters"))
    .max(3, "You can only have up to 3 tags"),
});

const topicIdSchema = z.number().int().positive("Topic ID must be a positive integer");


export const validateTopic = (req, res, next) => {
  try {
    topicSchema.parse(req.body);
    next();
  } catch (e) {
    return res.status(400).json({ errors: e.errors });
  }
};

export const validateTopicId = (req, res, next) => {
  try {
    topicIdSchema.parse(Number(req.params.id || req.body.topicId));
    next();
  } catch (e) {
    return res.status(400).json({ errors: e.errors });
  }
}
