import "dotenv/config";
import { config, envCheck } from "./config/config.js";
import { connectDb, closeDb } from "./config/db.js";
import app from "./app.js";

const startServer = async () => {
  envCheck();
  await connectDb();
  const server = app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
  });
  setupShutdown(server);
};

const setupShutdown = (server) => {
  const shutdown = () => {
    console.info("Shutting down server");
    server.close(async (err) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.info("Server shutdown complete");
      await closeDb();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

startServer();
