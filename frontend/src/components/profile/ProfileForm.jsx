import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { Save, Camera } from "lucide-react";
import toast from "react-hot-toast";

import {
  updateMyProfile,
  uploadAvatar,
} from "../../features/profile/profileSlice";

/**
 * ProfileForm
 * - Allows the logged-in user to update name, bio, and avatar
 * - Uses local dirty-state to avoid unnecessary updates
 * - Toasts are shown only for explicit user actions
 */
function ProfileForm({ onSuccess }) {
  const dispatch = useDispatch();
  const { me, updating } = useSelector((state) => state.profile);

  const fileRef = useRef(null);

  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [dirty, setDirty] = useState(false);

  /* ---------------- Sync profile into local form ---------------- */
  useEffect(() => {
    if (!me) return;

    setName(me.name || "");
    setBio(me.bio || "");
    setDirty(false);
  }, [me]);

  /* ---------------- Avatar upload ---------------- */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await dispatch(uploadAvatar(file)).unwrap();
      toast.success("Profile picture updated");
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : err?.message || "Something went wrong"
      );
    }
  };

  /* ---------------- Save profile ---------------- */
  const handleSave = async () => {
    if (!dirty) return;

    try {
      await dispatch(updateMyProfile({ name, bio })).unwrap();

      setDirty(false);
      toast.success("Profile updated");
      onSuccess?.();
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : err?.message || "Something went wrong"
      );
    }
  };

  // Defensive guard while profile is loading
  if (!me) {
    return <div className="text-sm text-muted">Loading profile…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex justify-center">
        <div className="relative">
          {me.avatar ? (
            <img
              src={me.avatar}
              alt={me.name}
              className="w-24 h-24 rounded-full object-cover"
              loading="lazy"
            />
          ) : (
            <div
              className="
                w-24 h-24 rounded-full
                bg-[var(--bg-surface-hover)]
                flex items-center justify-center
                text-xl font-semibold text-muted
              "
            >
              {me.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}

          {/* Change avatar */}
          <button
            onClick={() => fileRef.current?.click()}
            className="
              absolute bottom-0 right-0
              w-8 h-8 rounded-full
              bg-[var(--primary)]
              text-white
              flex items-center justify-center
              shadow-lg
              hover:opacity-90
            "
            aria-label="Change avatar"
          >
            <Camera size={14} />
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="text-xs text-muted">Name</label>
        <div className="ui-glass rounded-xl px-3 py-2 mt-1">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setDirty(true);
            }}
            className="w-full bg-transparent outline-none text-sm"
            placeholder="Your name"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="text-xs text-muted">Bio</label>
        <div className="ui-glass rounded-xl px-3 py-2 mt-1">
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => {
              setBio(e.target.value);
              setDirty(true);
            }}
            className="w-full bg-transparent outline-none text-sm resize-none"
            placeholder="Tell something about yourself"
          />
        </div>
      </div>

      {/* Save */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleSave}
        disabled={!dirty || updating}
        className={`
          w-full mt-2
          flex items-center justify-center gap-2
          px-4 py-2 rounded-xl text-sm font-medium
          transition
          ${
            dirty
              ? "bg-[var(--primary)] text-white hover:opacity-90"
              : "bg-[var(--bg-surface-hover)] text-muted cursor-not-allowed"
          }
        `}
      >
        <Save size={16} />
        {updating ? "Saving…" : "Save changes"}
      </motion.button>
    </div>
  );
}

export default ProfileForm;
