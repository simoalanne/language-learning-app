import { body, validationResult } from "express-validator";

const validLanguages = ["English", "Finnish", "French", "German", "Spanish", "Swedish"];

const validateWordGroupRules = [
  body("translations")
    .isArray({ min: 2 })
    .withMessage("Translations must be an array with at least two items"),
  body("translations.*.languageName")
    .isString()
    .bail()
    .custom(value => validLanguages.includes(value))
    .withMessage(`Invalid language name. Valid languages are: ${validLanguages.join(", ")}`),
  body("translations.*.word")
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Each word must be a non-empty string"),
  body("translations.*.synonyms")
    .optional()
    .isArray()
    .withMessage("Synonyms must be an array"),
  body("translations.*.synonyms.*")
    .optional()
    .isString()
    .withMessage("Each synonym must be a string"),
  body("tags")
    .optional()
    .isArray()
    .withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .isString()
    .withMessage("Each tag must be a string")
];

export const validateWordGroup = [
  ...validateWordGroupRules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array() });
    next();
  }
];

const validateBulkItemRules = [
  body("bulkData.*.translations")
    .isArray({ min: 2 })
    .withMessage("Each item's translations must be an array with at least two items"),
  body("bulkData.*.translations.*.languageName")
    .isString()
    .bail()
    .custom(value => validLanguages.includes(value))
    .withMessage(`Invalid language name in item. Valid languages are: ${validLanguages.join(", ")}`),
  body("bulkData.*.translations.*.word")
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Each item's word must be a non-empty string"),
  body("bulkData.*.translations.*.synonyms")
    .optional()
    .isArray()
    .withMessage("Each item's synonyms must be an array"),
  body("bulkData.*.translations.*.synonyms.*")
    .optional()
    .isString()
    .withMessage("Each synonym in an item must be a string"),
  body("bulkData.*.tags")
    .optional()
    .isArray()
    .withMessage("Each item's tags must be an array"),
  body("bulkData.*.tags.*")
    .optional()
    .isString()
    .withMessage("Each tag in an item must be a string")
];


export const validateBulkWordGroups = [
  body("bulkData")
    .isArray({ min: 1 })
    .withMessage("Bulk data must be an array with at least one item"),
  ...validateBulkItemRules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }
    next();
  }
];
