import { body, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { getUserByUsername } from "../database/db.js";

/**
 * Middleware to validate user input using express-validator.
 * It checks for the presence of username and password in the request body.
 * If validation fails, it sends a 400 Bad Request response with the validation errors.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const userValidation = [
  body("username")
    .isLength({ min: 2, max: 25 })
    .withMessage("Username must be between 2 and 25 characters long")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username must contain only letters, numbers, and underscores"),

  body("password")
    .isLength({ min: 8, max: 50 })
    .withMessage("Password must be between 8 and 50 characters long"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

/**
 * Middleware to verify JWT token. If the token is valid, it adds the decoded user information to the request object.
 * If the token is invalid or expired, it sends a 401 Unauthorized response.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token is missing" });

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await getUserByUsername(decodedToken.username);
    if (!user) return res.status(401).json({ error: "Invalid or expired token" });
    req.user = decodedToken;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};