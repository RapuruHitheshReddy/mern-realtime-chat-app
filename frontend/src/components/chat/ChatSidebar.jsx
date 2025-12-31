import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { fetchChats, selectChat } from "../../features/chat/chatSlice";

/* ---------------- Motion presets ---------------- */

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const itemVariants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0 },
};

/**
 * ChatSidebar
 * - TRUE realtime user search (same logic as GroupInfoDrawer)
 * - Local state only
 * - Race-condition safe
 */
function ChatSidebar({ onSelectChat, onCreateGroup }) {
  const dispatch = useDispatch();

  const { chats, selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔐 protects against stale responses
  const latestQueryRef = useRef("");

  /* ---------------- Initial chat load ---------------- */
  useEffect(() => {
    dispatch(fetchChats())
      .unwrap()
      .catch(() => toast.error("Failed to load chats"));
  }, [dispatch]);

  /* ---------------- REALTIME user search ---------------- */
  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    latestQueryRef.current = value;

    if (!value.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/user?search=${value}`);

      // ✅ Ignore stale responses
      if (latestQueryRef.current !== value) return;

      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      if (latestQueryRef.current === value) {
        setLoading(false);
      }
    }
  };

  /* ---------------- Create or open 1–1 chat ---------------- */
  const handleCreateChat = async (userId) => {
    try {
      const { data: chat } = await api.post("/chat", { userId });

      dispatch(fetchChats());
      dispatch(selectChat(chat));

      setQuery("");
      setResults([]);
      latestQueryRef.current = "";

      onSelectChat?.();
    } catch {
      toast.error("Failed to create chat");
    }
  };

  /* ---------------- Unread indicator ---------------- */
  const hasUnread = (chat) => {
    if (!chat.latestMessage) return false;

    const lastRead = chat.lastReadAt?.[user.id];
    if (!lastRead) return true;

    return new Date(chat.latestMessage.createdAt) > new Date(lastRead);
  };

  return (
    <div className="h-full w-full flex flex-col ui-surface">
      {/* ================= Header ================= */}
      <div className="p-4 space-y-3 ui-divider">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold tracking-tight">Chats</h2>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              onCreateGroup?.();
              onSelectChat?.();
            }}
            className="
              inline-flex items-center gap-1.5
              px-3 py-1.5 rounded-lg
              text-xs font-medium
              border border-[var(--border-subtle)]
              text-[var(--text-secondary)]
              hover:text-[var(--text-primary)]
              hover:bg-[var(--bg-surface-hover)]
              transition
            "
          >
            <Plus size={14} />
            New group
          </motion.button>
        </div>

        {/* Search users */}
        <div className="ui-glass rounded-full px-3 py-2">
          <input
            type="text"
            placeholder="Search users…"
            value={query}
            onChange={handleSearch}
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* ================= Content ================= */}
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-2 py-3 space-y-1 overflow-y-auto"
      >
        {/* ---------- Search results (INSTANT) ---------- */}
        {query &&
          results.map((u) => (
            <motion.div
              key={u._id}
              variants={itemVariants}
              whileHover={{ y: -1 }}
              onClick={() => handleCreateChat(u._id)}
              className="px-3 py-2 rounded-xl cursor-pointer hover:bg-[var(--bg-surface-hover)]"
            >
              <p className="text-sm font-medium">{u.name}</p>
              <p className="text-xs text-muted truncate">{u.email}</p>
            </motion.div>
          ))}

        {/* ---------- Chat list ---------- */}
        {!query && (
          <AnimatePresence>
            {chats.map((chat) => {
              const chatName = chat.isGroupChat
                ? chat.chatName
                : chat.users.find((u) => u._id !== user.id)?.name;

              const isActive = selectedChat?._id === chat._id;

              return (
                <motion.div
                  key={chat._id}
                  layout
                  whileHover={{ y: -1 }}
                  onClick={() => {
                    dispatch(selectChat(chat));
                    onSelectChat?.();
                  }}
                  className={`px-3 py-2 rounded-xl cursor-pointer flex items-center gap-3 ${
                    isActive
                      ? "bg-[var(--bg-surface-hover)]"
                      : "hover:bg-[var(--bg-surface-hover)]"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-[var(--bg-surface-hover)] flex items-center justify-center text-sm font-medium">
                    {chatName?.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chatName}</p>
                    {chat.latestMessage && (
                      <p className="text-xs text-muted truncate">
                        {chat.latestMessage.content}
                      </p>
                    )}
                  </div>

                  {hasUnread(chat) && !isActive && (
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}

export default ChatSidebar;
