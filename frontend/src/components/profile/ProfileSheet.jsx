import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import ProfileForm from "./ProfileForm";

function ProfileSheet({ open, onClose }) {
  if (!open) return null;

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="profile-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
      />

      {/* Panel */}
      <motion.div
        key="profile-panel"
        initial={{
          y: window.innerWidth < 768 ? "100%" : 0,
          x: window.innerWidth >= 768 ? "100%" : 0,
        }}
        animate={{ x: 0, y: 0 }}
        exit={{
          y: window.innerWidth < 768 ? "100%" : 0,
          x: window.innerWidth >= 768 ? "100%" : 0,
        }}
        transition={{ type: "tween", duration: 0.25 }}
        className="
          fixed z-50
          inset-x-0 bottom-0 md:inset-y-0 md:right-0 md:left-auto
          w-full md:w-[380px]
          h-[85vh] md:h-full
          rounded-t-3xl md:rounded-none
          ui-surface
          flex flex-col
        "
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
          <ProfileForm onSuccess={onClose} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProfileSheet;
