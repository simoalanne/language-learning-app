import express from "express";
import { initDb, closeDb } from "./db.js";
import wordGroupsRouter from "./routes/wordGroups.js";
import languagesRouter from "./routes/languages.js";
import wordsRouter from "./routes/words.js";
import cors from "cors";
import difficultiesRouter from "./routes/difficulties.js";

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

app.use("/api/word-groups", wordGroupsRouter);
app.use("/api/languages", languagesRouter);
app.use("/api/words", wordsRouter);
app.use("/api/difficulties", difficultiesRouter);

app.get("/", (_, res) => {
  res.send("express server");
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
