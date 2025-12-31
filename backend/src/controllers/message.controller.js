import Message from "../models/Message.model.js";
import Chat from "../models/Chat.model.js";
import cloudinary from "../config/cloudinary.js";

/**
 * @desc Send a message
 * @route POST /api/message
 */
export const sendMessage = async (req, res) => {
  const {
    content = "",
    chatId,
    messageType = "text",
    mediaUrl = "",
  } = req.body;

  if (!chatId) {
    return res.status(400).json({ message: "ChatId is required" });
  }

  try {
    let message = await Message.create({
      sender: req.user._id,
      chat: chatId,
      content,
      messageType,
      mediaUrl,
    });

    message = await message.populate("sender", "name email avatar");
    message = await message.populate("chat");

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message._id,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};


/**
 * @desc Fetch all messages for a chat
 * @route GET /api/message/:chatId
 */
export const fetchMessages = async (req, res) => {
  const { chatId } = req.params;

  try {
    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name email avatar")
      .populate("chat")
      .sort({ createdAt: 1 });

    // ✅ MARK CHAT AS READ (for unread divider logic)
    await Chat.findByIdAndUpdate(chatId, {
      [`lastReadAt.${req.user._id}`]: new Date(),
    });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Fetch Messages Error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

/**
 * @desc Upload media (image/file/video)
 * @route POST /api/message/upload
 */
export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto",
    });

    res.status(200).json({
      success: true,
      url: result.secure_url,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Media upload failed" });
  }
};

