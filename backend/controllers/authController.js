import { getUserByUsername, addUser } from "../database/db.js";
import { hashPassword, verifyPassword, generateToken } from "../services/authService.js";

export const validateUsername = async (req, res) => {
  const { username } = req.body;
  const user = await getUserByUsername(username);
  if (user) return res.status(409).json({ error: `Username ${username} already exists.` });

  res.sendStatus(200);
};

export const register = async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await getUserByUsername(username);
  if (existingUser) return res.status(409).json({ error: `Username already exists.` });

  const passwordHash = await hashPassword(password);
  const id = await addUser(username, passwordHash);
  const token = generateToken({ username, id });

  res.status(201).json({ token });
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  const user = await getUserByUsername(username);
  if (!user || !(await verifyPassword(password, user.password))) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  res.status(200).json({ token: generateToken(user) });
};

/**
 * Route handler to verify the JWT token.
 * If the token is valid, it returns a 200 status with user information.
 * If the token is invalid, it returns a 401 status with an error message.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const verifyToken = async (req, res) => {
  res.status(200).json({ isValid: true, user: req.user });
};
