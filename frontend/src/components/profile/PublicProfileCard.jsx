import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

/**
 * Formats user presence into human-friendly text
 */
function formatLastSeen(isOnline, lastSeen) {
  if (isOnline) return "Online";
  if (!lastSeen) return "Offline";

  const diff = Math.floor(
    (Date.now() - new Date(lastSeen)) / 60000
  );

  if (diff < 1) return "Last seen just now";
  if (diff < 60) return `Last seen ${diff}m ago`;

  const hours = Math.floor(diff / 60);
  if (hours < 24) return `Last seen ${hours}h ago`;

  return `Last seen on ${new Date(lastSeen).toLocaleDateString()}`;
}

/**
 * PublicProfileCard
 * - Pure presentational component
 * - Displays another user's public profile
 * - No side effects, no data fetching
 */
function PublicProfileCard({ user, onBack }) {
  // Defensive guard
  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="
        w-full max-w-md
        ui-surface rounded-3xl
        p-6
        space-y-6
      "
      role="region"
      aria-label="Public profile"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="
            p-2 rounded-lg
            hover:bg-[var(--bg-surface-hover)]
            transition
          "
          aria-label="Go back"
        >
          <ArrowLeft size={18} />
        </button>

        <h1 className="text-sm font-semibold">
          Public Profile
        </h1>
      </div>

      {/* Avatar + presence */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-28 h-28 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="
                w-28 h-28 rounded-full
                bg-[var(--bg-surface-hover)]
                flex items-center justify-center
                text-xl font-semibold text-muted
              "
            >
              {user.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          {user.isOnline && (
            <span
              className="
                absolute bottom-1 right-1
                w-4 h-4 rounded-full
                bg-green-500
                ring-4 ring-[var(--bg-surface)]
              "
            />
          )}
        </div>

        <div className="text-center">
          <p className="text-base font-semibold">
            {user.name}
          </p>
          <p className="text-xs text-muted">
            {formatLastSeen(user.isOnline, user.lastSeen)}
          </p>
        </div>
      </div>

      {/* Bio */}
      {user.bio && (
        <div className="ui-glass rounded-2xl px-4 py-3">
          <p className="text-sm leading-relaxed text-[var(--text-primary)]">
            {user.bio}
          </p>
        </div>
      )}

      {/* Meta */}
      <p className="text-xs text-muted text-center">
        Joined{" "}
        {new Date(user.createdAt).toLocaleDateString()}
      </p>
    </motion.div>
  );
}

export default PublicProfileCard;
