import { z } from 'zod';

export const modifyTagsSchema = z.object({
  added: z.array(z.string().min(1).max(50)),
  deleted: z.array(z.number().int().positive()),
  edited: z.array(z.object({
    tagId: z.number().int().positive(),
    newTagName: z.string().min(1).max(50)
  }))
});

/**
 * Middleware to validate the request body for modifying user tags.
 * Body should contain following fields:
 * - "added": Array of strings (tag names) with a minimum length of 1 and a maximum length of 50.
 * - "deleted": Array of integers (tag IDs) that are positive integers.
 * - "edited": Array of objects, each containing:
 * - "tagId": Positive integer representing the ID of the tag to be edited.
 * - "newTagName": String with a minimum length of 1 and a maximum length of 50.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const validateModifyUserTags = (req, res, next) => {
  const result = modifyTagsSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: result.error.errors });
  }

  const deletedSet = new Set(result.data.deleted);
  const addedSet = new Set(result.data.added);

  if (deletedSet.size !== result.data.deleted.length) {
    return res.status(400).json({ error: "Duplicate IDs in deleted tags" });
  }

  if (addedSet.size !== result.data.added.length) {
    return res.status(400).json({ error: "Duplicate names in added tags" });
  }

  if (result.data.edited.some(tag => deletedSet.has(tag.tagId))) {
    return res.status(400).json({ error: "Cannot delete and edit a tag with the same ID at the same time" });
  }

  if (result.data.edited.some(tag => addedSet.has(tag.newTagName))) {
    return res.status(400).json({ error: "Cannot add and edit a tag with the same name at the same time" });
  }

  next();

};

export default validateModifyUserTags;
