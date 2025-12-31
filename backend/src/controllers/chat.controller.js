import Chat from "../models/Chat.model.js";
import User from "../models/User.model.js";

/**
 * @desc Access or create 1-to-1 chat
 * @route POST /api/chat
 */
export const accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "UserId is required" });
  }

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (chat) {
      return res.status(200).json(chat);
    }

    const newChat = await Chat.create({
      chatName: "private-chat",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate(
      "users",
      "-password"
    );

    res.status(201).json(fullChat);
  } catch (error) {
    console.error("Access Chat Error:", error);
    res.status(500).json({ message: "Failed to access chat" });
  }
};

/**
 * @desc Fetch all chats for user
 * @route GET /api/chat
 */
export const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("admin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Fetch Chats Error:", error);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

/**
 * @desc Create group chat
 * @route POST /api/chat/group
 */
export const createGroupChat = async (req, res) => {
  const { users, name } = req.body;

  if (!users || !name) {
    return res.status(400).json({ message: "Users and name are required" });
  }

  if (users.length < 2) {
    return res
      .status(400)
      .json({ message: "Group chat requires at least 3 users" });
  }

  try {
    const groupChat = await Chat.create({
      chatName: name,
      users: [...users, req.user._id],
      isGroupChat: true,
      admin: req.user._id,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("admin", "-password");

    res.status(201).json(fullGroupChat);
  } catch (error) {
    console.error("Create Group Error:", error);
    res.status(500).json({ message: "Failed to create group chat" });
  }
};

/**
 * @desc Rename group
 * @route PUT /api/chat/rename
 */
export const renameGroup = async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("admin", "-password");

    const io = req.app.get("io");
    io.to(chatId).emit("group_updated", updatedChat);

    res.status(200).json(updatedChat);
  } catch {
    res.status(500).json({ message: "Failed to rename group" });
  }
};


/**
 * @desc Add user to group
 * @route PUT /api/chat/groupadd
 */
export const addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $addToSet: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("admin", "-password");

    // 🔴 REAL-TIME EMIT
    const io = req.app.get("io");
    io.to(chatId).emit("group_updated", updatedChat);

    res.status(200).json(updatedChat);
  } catch {
    res.status(500).json({ message: "Failed to add user" });
  }
};


/**
 * @desc Remove user from group
 * @route PUT /api/chat/groupremove
 */
export const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  try {
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { $pull: { users: userId } },
      { new: true }
    )
      .populate("users", "-password")
      .populate("admin", "-password");

    // 🔴 REAL-TIME EMIT
    const io = req.app.get("io");
    io.to(chatId).emit("group_updated", updatedChat);

    res.status(200).json(updatedChat);
  } catch {
    res.status(500).json({ message: "Failed to remove user" });
  }
};

