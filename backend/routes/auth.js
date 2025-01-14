import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
const authRouter = express.Router();
import { addUser, getUserByUsername } from "../database/db.js";
import { userValidation } from "../utils/validation.js";


authRouter.post("/validate-username", async (req, res) => {
  const { username } = req.body;
  const user = await getUserByUsername(username);
  if (user) {
    return res.status(409).json({ error: `Username ${username} already exists. please choose another name` });
  }
  res.sendStatus(200);
});

authRouter.post("/register", userValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  try {
    const { username, password } = req.body;
    const user = await getUserByUsername(username);
    if (user) {
      return res.status(409).json({ error: `Username ${username} already exists. please choose another name` });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const id = await addUser(username, passwordHash);
    const token = generateToken({ username, id });

    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.sendStatus(500).json({ error });
  }
});

authRouter.post("/login", userValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  try {
    const { username, password } = req.body;

    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.status(200).json({ token: generateToken(user) });
  } catch (error) {
    console.error(error);
    res.sendStatus(500).json({ error });
  }
});

const generateToken = (user) => {
  return jwt.sign(
    { username: user.username, id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
};

/**
 * Middleware to verify the token
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const verifyToken = async (req, res, next) => {
  if (req.path.startsWith("/public")) {
    return next();
  }
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }
  try {
    const actualToken = token.split(" ")[1];
    const decodedToken = jwt.verify(actualToken, process.env.JWT_SECRET);
    // because the app is not persistent and will refresh on inactivity we need to check if the user still exists
    const user = await getUserByUsername(decodedToken.username);
    if (!user) {
      console.error("Database refreshed due to inactivity, token is valid but cant be used in app anymore");
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

authRouter.get("/verify-token", verifyToken, (req, res) => {
  res.status(200).json({ isValid: true, user: req.user });
});

export default authRouter;
