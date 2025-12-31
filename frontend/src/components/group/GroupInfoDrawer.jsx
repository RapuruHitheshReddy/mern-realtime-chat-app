import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, UserPlus, Trash2, Users, LogOut } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import {
  fetchChats,
  selectChat,
  updateGroupChat,
} from "../../features/chat/chatSlice";
import { searchUsers, clearUsers } from "../../features/user/userSlice";

/* ---------------- Drawer animation ---------------- */
const drawerVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1 },
  exit: { x: "100%", opacity: 0 },
};

/**
 * GroupInfoDrawer
 * - Manage group metadata (rename, add/remove members)
 * - Admin-only controls enforced in UI
 * - Uses Axios + Redux (no direct fetch or tokens)
 */
function GroupInfoDrawer({ onClose }) {
  const dispatch = useDispatch();

  const { selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const { users } = useSelector((state) => state.user);

  const [groupName, setGroupName] = useState(selectedChat.chatName);
  const [search, setSearch] = useState("");
  const [loadingUserId, setLoadingUserId] = useState(null);
  const [savingName, setSavingName] = useState(false);

  const isAdmin = selectedChat.admin?._id === user.id;

  /* ---------------- Rename group ---------------- */
  const renameGroup = async () => {
    if (!groupName.trim()) return;

    setSavingName(true);
    try {
      const { data: updatedChat } = await api.put("/chat/rename", {
        chatId: selectedChat._id,
        chatName: groupName,
      });

      dispatch(updateGroupChat(updatedChat)); // ✅ realtime
      dispatch(fetchChats()); // sidebar sync
      toast.success("Group name updated");
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setSavingName(false);
    }
  };

  /* ---------------- Add user ---------------- */
  const addUser = async (userId) => {
    try {
      const { data: updatedChat } = await api.put("/chat/groupadd", {
        chatId: selectedChat._id,
        userId,
      });

      dispatch(updateGroupChat(updatedChat)); // ✅ realtime
      dispatch(fetchChats());

      dispatch(clearUsers());
      setSearch("");
      toast.success("Member added");
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  /* ---------------- Remove / Exit group ---------------- */
  const removeUser = async (e, userId) => {
    e.stopPropagation();
    setLoadingUserId(userId);

    try {
      const { data: updatedChat } = await api.put("/chat/groupremove", {
        chatId: selectedChat._id,
        userId,
      });

      if (userId === user.id) {
        dispatch(selectChat(null));
        onClose();
        toast.success("You left the group");
      } else {
        dispatch(updateGroupChat(updatedChat)); // ✅ realtime
        dispatch(fetchChats());
        toast.success("Member removed");
      }
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    } finally {
      setLoadingUserId(null);
    }
  };

  const exitGroup = (e) => removeUser(e, user.id);

  /* ---------------- Search users ---------------- */
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) dispatch(clearUsers());
    else dispatch(searchUsers(value));
  };

  return (
    <AnimatePresence>
      {/* Overlay */}
      <motion.div
        className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Drawer */}
        <motion.div
          variants={drawerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="w-full max-w-sm h-full ui-surface flex flex-col"
          role="dialog"
          aria-label="Group information"
        >
          {/* Header */}
          <div className="px-5 py-4 ui-divider flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-muted" />
              <h2 className="text-sm font-semibold">Group info</h2>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-[var(--bg-surface-hover)]"
              aria-label="Close group info"
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 px-5 py-4 overflow-y-auto space-y-6">
            {/* Rename group */}
            {isAdmin && (
              <div>
                <p className="text-xs text-muted mb-2">Group name</p>

                <div className="ui-glass rounded-xl px-3 py-2">
                  <input
                    className="w-full bg-transparent outline-none text-sm"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />
                </div>

                <button
                  onClick={renameGroup}
                  disabled={savingName}
                  className="mt-2 text-xs text-[var(--primary)] hover:underline disabled:opacity-50"
                >
                  {savingName ? "Saving…" : "Save name"}
                </button>
              </div>
            )}

            {/* Members */}
            <div>
              <p className="text-xs text-muted mb-3">
                Members ({selectedChat.users.length})
              </p>

              <div className="space-y-2">
                {selectedChat.users.map((u) => {
                  const isGroupAdmin = u._id === selectedChat.admin?._id;

                  return (
                    <motion.div
                      key={u._id}
                      whileHover={{ y: -1 }}
                      className="
                        flex items-center justify-between
                        px-3 py-2 rounded-xl
                        hover:bg-[var(--bg-surface-hover)]
                      "
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate flex items-center gap-2">
                          {u.name}
                          {isGroupAdmin && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] px-2 py-[2px]
                              rounded-full bg-[var(--primary)] text-white"
                            >
                              <Crown size={10} />
                              Admin
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted truncate">{u.email}</p>
                      </div>

                      {isAdmin && u._id !== user.id && (
                        <button
                          onClick={(e) => removeUser(e, u._id)}
                          disabled={loadingUserId === u._id}
                          className="
                            p-2 rounded-lg
                            text-red-400
                            hover:bg-red-500/10
                            transition
                          "
                          title="Remove member"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Add members */}
            {isAdmin && (
              <div>
                <p className="text-xs text-muted mb-2 flex items-center gap-1">
                  <UserPlus size={12} />
                  Add members
                </p>

                <div className="ui-glass rounded-xl px-3 py-2 mb-2">
                  <input
                    className="w-full bg-transparent outline-none text-sm"
                    placeholder="Search users"
                    value={search}
                    onChange={handleSearch}
                  />
                </div>

                <div className="space-y-1">
                  {users.map((u) => (
                    <div
                      key={u._id}
                      onClick={() => addUser(u._id)}
                      className="
                        px-3 py-2 rounded-xl cursor-pointer
                        hover:bg-[var(--bg-surface-hover)]
                      "
                    >
                      <p className="text-sm">{u.name}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Exit group */}
          <div className="px-5 py-4 ui-divider">
            <button
              onClick={exitGroup}
              className="
                w-full flex items-center justify-center gap-2
                text-sm py-2 rounded-xl
                text-red-400
                hover:bg-red-500/10
              "
            >
              <LogOut size={14} />
              Exit group
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default GroupInfoDrawer;
