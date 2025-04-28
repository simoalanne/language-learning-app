import { Router } from 'express';
import * as usersController from './usersController.js';
import * as usersValidation from './usersValidation.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const usersRouter = Router();
usersRouter.post("/register", usersValidation.validateUser, usersController.registerUser);
usersRouter.post("/login", usersValidation.validateUser, usersController.loginUser);

usersRouter.use(verifyToken);
usersRouter.post("/change-password", usersValidation.validateChangePassword, usersController.changePassword);
usersRouter.put("/change-username", usersValidation.validateChangeUsername, usersController.changeUsername);
usersRouter.get("/profile", usersController.getUserProfile);
usersRouter.put("/update-profile", usersController.updateUserProfile);
usersRouter.delete("/delete-account", usersController.deleteUserAccount);

export default usersRouter;
