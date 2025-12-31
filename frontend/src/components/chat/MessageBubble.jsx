import { useSelector } from "react-redux";
import { Check, CheckCheck, Paperclip } from "lucide-react";

/**
 * MessageBubble
 * - Pure presentational component
 * - Renders a single message with grouping, read receipts, and media support
 * - No side effects, no API calls
 */
function MessageBubble({ message, isFirstInGroup, isLastInGroup }) {
  const { user } = useSelector((state) => state.auth);
  const { selectedChat } = useSelector((state) => state.chat);

  const isOwn = message.sender._id === user.id;
  const isGroupChat = message.chat.isGroupChat;

  // Display time (HH:MM)
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Show sender name only once per grouped block in group chats
  const showSender = !isOwn && isGroupChat && isFirstInGroup;

  /* ---------------- Read receipt logic ---------------- */
  let isSeen = false;

  if (isOwn && selectedChat?.lastReadAt) {
    // Message is seen only if all other users have read after this message
    isSeen = Object.entries(selectedChat.lastReadAt).every(
      ([userId, readAt]) =>
        userId === user.id || new Date(readAt) >= new Date(message.createdAt)
    );
  }

  return (
    <div
      className={`
        flex ${isOwn ? "justify-end" : "justify-start"}
        ${isFirstInGroup ? "mt-3" : "mt-1"}
        animate-message-in
      `}
    >
      <div
        className={`
          group relative max-w-[65%]
          px-4 py-2.5 text-sm leading-relaxed
          ${
            isOwn
              ? "bg-[var(--primary)] text-white"
              : "bg-[var(--bg-surface-hover)] text-[var(--text-primary)]"
          }
          ${
            isOwn
              ? isFirstInGroup
                ? "rounded-2xl rounded-br-md"
                : "rounded-xl rounded-br-md"
              : isFirstInGroup
              ? "rounded-2xl rounded-bl-md"
              : "rounded-xl rounded-bl-md"
          }
          ${isLastInGroup ? "" : "rounded-b-md"}
          shadow-sm transition
          hover:opacity-[0.98]
          active:scale-[0.995]
        `}
      >
        {/* Sender name (group chats only) */}
        {showSender && (
          <p className="mb-1 text-[11px] font-medium text-[var(--text-muted)]">
            {message.sender.name}
          </p>
        )}
        {/* Image message */}
        {message.messageType === "image" && (
          <img
            src={message.mediaUrl}
            alt="uploaded"
            className="mt-1 max-w-full rounded-2xl"
          />
        )}

        {/* File attachment */}
        {message.messageType === "file" && (
          <a
            href={message.mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--primary-soft)] hover:underline"
          >
            <Paperclip size={12} />
            Download file
          </a>
        )}

        {/* Text (normal message OR caption) */}
        {message.content && (
          <p className="mt-1 whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}

        {/* Timestamp + read receipt */}
        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
            isOwn ? "text-white/60" : "text-[var(--text-muted)]"
          }`}
        >
          <span>{time}</span>
          {isOwn &&
            (isSeen ? (
              <CheckCheck size={12} className="text-blue-300" />
            ) : (
              <Check size={12} className="opacity-60" />
            ))}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
