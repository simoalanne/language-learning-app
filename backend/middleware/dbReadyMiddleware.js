import { isDbInitialized } from "../database/db.js";

/**
 * Middleware to ensure database is initialized and ready before processing requests
 */
export const dbReadyMiddleware = (req, res, next) => {
  if (!isDbInitialized()) {
    console.warn("Request received but database is not ready");
    return res.status(503).json({ error: "Server is starting up or shutting down. Please try again." });
  }
  next();
};
