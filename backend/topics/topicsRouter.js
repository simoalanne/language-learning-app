import { Router } from 'express';
import * as topicsController from './topicsController.js';
import { validateTopic, validateTopicId } from './topicsValidation.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const topicsRouter = Router();

topicsRouter.get('/public', topicsController.getPublicTopics);

topicsRouter.use(verifyToken);
topicsRouter.get('/', topicsController.getUserTopics);
topicsRouter.post('/', validateTopic, topicsController.addTopic);
topicsRouter.put('/', validateTopicId, validateTopic, topicsController.updateTopic);
topicsRouter.delete('/:id', validateTopicId, topicsController.deleteTopic);
topicsRouter.delete('/', topicsController.deleteAllTopics);

export default topicsRouter;
