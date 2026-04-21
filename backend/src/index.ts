import "dotenv/config";
import type { Server } from "node:http";
import app from "./app.ts";

const port = process.env.PORT || 3000;

const startServer = () => {
  const server = app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
  setupShutdown(server);
};

const setupShutdown = (server: Server) => {
  let isShuttingDown = false;

  const shutdown = async () => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;

    console.info("Shutting down server");

    server.close(async (err?: Error) => {
      if (err) {
        console.error("Error closing server:", err);
      }

      const shutdownTimeout = setTimeout(() => {
        console.warn("Force shutting down after timeout");
        process.exit(1);
      }, 10000);

      try {
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
