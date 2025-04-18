import express from "express";
import { validateUsername, register, login, verifyToken } from "../controllers/authController.js";
import { userValidation, verifyToken as verifyTokenMiddleware } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/validate-username", validateUsername);
authRouter.post("/register", userValidation, register);
authRouter.post("/login", userValidation, login);
authRouter.get("/verify-token", verifyTokenMiddleware, verifyToken);
export default authRouter;
