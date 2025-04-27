import { Router } from 'express';
import * as tagsController from './tagsController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import validateModifyUserTags from './tagsValidation.js';

const tagsRouter = Router();

tagsRouter.use(verifyToken);
tagsRouter.get('/', tagsController.getUserTags);
// this is a centralized route that handles modifying user tags be it adding, deleting or editing existing tags
tagsRouter.put('/modify-user-tags', validateModifyUserTags, tagsController.modifyUserTags);

export default tagsRouter;
