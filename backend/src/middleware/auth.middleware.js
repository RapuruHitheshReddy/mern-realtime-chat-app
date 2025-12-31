import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

/**
 * @desc    Protect routes – JWT authentication middleware
 * @access  Private
 */
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    /* ---------------- Validate header ---------------- */
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized, token missing",
      });
    }

    /* ---------------- Extract token ---------------- */
    const token = authHeader.split(" ")[1];

    /* ---------------- Verify token ---------------- */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* ---------------- Fetch user ---------------- */
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    /* ---------------- Attach user ---------------- */
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);

    return res.status(401).json({
      message: "Not authorized, invalid or expired token",
    });
  }
};

export default protect;
