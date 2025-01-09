import { body } from "express-validator";
const validLanguages = [
  "English",
  "Finnish",
  "French",
  "German",
  "Spanish",
  "Swedish",
];
// Validation for word group object
// used in POST and PUT requests
export const wordGroupValidation = [
  body("translations").isArray().withMessage("Translations must be an array"),
  body("translations")
    .isLength({ min: 2 })
    .withMessage("At least two translations are required"),
  body("translations.*.languageName")
    .isString()
    .withMessage("Each language name must be a string"),
  body("translations.*.languageName")
    .custom((value) => validLanguages.includes(value))
    .withMessage(
      `Invalid language name. Valid languages are: ${validLanguages.join(", ")}`
    ),
  body("translations.*.word")
    .isString()
    .withMessage("Each word must be a string"),
  body("translations.*.word")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Word cannot be empty"),
  body("translations.*.synonyms")
    .isArray()
    .withMessage("Synonyms must be an array"),
  body("translations.*.synonyms.*")
    .isString()
    .withMessage("Each synonym must be a string"),
  body("tags").isArray().withMessage("Tags must be an array"),
  body("tags.*").isString().withMessage("Each tag must be a string"),
];
