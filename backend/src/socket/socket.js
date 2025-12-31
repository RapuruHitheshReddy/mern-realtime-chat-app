import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

const socketHandler = (io) => {
  /* ---------------- AUTH ---------------- */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication error"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", async (socket) => {
    console.log("⚡ Connected:", socket.user._id);

    /* ONLINE */
    await User.findByIdAndUpdate(socket.user._id, { isOnline: true });
    socket.broadcast.emit("user_online", {
      userId: socket.user._id.toString(),
    });

    socket.join(socket.user._id.toString());

    /* JOIN CHAT ROOM */
    socket.on("join_chat", (chatId) => {
      socket.join(chatId);

      socket.to(chatId).emit("chat_read", {
        chatId,
        userId: socket.user._id.toString(),
        readAt: new Date().toISOString(),
      });
    });

    /* TYPING */
    socket.on("typing", (chatId) => {
      socket.to(chatId).emit("typing", {
        chatId,
        userId: socket.user._id.toString(),
      });
    });

    socket.on("stop_typing", (chatId) => {
      socket.to(chatId).emit("stop_typing", {
        chatId,
        userId: socket.user._id.toString(),
      });
    });

    /* MESSAGE */
    socket.on("send_message", (message) => {
      const chat = message.chat;
      if (!chat?.users) return;

      chat.users.forEach((u) => {
        const id = typeof u === "object" ? u._id.toString() : u.toString();
        if (id !== socket.user._id.toString()) {
          socket.to(id).emit("receive_message", message);
        }
      });
    });

    /* DISCONNECT */
    socket.on("disconnect", async () => {
      const lastSeen = new Date();

      await User.findByIdAndUpdate(socket.user._id, {
        isOnline: false,
        lastSeen,
      });

      socket.broadcast.emit("user_offline", {
        userId: socket.user._id.toString(),
        lastSeen,
      });
    });
  });
};

export default socketHandler;
