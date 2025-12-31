import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";
import {
  Menu,
  LogOut,
  MessagesSquare,
} from "lucide-react";
import Avatar from "./Avatar";

/**
 * Navbar
 * - Sticky top navigation bar
 * - Mobile-safe logout
 * - Desktop + mobile UX parity
 */
function Navbar({ onOpenSidebar, onOpenProfile }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  return (
    <header
      className="
        sticky top-0 z-40
        h-16 flex items-center justify-between
        px-4 md:px-8
        backdrop-blur
        bg-[var(--bg-app)]/80
        border-b border-[var(--border-subtle)]
      "
    >
      {/* LEFT — Mobile menu + Brand */}
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
        <button
          onClick={onOpenSidebar}
          className="
            md:hidden
            p-2 rounded-lg
            hover:bg-[var(--bg-surface-hover)]
            active:scale-95
            transition
          "
          aria-label="Open chats"
        >
          <Menu size={20} />
        </button>

        {/* Brand */}
        <div className="flex items-center gap-2">
          <div
            className="
              w-9 h-9 rounded-xl
              bg-[var(--primary)]
              text-white
              flex items-center justify-center
            "
          >
            <MessagesSquare size={18} />
          </div>

          <span className="text-[15px] font-semibold tracking-tight">
            Chat
            <span className="text-[var(--primary)]">App</span>
          </span>
        </div>
      </div>

      {/* RIGHT — Profile + Logout */}
      <div className="flex items-center gap-2">
        {/* Profile avatar */}
        {user && (
          <button
            onClick={onOpenProfile}
            className="
              rounded-full
              hover:ring-2 hover:ring-[var(--border-subtle)]
              transition
            "
            aria-label="Open profile"
          >
            <Avatar user={user} size={36} showStatus />
          </button>
        )}

        {/* 🔴 Mobile logout (icon only) */}
        <button
          onClick={handleLogout}
          className="
            sm:hidden
            p-2 rounded-lg
            text-red-400
            hover:bg-red-500/10
            transition
          "
          aria-label="Logout"
        >
          <LogOut size={18} />
        </button>

        {/* 🟢 Desktop logout (icon + text) */}
        <button
          onClick={handleLogout}
          className="
            hidden sm:flex
            items-center gap-2
            px-3 py-1.5 text-sm rounded-lg
            border border-[var(--border-subtle)]
            hover:bg-[var(--bg-surface-hover)]
            active:scale-[0.97]
            transition
          "
          aria-label="Logout"
        >
          <LogOut size={15} />
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;
