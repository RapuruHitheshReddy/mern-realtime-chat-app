import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendMessage } from "../../features/message/messageSlice";
import { getSocket } from "../../utils/socket";
import { Paperclip, SendHorizonal, X } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

function MessageInput() {
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const dispatch = useDispatch();
  const { selectedChat } = useSelector((state) => state.chat);
  const typingTimeoutRef = useRef(null);

  /* ---------------- Typing ---------------- */
  const handleTyping = (value) => {
    setContent(value);

    const socket = getSocket();
    if (!socket || !selectedChat) return;

    socket.emit("typing", selectedChat._id);

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", selectedChat._id);
    }, 900);
  };

  /* ---------------- Send message ---------------- */
  const handleSend = async () => {
    if (!selectedChat) return;
    if (!content.trim() && !file) return;

    let mediaUrl = "";
    let messageType = "text";

    try {
      /* -------- Upload file first -------- */
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const { data } = await api.post("/message/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        mediaUrl = data.url;
        messageType = file.type.startsWith("image")
          ? "image"
          : "file";
      }

      /* -------- Send message metadata -------- */
      const message = await dispatch(
        sendMessage({
          chatId: selectedChat._id,
          content: content.trim(),
          mediaUrl,
          messageType,
        })
      ).unwrap();

      /* -------- Socket notify -------- */
      const socket = getSocket();
      if (socket) {
        socket.emit("stop_typing", selectedChat._id);
        socket.emit("send_message", message);
      }

      /* -------- Reset state -------- */
      setContent("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      toast.error(err?.message || "Failed to send message");
    }
  };

  const isActive = content.trim().length > 0 || file;

  return (
    <div className="px-6 py-4">
      <div className="ui-glass flex items-center gap-3 rounded-full px-4 py-2.5">
        {/* File input */}
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* Attach */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-muted hover:text-primary"
        >
          <Paperclip size={18} />
        </button>

        {/* Selected file indicator */}
        {file && (
          <span className="text-xs text-muted truncate max-w-[120px]">
            {file.name}
          </span>
        )}

        {/* Text input */}
        <input
          type="text"
          placeholder="Type a message…"
          value={content}
          onChange={(e) => handleTyping(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-transparent outline-none text-sm"
        />

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!isActive}
          className={`w-9 h-9 rounded-full flex items-center justify-center ${
            isActive
              ? "bg-primary text-white"
              : "text-muted cursor-not-allowed"
          }`}
        >
          <SendHorizonal size={16} />
        </button>
      </div>
    </div>
  );
}

export default MessageInput;
