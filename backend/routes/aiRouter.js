import express from "express";
import { generateWords } from "../controllers/aiController.js";
import { requireApiAuth } from "../middleware/authMiddleware.ts";

const aiRouter = express.Router();

aiRouter.post("/generate-words", requireApiAuth, generateWords);

export default aiRouter;
