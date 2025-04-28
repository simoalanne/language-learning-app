import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "../config/config.js";

/**
 * Hashes the provided password using bcrypt.
 * This should be used when a user registers or changes their password.
 * The hashed password should then be stored in the database.
 * 
 * @param {string} password - The plain text password to hash.
 * @returns {Promise<string>} - Returns a promise that resolves to the hashed password.
 */
export const hashPassword = async (password) => bcrypt.hash(password, 10);

/**
 * Verifies if the provided password as plain text matches the hashed password.
 * Should be used during login or when user tries to change their password to confirm their identity.
 * 
 * @param {string} password - The plain text password to verify.
 * @param {string} hashedPassword - The hashed password to compare against.
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the password matches, false otherwise.
 */
export const verifyPassword = async (password, hashedPassword) => bcrypt.compare(password, hashedPassword);

/**
 * Generates a JWT token containing at least the username and user ID. Optionally, it could include other user data if needed.
 * The token should then be sent to the client and stored in local storage or a cookie.
 * The client should then include this token in the Authorization header for all requests to protected routes.
 * 
 * @param {Object} user - The user object containing at least the fields:
 * - username: The username of the user.
 * - id: The ID of the user.
 * @returns {string} - Returns the generated JWT token to be sent to the client.
 */
export const generateJwtToken = (user) => jwt.sign(user, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

/**
 * Decodes the JWT token and verifies its validity.
 * If the token is valid, it returns the decoded user data.
 * If the token is invalid or expired, it returns null.
 *
 * @param {string} token - The JWT token to decode and verify.
 * @return {Object|null} - Returns the decoded user data if the token is valid, null otherwise.
 */
export const decodeJwtToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
}
