import "dotenv/config";
import { initDb, closeDb } from "./database/db.js";
import app from "./app.js";

const port = process.env.PORT || 3000;

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
      console.info("Server shutdown complete");
      closeDb();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

startServer();
