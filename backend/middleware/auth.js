const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");

/**
 * Middleware to verify JWT token on protected routes.
 * Attaches decoded user payload to req.user.
 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

module.exports = authMiddleware;
