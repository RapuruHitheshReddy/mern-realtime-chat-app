import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import Navbar from "../components/common/Navbar";
import ProfileSheet from "../components/profile/ProfileSheet";
import PublicProfileSheet from "../components/profile/PublicProfileSheet";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatWindow from "../components/chat/ChatWindow";
import CreateGroupModal from "../components/group/CreateGroupModal";

import { connectSocket } from "../utils/socket";
import { addMessage } from "../features/message/messageSlice";
import {
  updateUserPresence,
  updateLatestMessage,
} from "../features/chat/chatSlice";
import {
  fetchMyProfile,
  fetchPublicProfile,
} from "../features/profile/profileSlice";

/**
 * Chat
 * - Root chat screen
 * - Owns global UI state (drawers, modals)
 * - Socket lifecycle + profile fetching
 */
function Chat() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [publicProfileOpen, setPublicProfileOpen] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  /* ---------------- Load logged-in user's profile ---------------- */
  useEffect(() => {
    if (!token) return;

    dispatch(fetchMyProfile())
      .unwrap()
      .catch((err) => {
        toast.error(err?.message || "Failed to load profile");
      });
  }, [dispatch, token]);

  /* ---------------- Socket lifecycle ---------------- */
  useEffect(() => {
    if (!token) return;

    const socket = connectSocket(token);

    socket.on("receive_message", (message) => {
      dispatch(addMessage(message));
      dispatch(updateLatestMessage(message));
    });

    socket.on("user_online", ({ userId }) => {
      dispatch(updateUserPresence({ userId, isOnline: true }));
    });

    socket.on("user_offline", ({ userId, lastSeen }) => {
      dispatch(
        updateUserPresence({
          userId,
          isOnline: false,
          lastSeen,
        })
      );
    });

    return () => {
      socket.off("receive_message");
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [dispatch, token]);

  /* ---------------- Open public profile ---------------- */
  const handleOpenPublicProfile = async (userId) => {
    try {
      await dispatch(fetchPublicProfile(userId)).unwrap();
      setPublicProfileOpen(true);
    } catch (err) {
      toast.error(err?.message || "Failed to load profile");
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-app)] overflow-hidden">
      {/* ---------------- Navbar ---------------- */}
      <Navbar
        onOpenSidebar={() => setMobileSidebarOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
      />

      {/* ---------------- My profile ---------------- */}
      <ProfileSheet
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      {/* ---------------- Public profile ---------------- */}
      <PublicProfileSheet
        open={publicProfileOpen}
        onClose={() => setPublicProfileOpen(false)}
      />

      {/* ---------------- Group modal (GLOBAL) ---------------- */}
      {groupModalOpen && (
        <CreateGroupModal
          onClose={() => setGroupModalOpen(false)}
        />
      )}

      {/* ---------------- Main layout ---------------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-[320px] border-r border-[var(--border-subtle)]">
          <ChatSidebar
            onCreateGroup={() => setGroupModalOpen(true)}
          />
        </aside>

        {/* Chat window */}
        <main className="flex-1 flex flex-col">
          <ChatWindow
            onOpenPublicProfile={handleOpenPublicProfile}
          />
        </main>
      </div>

      {/* ---------------- Mobile sidebar ---------------- */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />

            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm ui-surface"
            >
              <ChatSidebar
                onSelectChat={() => setMobileSidebarOpen(false)}
                onCreateGroup={() => setGroupModalOpen(true)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Chat;
