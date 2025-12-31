import User from "../models/User.model.js";
import { generateToken } from "../utils/jwt.js";

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    /* ---------------- Validation ---------------- */
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    /* ---------------- Check existing user ---------------- */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    /* ---------------- Create user ---------------- */
    const user = await User.create({
      name,
      email,
      password, // hashed via mongoose pre-save hook
    });

    /* ---------------- Generate JWT ---------------- */
    const token = generateToken({ id: user._id });

    /* ---------------- Response ---------------- */
    return res.status(201).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      message: "Registration failed",
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    /* ---------------- Validation ---------------- */
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    /* ---------------- Find user ---------------- */
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    /* ---------------- Compare password ---------------- */
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    /* ---------------- Generate JWT ---------------- */
    const token = generateToken({ id: user._id });

    /* ---------------- Response ---------------- */
    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      message: "Login failed",
    });
  }
};
