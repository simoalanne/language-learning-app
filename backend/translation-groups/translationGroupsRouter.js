import { Router } from "express";
import * as translationGroupsController from "./translationGroupsController.js";
import * as translationGroupValidation from "./translationGroupsValidation.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const translationGroupsRouter = Router();

translationGroupsRouter.get(
  "/public/:topicId",
  translationGroupValidation.validateGetTranslationGroups,
  translationGroupsController.getPublicTranslationGroups
);

translationGroupsRouter.use(verifyToken);

translationGroupsRouter.get(
  "/:topicId",
  translationGroupValidation.validateGetTranslationGroups,
  translationGroupsController.getTranslationGroups
);

translationGroupsRouter.post(
  "/add-word-group",
  translationGroupValidation.validateAddWordGroup,
  translationGroupsController.addWordGroup
);

translationGroupsRouter.post(
  "/add-sentence-group",
  translationGroupValidation.validateAddSentenceGroup,
  translationGroupsController.addSentenceGroup
);

translationGroupsRouter.post(
  "/add-long-text-group",
  translationGroupValidation.validateAddLongTextGroup,
  translationGroupsController.addLongTextGroup
);

translationGroupsRouter.put(
  "/update-word-group/",
  translationGroupValidation.validateUpdateWordGroup,
  translationGroupsController.updateWordGroup
);

translationGroupsRouter.put(
  "/update-sentence-group/",
  translationGroupValidation.validateUpdateSentenceGroup,
  translationGroupsController.updateSentenceGroup
);

translationGroupsRouter.put(
  "/update-long-text-group/",
  translationGroupValidation.validateUpdateLongTextGroup,
  translationGroupsController.updateLongTextGroup
);

translationGroupsRouter.delete(
  "/",
  translationGroupValidation.validateDeleteTranslationGroups,
  translationGroupsController.deleteTranslationGroups
);

export default translationGroupsRouter;
