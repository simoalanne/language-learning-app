import { decodeJwtToken } from "../utils/authUtils.js";

/**
 * Middleware to verify JWT token. If the token is valid, it adds the decoded user information to the request object.
 * If the token is invalid or expired, it sends a 401 Unauthorized response.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token is missing" });
  try {
    const decoded = decodeJwtToken(token);
    if (!decoded) return res.status(401).json({ error: "Invalid or expired token" });
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
