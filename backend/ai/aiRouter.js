import express from "express";
import { generateWords } from "./aiController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validateWordGeneration } from "./aiValidation.js";

const aiRouter = express.Router();

aiRouter.post("/generate-words", verifyToken, validateWordGeneration, generateWords);

export default aiRouter;
