import loadEnv from "./config/env.js";
loadEnv();

import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/db.js";
import socketHandler from "./socket/socket.js";

import authRoutes from "./routes/auth.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import messageRoutes from "./routes/message.routes.js";
import userRoutes from "./routes/user.routes.js";

/* ---------------- App & Server ---------------- */
const app = express();
const server = http.createServer(app);

/* ---------------- CORS ---------------- */
const allowedOrigins = [
  "http://localhost:5173", // DEV
  process.env.CLIENT_URL, // PROD (Vercel)
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, Postman, mobile apps
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.error("❌ Blocked by CORS:", origin);
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  })
);

/* ---------------- Body Parsing ---------------- */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ---------------- Socket.IO ---------------- */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io accessible inside controllers
app.set("io", io);

// Register socket handlers
socketHandler(io);

/* ---------------- Routes ---------------- */
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/user", userRoutes);

/* ---------------- Health Check ---------------- */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chat Backend is running 🚀",
    uptime: process.uptime(),
  });
});

/* ---------------- Global Error Handler ---------------- */
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    message: err.message || "Internal server error",
  });
});

/* ---------------- Start Server ---------------- */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
