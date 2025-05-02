import { query, querySingleRow } from "../config/db.js";
import camelcaseKeys from "camelcase-keys";

/**
 * Tries to create a new user in the database using the provided username and password hash.
 * If the username already exists, it does nothing and returns null.
 *
 * @param {string} username - The username of the user.
 * @param {string} passwordHash - The hashed password of the user.
 * @returns {Promise<number|null>} - The ID of the new user or null if the username already exists.
 */
export const createUser = async (username, passwordHash) => {
  const result = await querySingleRow(
    `INSERT INTO users (username, password_hash) VALUES ($1, $2)
    ON CONFLICT (username) DO NOTHING
    RETURNING id`,
    [username, passwordHash],
  );
  return result?.id || null;
}

/**
 * Gets a user by their username.
 * 
 * @param {string} username - The username of the user.
 * @returns {Promise<Object>} - Returns a promise that resolves to the user object containing:
 * - id: The ID of the user.
 * - username: The username of the user.
 * - password: The hashed password of the user.
 */
export const getUserByUsername = async (username) => {
  const user = await querySingleRow(
    `SELECT id, username, password_hash as password FROM users WHERE username = $1`,
    [username]
  );
  return user;
};

/**
 * Gets a user by their ID.
 * 
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Object>} - Returns a promise that resolves to the user object containing:
 * - id: The ID of the user.
 * - username: The username of the user.
 * - password: The hashed password of the user.
 */
export const getUserById = async (userId) => {
  const user = await querySingleRow(
    `SELECT id, username, password_hash as password FROM users WHERE id = $1`,
    [userId]
  );
  return user;
}

/**
 * Changes the username of a user in the database.
 * If the new username already exists, it does nothing and returns false.
 * 
 * @param {number} userId - The ID of the user.
 * @param {string} newUsername - The new username to set.
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the username was changed successfully, false otherwise.
 */
export const changeUsername = async (userId, newUsername) => {
  const result = await querySingleRow(`
    UPDATE users
    SET username = $1
    WHERE id = $2 AND NOT EXISTS (
        SELECT 1 FROM users WHERE username = $1
    )
    RETURNING id;
  `, [newUsername, userId]);

  const success = !!result?.id;
  return success;
};

/**
 * Changes the password of a user in the database.
 * 
 * @param {number} userId - The ID of the user.
 * @param {string} newPasswordHash - The new hashed password to set.
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the password was changed successfully, false otherwise.
 */
export const changePassword = async (userId, newPasswordHash) => {
  const result = await querySingleRow(
    `UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id`,
    [newPasswordHash, userId],
  );
  const success = !!result?.id;
  return success;
};

/**
 * Fetches the profile of a user by their ID.
 * 
 * @param {number} userId - The ID of the user.
 * @returns {Promise<Object>} - Returns a promise that resolves to the user's profile data.
 */
export const getUserProfile = async (userId) => {
  const userData = await querySingleRow(
    `SELECT username, created_at, user_data FROM users WHERE id = $1`,
    [userId],
  );
  return camelcaseKeys(userData, { deep: true });
};

/**
 * Updates the profile of a user by their ID.
 * 
 * @param {number} userId - The ID of the user.
 * @param {Object} userData - The new profile data to set.
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the profile was updated successfully, false otherwise.
 */
export const updateUserProfile = async (userId, userData) => {
  const result = await querySingleRow(
    `UPDATE users SET user_data = $1 WHERE id = $2 RETURNING id`,
    [userData, userId]
  );
  const success = !!result?.id;
  return success;
}

/**
 * Deletes a user account by their ID.
 * 
 * @param {number} userId - The ID of the user.
 * @returns {Promise<boolean>} - Returns a promise that resolves to true if the account was deleted successfully, false otherwise.
 */
export const deleteUserAccount = async (userId) => {
  const result = await querySingleRow(
    `DELETE FROM users WHERE id = $1 RETURNING id`,
    [userId]
  );
  const success = !!result?.id;
  return success;
}
