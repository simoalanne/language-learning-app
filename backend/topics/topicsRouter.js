import { Router } from 'express';
import * as topicsController from './topicsController.js';
import * as topicsValidation from './topicsValidation.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const topicsRouter = Router();

topicsRouter.get('/public', topicsController.getPublicTopics);

topicsRouter.use(verifyToken);
topicsRouter.get('/', topicsController.getUserTopics);
topicsRouter.post('/', topicsValidation.validateAddTopic, topicsController.addTopic);
topicsRouter.put('/', topicsValidation.validateUpdateTopic, topicsController.updateTopic);
topicsRouter.delete('/bulk', topicsValidation.validateDeleteTopics, topicsController.deleteMultipleTopics);

export default topicsRouter;
