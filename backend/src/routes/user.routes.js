// routes/user.routes.js
import express from "express";
import protect from "../middleware/auth.middleware.js";
import upload from "../middleware/upload.middleware.js";

import {
  searchUsers,
  getMyProfile,
  updateProfile,
  uploadAvatar,
  getPublicProfile,
} from "../controllers/user.controller.js";

const router = express.Router();

/* Private */
router.get("/", protect, searchUsers);
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateProfile);
router.post("/avatar", protect, upload.single("avatar"), uploadAvatar);

/* Public */
router.get("/:id", getPublicProfile);

export default router;
