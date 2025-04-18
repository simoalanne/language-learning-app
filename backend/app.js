import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import wordGroupsRouter from "./routes/wordGroups.js";
import authRouter from "./routes/authRouter.js";
import aiRouter from "./routes/aiRouter.js";
import { handleInvalidJsonError, enforceJsonContentType } from "./middleware/errorHandlingMiddleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "public");

const app = express();

app.use(express.json());
app.use(handleInvalidJsonError);
app.use(enforceJsonContentType);
app.use(express.static(publicPath));

app.use("/api/word-groups", wordGroupsRouter);
app.use("/api/ai/", aiRouter);
app.use("/api/auth", authRouter);

export default app;
