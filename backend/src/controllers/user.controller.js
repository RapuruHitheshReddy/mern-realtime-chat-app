// controllers/user.controller.js
import User from "../models/User.model.js";
import cloudinary from "../config/cloudinary.js";

/* =========================
   SEARCH USERS
========================= */
export const searchUsers = async (req, res) => {
  try {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find(keyword)
      .find({ _id: { $ne: req.user._id } })
      .select("name avatar isOnline lastSeen");

    res.status(200).json(users);
  } catch {
    res.status(500).json({ message: "Failed to search users" });
  }
};

/* =========================
   GET MY PROFILE (PRIVATE)
========================= */
export const getMyProfile = async (req, res) => {
  res.status(200).json(req.user);
};

/* =========================
   UPDATE PROFILE (NAME + BIO)
========================= */
export const updateProfile = async (req, res) => {
  const { name, bio } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name.trim();
  if (bio !== undefined) user.bio = bio.trim();

  await user.save();

  res.status(200).json(user);
};

/* =========================
   UPLOAD AVATAR (CLOUDINARY)
========================= */
export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "chat-app/avatars",
    width: 256,
    height: 256,
    crop: "fill",
  });

  const user = await User.findById(req.user._id);
  user.avatar = result.secure_url;
  await user.save();

  res.status(200).json({
    avatar: result.secure_url,
  });
};

/* =========================
   PUBLIC USER PROFILE (SAFE)
========================= */
export const getPublicProfile = async (req, res) => {
  const user = await User.findById(req.params.id).select(
    "name bio avatar isOnline lastSeen createdAt"
  );

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.status(200).json(user);
};
