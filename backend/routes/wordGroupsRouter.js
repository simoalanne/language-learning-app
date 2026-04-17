import express from "express";
import { requireApiAuth } from "../middleware/authMiddleware.ts";
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
wordGroupsRouter.get("/users", requireApiAuth, getWordGroups);
wordGroupsRouter.get("/users/:id", requireApiAuth, getWordGroup);
wordGroupsRouter.post("/users", requireApiAuth, validateWordGroup, createWordGroup);
wordGroupsRouter.post("/users/bulk", requireApiAuth, validateBulkWordGroups, createBulkWordGroups);
wordGroupsRouter.delete("/users/:id", requireApiAuth, deleteWordGroup);
wordGroupsRouter.put("/users/:id", requireApiAuth, validateWordGroup, updateWordGroup);

export default wordGroupsRouter;
