import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useSelector } from "react-redux";
import Avatar from "../common/Avatar";

/**
 * PublicProfileSheet
 * - Read-only profile drawer for other users
 * - Mobile: bottom sheet
 * - Desktop: right-side drawer
 */
function PublicProfileSheet({ open, onClose }) {
  const { publicUser, loading } = useSelector(
    (state) => state.profile
  );

  if (!open) return null;

  const isMobile = window.innerWidth < 768;

  const initialPosition = isMobile
    ? { y: "100%" }
    : { x: "100%" };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="public-profile-backdrop"   
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div
        key="public-profile-drawer"     
        initial={initialPosition}
        animate={{ x: 0, y: 0 }}
        exit={initialPosition}
        transition={{ type: "tween", duration: 0.25 }}
        className="
          fixed z-50
          inset-x-0 bottom-0
          md:inset-y-0 md:right-0 md:left-auto
          w-full md:w-[360px]
          h-[80vh] md:h-full
          rounded-t-3xl md:rounded-none
          ui-surface
          flex flex-col
        "
        role="dialog"
        aria-modal="true"
        aria-label="User profile"
      >
        {/* Header */}
        <div className="px-5 py-4 ui-divider flex items-center justify-between">
          <h2 className="text-sm font-semibold">Profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--bg-surface-hover)]"
            aria-label="Close profile"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 px-5 py-6 overflow-y-auto">
          {loading || !publicUser ? (
            <div className="text-center text-sm text-muted">
              Loading profile…
            </div>
          ) : (
            <div className="flex flex-col items-center text-center gap-4">
              <Avatar user={publicUser} size={96} showStatus />
              <h3 className="text-base font-semibold">
                {publicUser.name}
              </h3>

              {publicUser.bio ? (
                <p className="text-sm text-muted whitespace-pre-wrap">
                  {publicUser.bio}
                </p>
              ) : (
                <p className="text-sm text-muted italic">
                  No bio available
                </p>
              )}

              <div className="mt-4 text-xs text-muted">
                Joined{" "}
                {new Date(publicUser.createdAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default PublicProfileSheet;
