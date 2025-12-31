import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/", authMiddleware, accessChat);
router.get("/", authMiddleware, fetchChats);
router.post("/group", authMiddleware, createGroupChat);
router.put("/rename", authMiddleware, renameGroup);
router.put("/groupadd", authMiddleware, addToGroup);
router.put("/groupremove", authMiddleware, removeFromGroup);

export default router;
