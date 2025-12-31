import express from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
  sendMessage,
  fetchMessages,
} from "../controllers/message.controller.js";

import upload from "../utils/upload.js";
import { uploadMedia } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.get("/:chatId", authMiddleware, fetchMessages);
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadMedia
);


export default router;
