import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { clerkMiddleware } from "@clerk/express";

import wordGroupsRouter from "./routes/wordGroupsRouter.js";
import aiRouter from "./routes/aiRouter.js";
import clerkRouter from "./routes/clerkRouter.ts";
import { handleInvalidJsonError, enforceJsonContentType } from "./middleware/errorHandlingMiddleware.js";
import { dbReadyMiddleware } from "./middleware/dbReadyMiddleware.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicPath = path.join(__dirname, "public");

const app = express();

app.use("/api/auth/clerk", dbReadyMiddleware, clerkRouter);
app.use(express.json());
app.use(handleInvalidJsonError);
app.use(enforceJsonContentType);
app.use(clerkMiddleware());
app.use(express.static(publicPath));

// Add database ready check before API routes
app.use("/api/", dbReadyMiddleware);

app.use("/api/word-groups", wordGroupsRouter);
app.use("/api/ai/", aiRouter);

// needed for react router to work properly in production
// when the user refreshes the page or tries to access a route directly
// the server needs to send the index.html file so that react router can take over
// and render the correct component
app.get("*", (_, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

export default app;
