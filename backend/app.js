import express from "express";
import path from "path";
import { fileURLToPath } from "url";

import translationGroupsRouter from "./translation-groups/translationGroupsRouter.js";
import aiRouter from "./ai/aiRouter.js";
import topicsRouter from "./topics/topicsRouter.js";
import usersRouter from "./users/usersRouter.js";
import tagsRouter from "./tags/tagsRouter.js";
import { handleInvalidJsonError, enforceJsonContentType } from "./middleware/errorHandlingMiddleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "public");

const app = express();

app.use(express.json());
app.use(handleInvalidJsonError);
app.use(enforceJsonContentType);
app.use(express.static(publicPath));
app.use("/api/translation-groups", translationGroupsRouter);
app.use("/api/ai/", aiRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/users", usersRouter);

// needed for react router to work properly in production
// when the user refreshes the page or tries to access a route directly
// the server needs to send the index.html file so that react router can take over
// and render the correct component
app.get("*", (_, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

export default app;
