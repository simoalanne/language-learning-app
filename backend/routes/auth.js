import express from "express";
import bcrypt from "bcrypt";
import { validationResult } from "express-validator";
const authRouter = express.Router();
import { addUser, getUserByUsername } from "../database/db.js";
import { userValidation } from "../utils/validation.js";

authRouter.post("/register", userValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array() });
  }
  try {
    const { username, password } = req.body;

    // check if username already exists
    const user = await getUserByUsername(username);
    if (user) {
      return res.status(409).json({ error: "Username already exists" });
    }

    // hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // add the user to the database
    await addUser(username, passwordHash);

    res.sendStatus(201);
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

    // check if username exists
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // check if password is correct
    const passwordCorrect = await bcrypt.compare(password, user.password);
    if (!passwordCorrect) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500).json({ error });
  }
});

export default authRouter;
