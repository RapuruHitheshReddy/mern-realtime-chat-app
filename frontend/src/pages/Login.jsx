import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Login
 * - Authenticates user and redirects to chat
 * - Uses Redux thunk + unwrap for clean async flow
 */
function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /* ---------------- Handle login ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      await dispatch(loginUser({ email, password })).unwrap();

      toast.success("Welcome back");
      navigate("/chat");
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : err?.message || "Something went wrong"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md ui-glass rounded-2xl p-8 shadow-xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted">
            Sign in to continue to ChatApp
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="ui-glass rounded-xl px-3 py-2 flex items-center gap-2">
            <Mail size={16} className="text-muted" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted"
            />
          </div>

          {/* Password */}
          <div className="ui-glass rounded-xl px-3 py-2 flex items-center gap-2">
            <Lock size={16} className="text-muted" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full mt-2 rounded-xl py-2.5
              text-sm font-medium text-white
              transition
              ${
                loading
                  ? "bg-[var(--primary)]/60 cursor-not-allowed"
                  : "bg-[var(--primary)] hover:opacity-90 active:scale-[0.98]"
              }
            `}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-muted">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-[var(--primary-soft)] hover:underline"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;
