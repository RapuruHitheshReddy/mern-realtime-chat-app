import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Register Page
 * - Handles user onboarding
 * - Uses Redux async thunk with unwrap for clean error handling
 * - Toasts are used for UX feedback (no inline error blocks)
 */
function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Only loading is needed here; errors are handled via toast
  const { loading } = useSelector((state) => state.auth);

  // Controlled form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Submit handler
   * - unwrap() allows try/catch instead of requestStatus checks
   * - Navigation only happens on success
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(registerUser({ name, email, password })).unwrap();

      toast.success("Account created successfully");
      navigate("/chat");
    } catch (err) {
      toast.error(
        typeof err === "string" ? err : err?.message || "Something went wrong"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] px-4">
      {/* Entry animation wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md ui-glass rounded-2xl p-8 shadow-xl"
      >
        {/* Page header */}
        <div className="mb-8 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-muted">Get started with ChatApp</p>
        </div>

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full name */}
          <div className="ui-glass rounded-xl px-3 py-2 flex items-center gap-2">
            <User size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted"
            />
          </div>

          {/* Email */}
          <div className="ui-glass rounded-xl px-3 py-2 flex items-center gap-2">
            <Mail size={16} className="text-muted" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              className="w-full bg-transparent outline-none text-sm placeholder:text-muted"
            />
          </div>

          {/* Submit action */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full mt-2 rounded-xl py-2.5 text-sm font-medium
              transition text-white
              ${
                loading
                  ? "bg-[var(--primary)]/60 cursor-not-allowed"
                  : "bg-[var(--primary)] hover:opacity-90 active:scale-[0.98]"
              }
            `}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        {/* Navigation footer */}
        <p className="mt-6 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-[var(--primary-soft)] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;
