import express from "express";
import {
  addNewWordGroup,
  getWordGroupById,
  deleteWordGroupById,
  updateWordGroup,
  getMultipleWordGroups,
  getTotalAndPages,
} from "../database/db.js";
import { wordGroupValidation } from "../utils/validation.js";
import { verifyToken } from "./auth.js";
const wordGroupsRouter = express.Router();
import { body, param, query, validationResult } from "express-validator";
const validLanguages = [
  "English",
  "Finnish",
  "French",
  "German",
  "Spanish",
  "Swedish",
];

wordGroupsRouter.use(verifyToken);

wordGroupsRouter.get("/", async (req, res) => {
  const includePagination = req.query.paginationIncluded === "true";
  const offset = parseInt(req.query.offset) || 0;
  let limit = parseInt(req.query.limit);
  const wordGroups = await getMultipleWordGroups({
    offset,
    limit,
    getAll: !limit,
    userId: req.user.id,
  });
  const { total, pages } = await getTotalAndPages("word_groups", limit);
  if (!includePagination) {
    // app doesnt use pagination currently so dont send data it wont use
    res.json(wordGroups);
    return;
  }
  res.json({
    ...{ wordGroups },
    ...{ pagination: { total, limit, offset, pages } },
  });
});

// returns all the public word groups which dont belong to any user. no need for pagination
// because it's either all or nothing thats needed from here in the app
wordGroupsRouter.get("/public", async (_, res) => {
  const wordGroups = await getMultipleWordGroups({
    offset: 0,
    limit: 0,
    getAll: true,
  });
  res.json(wordGroups);
});

wordGroupsRouter.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }
    try {
      const groupId = parseInt(req.params.id);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }

      const response = await getWordGroupById(groupId, req.user.id);

      res.json(response);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }
);

wordGroupsRouter.post("/", wordGroupValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  try {
    const wordGroupObj = req.body;
    const id = await addNewWordGroup(wordGroupObj, req.user.id);
    res.json(id);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

wordGroupsRouter.post(
  "/bulk",
  [
    body("bulkData").isArray().withMessage("Bulk data must be an array"),
    body("bulkData.*.translations")
      .isArray()
      .withMessage("Translations must be an array")
      .bail()
      .isLength({ min: 2 })
      .withMessage("At least two translations are required"),

    body("bulkData.*.translations.*.languageName")
      .isString()
      .withMessage("Each language name must be a string")
      .bail()
      .custom((value) => validLanguages.includes(value))
      .withMessage(
        `Invalid language name. Valid languages are: ${validLanguages.join(
          ", "
        )}`
      ),

    body("bulkData.*.translations.*.word")
      .isString()
      .withMessage("Each word must be a string")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Word cannot be empty"),

    body("bulkData.*.translations.*.synonyms")
      .isArray()
      .withMessage("Synonyms must be an array"),

    body("bulkData.*.translations.*.synonyms.*")
      .isString()
      .withMessage("Each synonym must be a string"),

    body("bulkData.*.tags").isArray().withMessage("Tags must be an array"),

    body("bulkData.*.tags.*")
      .isString()
      .withMessage("Each tag must be a string"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    try {
      const wordGroups = req.body.bulkData;
      const ids = [];
      for (const wordGroup of wordGroups) {
        const id = await addNewWordGroup(wordGroup, req.user.id);
        ids.push(id);
      }
      res.json(ids);
    } catch (error) {
      console.error(error);
      res.status(500).send("Server error");
    }
  }
);

wordGroupsRouter.delete(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer")],
  async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      if (isNaN(groupId)) {
        return res.status(400).json({ error: "Invalid group ID" });
      }
      const id = await deleteWordGroupById(groupId, req.user.id);
      res.json(id);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error });
    }
  }
);

wordGroupsRouter.put("/:id", wordGroupValidation, async (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    if (isNaN(groupId)) {
      return res.status(400).json({ error: "Invalid group ID" });
    }

    const response = await updateWordGroup(req.body, req.user.id, groupId);
    if (response?.error) {
      return res.status(400).json(response);
    }
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

export default wordGroupsRouter;
