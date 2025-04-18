import express from "express";
import { validateUsername, register, login, verifyToken } from "../controllers/authController.js";
import { userValidation, verifyToken as verifyTokenMiddleware } from "../middleware/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/validate-username", validateUsername);
authRouter.post("/register", userValidation, register);
authRouter.post("/login", userValidation, login);
// the purpose of this route is for client to use this to check if the token is valid or not
// in most cases client could do this locally by checking if the token is expired or not
// but because in current implementation the server restarts when idle for too long
// this creates scenarios where the client has a technically valid token
// but the server can't recognize it anymore. This could be fixed by changing to persistent
// server and/or database.
authRouter.get("/verify-token", verifyTokenMiddleware, verifyToken);
export default authRouter;
