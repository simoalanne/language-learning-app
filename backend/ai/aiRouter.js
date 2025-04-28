import express from "express";
import { generateWords } from "./aiController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const aiRouter = express.Router();

aiRouter.post("/generate-words", verifyToken, generateWords);

export default aiRouter;
