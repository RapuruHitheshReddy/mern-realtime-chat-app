import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";

import {
  fetchMessages,
  clearMessages,
} from "../../features/message/messageSlice";
import { markChatAsRead } from "../../features/chat/chatSlice";
import { getSocket } from "../../utils/socket";

import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import { formatDateLabel } from "../../utils/dateUtils";
import GroupInfoDrawer from "../group/GroupInfoDrawer";
import Avatar from "../common/Avatar";

/* ------------------------------------------------------------------ */
/* Utilities                                                          */
/* ------------------------------------------------------------------ */

const FIVE_MINUTES = 5 * 60 * 1000;

/**
 * Determines whether two messages should be visually grouped
 * (same sender + close timestamp)
 */
function isSameGroup(prev, curr) {
  if (!prev || !curr || !prev.sender || !curr.sender) return false;
  return (
    prev.sender._id === curr.sender._id &&
    new Date(curr.createdAt) - new Date(prev.createdAt) <= FIVE_MINUTES
  );
}

/**
 * Human-friendly "last seen" formatting
 */
function formatLastSeen(ts) {
  if (!ts) return "Last seen recently";

  const diff = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (diff < 1) return "Last seen just now";
  if (diff < 60) return `Last seen ${diff}m ago`;

  return `Last seen at ${new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/* ------------------------------------------------------------------ */
/* Loading skeleton                                                    */
/* ------------------------------------------------------------------ */

function MessageSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`h-4 rounded-lg bg-[var(--bg-surface-hover)]/60 animate-pulse ${
            i % 2 === 0 ? "w-2/3" : "w-1/2 ml-auto"
          }`}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

/**
 * ChatWindow
 * - Displays messages for the selected chat
 * - Handles read receipts, typing indicators, and auto-scroll
 * - Keeps real-time logic isolated from UI concerns
 */
function ChatWindow({ onOpenPublicProfile }) {
  const dispatch = useDispatch();

  const { selectedChat } = useSelector((state) => state.chat);
  const { messages, loading } = useSelector((state) => state.message);
  const { user } = useSelector((state) => state.auth);

  const [isTyping, setIsTyping] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const scrollRef = useRef(null);
  const autoScrollRef = useRef(true);

  /* ---------------- Derive other user (1–1 chat only) ---------------- */

  const otherUser = useMemo(() => {
    if (!selectedChat || selectedChat.isGroupChat) return null;
    return selectedChat.users.find((u) => u._id !== user.id);
  }, [selectedChat, user.id]);

  const statusText = otherUser?.isOnline
    ? "Online"
    : formatLastSeen(otherUser?.lastSeen);

  /* ---------------- Chat switch lifecycle ---------------- */

  useEffect(() => {
    if (!selectedChat) return;

    // Reset message state on chat change
    dispatch(clearMessages());
    setIsTyping(false);

    // Load messages and immediately mark as read
    dispatch(fetchMessages(selectedChat._id))
      .unwrap()
      .finally(() => {
        dispatch(
          markChatAsRead({
            chatId: selectedChat._id,
            userId: user.id,
          })
        );
      });

    // Join socket room for real-time updates
    getSocket()?.emit("join_chat", selectedChat._id);
  }, [dispatch, selectedChat?._id, user.id]);

  /* ---------------- Socket listeners ---------------- */

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedChat) return;

    const chatId = selectedChat._id;

    const onTyping = (d) =>
      d.chatId === chatId && setIsTyping(true);
    const onStopTyping = (d) =>
      d.chatId === chatId && setIsTyping(false);
    const onRead = (d) =>
      d.chatId === chatId && dispatch(markChatAsRead(d));

    socket.on("typing", onTyping);
    socket.on("stop_typing", onStopTyping);
    socket.on("chat_read", onRead);

    return () => {
      socket.off("typing", onTyping);
      socket.off("stop_typing", onStopTyping);
      socket.off("chat_read", onRead);
    };
  }, [selectedChat?._id, dispatch]);

  /* ---------------- Auto-scroll behavior ---------------- */

  useEffect(() => {
    if (!scrollRef.current || !autoScrollRef.current) return;

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  const handleScroll = () => {
    const el = scrollRef.current;
    autoScrollRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  /* ---------------- Empty state ---------------- */

  if (!selectedChat) {
    return (
      <div className="h-full flex items-center justify-center text-muted">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* ================= Header ================= */}
      <motion.div
        initial={{ y: -6, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-4 sm:px-6 py-4 flex items-center justify-between ui-glass ui-divider"
      >
        <div className="flex items-center gap-3">
          {/* Clickable avatar (1–1 chats only) */}
          {!selectedChat.isGroupChat && otherUser && (
            <button
              onClick={() =>
                onOpenPublicProfile?.(otherUser._id)
              }
              className="rounded-full focus:outline-none"
              aria-label="View profile"
            >
              <Avatar user={otherUser} size={36} showStatus />
            </button>
          )}

          {/* Chat meta */}
          <div className="flex flex-col gap-0.5">
            <h2 className="text-sm font-semibold">
              {selectedChat.isGroupChat
                ? selectedChat.chatName
                : otherUser?.name}
            </h2>

            {!selectedChat.isGroupChat && (
              <p className="text-xs text-muted">
                {statusText}
              </p>
            )}

            {selectedChat.isGroupChat && (
              <p className="text-xs text-muted">
                {selectedChat.users.length} members
              </p>
            )}
          </div>
        </div>

        {/* Group info */}
        {selectedChat.isGroupChat && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowGroupInfo(true)}
            className="w-9 h-9 rounded-full ui-glass flex items-center justify-center"
            aria-label="Group info"
          >
            <Info size={16} />
          </motion.button>
        )}
      </motion.div>

      {/* ================= Messages ================= */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 px-4 sm:px-6 py-4 overflow-y-auto space-y-1 scroll-smooth"
      >
        {loading ? (
          <MessageSkeleton />
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const prev = messages[i - 1];
              const next = messages[i + 1];

              const showDate =
                !prev ||
                new Date(prev.createdAt).toDateString() !==
                  new Date(msg.createdAt).toDateString();

              return (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.14 }}
                >
                  {showDate && (
                    <div className="flex justify-center my-4">
                      <span className="px-3 py-1 rounded-full text-[11px] ui-glass text-muted">
                        {formatDateLabel(msg.createdAt)}
                      </span>
                    </div>
                  )}

                  <MessageBubble
                    message={msg}
                    isFirstInGroup={!isSameGroup(prev, msg)}
                    isLastInGroup={!isSameGroup(msg, next)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2 flex items-center gap-2 text-xs text-muted"
          >
            typing
            <span className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1 h-1 bg-gray-400 rounded-full"
                  animate={{ y: [0, -3, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.6,
                    delay: i * 0.12,
                  }}
                />
              ))}
            </span>
          </motion.div>
        )}
      </div>

      {/* Message composer */}
      <MessageInput />

      {/* Group info drawer */}
      {showGroupInfo && (
        <GroupInfoDrawer
          onClose={() => setShowGroupInfo(false)}
        />
      )}
    </div>
  );
}

export default ChatWindow;
