/**
 * Middleware to provide a more informative error message for invalid JSON in request body.
 * 
 * @param {Object} err - The error object.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const handleInvalidJsonError = (err, _, res, next) => {
  if (err instanceof SyntaxError && "body" in err && err.status === 400) {
    return res.status(400).json({ message: "Invalid JSON in request body", error: err.message });
  }
  next(err);
};

/**
 * Middleware to enforce JSON content type for POST and PUT requests.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
export const enforceJsonContentType = (req, res, next) => {
  if ((req.method === "POST" || req.method === "PUT") && !req.is("application/json")) {
    return res.status(400).json({ error: "Content type must be application/json" });
  }
  next();
};
