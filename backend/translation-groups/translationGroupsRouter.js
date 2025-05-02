import { Router } from "express";
import * as translationGroupsController from "./translationGroupsController.js";
import * as translationGroupsValidation from "./translationGroupsValidation.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const translationGroupsRouter = Router();

translationGroupsRouter.get(
  "/public/",
  translationGroupsValidation.validateGetTranslationGroups,
  translationGroupsController.getPublicTranslationGroups
);

translationGroupsRouter.use(verifyToken);

translationGroupsRouter.get(
  "/",
  translationGroupsValidation.validateGetTranslationGroups,
  translationGroupsController.getTranslationGroups
);

translationGroupsRouter.post("/bulk",
  translationGroupsValidation.validateAddTranslationGroups,
  translationGroupsController.addTranslationGroups);

translationGroupsRouter.put("/",
  translationGroupsValidation.validateUpdateTranslationGroup,
  translationGroupsController.updateTranslationGroup);

translationGroupsRouter.delete("/bulk",
  translationGroupsValidation.validateDeleteTranslationGroups,
  translationGroupsController.deleteTranslationGroups);

export default translationGroupsRouter;
