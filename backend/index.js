import "dotenv/config";
import { initDb, closeDb } from "./database/db.js";
import app from "./app.js";

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await initDb();
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
    setupShutdown(server);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const setupShutdown = (server) => {
  let isShuttingDown = false;

  const shutdown = async () => {
    // Prevent multiple shutdown calls
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;

    console.info("Shutting down server");

    // Stop accepting new connections
    server.close(async (err) => {
      if (err) {
        console.error("Error closing server:", err);
      }

      // Give pending requests time to finish (max 10 seconds)
      const shutdownTimeout = setTimeout(() => {
        console.warn("Force closing database after timeout");
        process.exit(1);
      }, 10000);

      try {
        // Close database after connections are closed
        await closeDb();
        clearTimeout(shutdownTimeout);
        console.info("Server shutdown complete");
        process.exit(0);
      } catch (error) {
        console.error("Error during shutdown:", error);
        clearTimeout(shutdownTimeout);
        process.exit(1);
      }
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

startServer();
