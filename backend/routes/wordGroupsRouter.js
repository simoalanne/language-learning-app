import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { validateWordGroup, validateBulkWordGroups } from "../middleware/wordGroupsMiddleware.js";
import {
  getWordGroups,
  getPublicWordGroups,
  getWordGroup,
  createWordGroup,
  createBulkWordGroups,
  deleteWordGroup,
  updateWordGroup
} from "../controllers/wordGroupsController.js";

const wordGroupsRouter = express.Router();

// API Routes
wordGroupsRouter.get("/public", getPublicWordGroups);
wordGroupsRouter.get("/users", verifyToken, getWordGroups);
wordGroupsRouter.get("/users/:id", verifyToken, getWordGroup);
wordGroupsRouter.post("/users", verifyToken, validateWordGroup, createWordGroup);
wordGroupsRouter.post("/users/bulk", verifyToken, validateBulkWordGroups, createBulkWordGroups);
wordGroupsRouter.delete("/users/:id", verifyToken, deleteWordGroup);
wordGroupsRouter.put("/users/:id", verifyToken, validateWordGroup, updateWordGroup);

export default wordGroupsRouter;
