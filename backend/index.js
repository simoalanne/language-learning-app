import express from "express";
import { initDb, closeDb } from "./database/db.js";
import wordGroupsRouter from "./routes/wordGroups.js";
import languagesRouter from "./routes/languages.js";
import wordsRouter from "./routes/words.js";
//import cors from "cors";
import path from "path";

// To use __dirname with ES modules, these two lines are needed to define __dirname
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.use("/api/word-groups", wordGroupsRouter);
app.use("/api/languages", languagesRouter);
app.use("/api/words", wordsRouter);

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
