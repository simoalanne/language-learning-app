import express from "express";
import { initDb, closeDb } from "./database/db.js";
import wordGroupsRouter from "./routes/wordGroups.js";
import languagesRouter from "./routes/languages.js";
import wordsRouter from "./routes/words.js";
import authRouter from "./routes/auth.js";
import path from "path";
import "dotenv/config";
// if running app locally you need to create a .env file that contains variable JWT_SECRET
// good website to generate jwt: https://jwtsecret.com/generate

// To use __dirname with ES modules, these two lines are needed to define __dirname
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// middleware function to handle invalid JSON in request body more gracefully
// code found from here: https://stackoverflow.com/questions/58134287
app.use((err, _, res, next) => {
  if (err instanceof SyntaxError && "body" in err && err.status === 400) {
    return res
      .status(400)
      .json({ message: "Invalid JSON in request body", error: err.message });
  }
  next(err);
});

/**
 * Middleware to check if the content type is application/json
 *
 * If the request method is POST or PUT and the content type is not application/json
 * then return a 400 status code with an error message. else call next middleware
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {express.NextFunction} next
 */
const checkJsonContentType = (req, res, next) => {
  // PATCH is not used in this project so no need to check for it
  if (req.method === "POST" || req.method === "PUT") {
    if (!req.is("application/json")) {
      return res
        .status(400)
        .json({ error: "Content type must be application/json" });
    }
  }
  next();
};

app.use(checkJsonContentType);

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.use("/api/word-groups", wordGroupsRouter);
app.use("/api/languages", languagesRouter);
app.use("/api/words", wordsRouter);
app.use("/api/auth", authRouter);

// this is needed when using react router and refreshing the page
// routes all requests that are not for the api to the react app
app.get("*", (_, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

const startServer = () => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  initDb();
  setupShutdown(server);
};

const setupShutdown = (server) => {
  const shutdown = () => {
    console.info("Shutting down server");
    server.close((err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.info("Server shutdown");
      closeDb();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

startServer();
