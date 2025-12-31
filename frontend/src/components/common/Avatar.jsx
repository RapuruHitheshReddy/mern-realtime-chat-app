import { motion } from "framer-motion";

/**
 * Avatar
 * - Displays user profile image or name fallback
 * - Optionally shows online/offline status
 * - Clickable when onClick is provided
 *
 * This component is intentionally kept dumb/presentational.
 */
function Avatar({
  user,
  size = 40,
  showStatus = false,
  onClick,
}) {
  // Defensive guard — avoids runtime errors
  if (!user) return null;

  const hasAvatar = Boolean(user.avatar);
  const initial =
    user.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={`relative flex-shrink-0 ${
        onClick ? "cursor-pointer" : ""
      }`}
      style={{ width: size, height: size }}
      role={onClick ? "button" : undefined}
      aria-label={user.name}
    >
      {/* Avatar image or fallback */}
      {hasAvatar ? (
        <img
          src={user.avatar}
          alt={user.name}
          className="w-full h-full rounded-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="
            w-full h-full rounded-full
            bg-[var(--bg-surface-hover)]
            flex items-center justify-center
            text-sm font-semibold text-muted
          "
        >
          {initial}
        </div>
      )}

      {/* Online / offline status indicator */}
      {showStatus && (
        <span
          className={`
            absolute bottom-0 right-0
            w-2.5 h-2.5 rounded-full
            border-2 border-[var(--bg-app)]
            ${
              user.isOnline
                ? "bg-green-500"
                : "bg-gray-500"
            }
          `}
        />
      )}
    </motion.div>
  );
}

export default Avatar;
