import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import wordGroupsRouter from "./routes/wordGroupsRouter.js";
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

// needed for react router to work properly in production
// when the user refreshes the page or tries to access a route directly
// the server needs to send the index.html file so that react router can take over
// and render the correct component
app.get("*", (_, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

export default app;
