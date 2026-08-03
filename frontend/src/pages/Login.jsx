import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiLock, FiMail, FiMapPin, FiCheck, FiHelpCircle, FiX } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${user.full_name}!`);
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950/40 text-slate-100 font-sans relative overflow-hidden">
      {/* Background Decorative Ambient Circles */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md my-auto"
      >
        {/* Mobile App Screen Container */}
        <div className="rounded-[32px] bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-xl shadow-orange-600/30 mb-4">
              <FiMapPin className="h-8 w-8 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              GeoTrack HRMS
            </h1>
            <p className="mt-1.5 text-xs text-slate-400 font-medium">
              Employee Portal Sign In
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 pl-12 pr-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium transition-all"
                  placeholder="john@company.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 pl-12 pr-12 py-3.5 min-h-[48px] text-xs sm:text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium transition-all"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${
                  rememberMe ? "bg-orange-600 border-orange-600 text-white" : "border-slate-700 bg-slate-950"
                }`}>
                  {rememberMe && <FiCheck className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
                <span>Remember Me</span>
              </label>

              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="font-bold text-orange-400 hover:text-orange-300 transition hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 py-3.5 min-h-[48px] text-xs sm:text-sm font-extrabold text-white shadow-xl shadow-orange-600/30 hover:from-orange-500 hover:to-amber-500 transition-all disabled:opacity-60 font-sans tracking-wide mt-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : "Sign In to Employee Portal"}
            </motion.button>
          </form>

          {/* Registration Link */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-400 font-medium">
            Don&apos;t have an employee account?{" "}
            <Link to="/register" className="font-extrabold text-orange-400 hover:text-orange-300 hover:underline">
              Create Account
            </Link>
          </div>

          {/* Admin Login Link */}
          <div className="mt-4 text-center">
            <Link to="/admin/login" className="text-[11px] font-bold text-slate-500 hover:text-slate-300 transition">
              Switch to Administrator Portal &rarr;
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                  <FiHelpCircle className="h-5 w-5" /> Account Password Reset
                </div>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="rounded-xl p-1 text-slate-400 hover:text-white"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                For security compliance, employee password resets are authorized directly by your HR Administrator.
              </p>
              <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs text-slate-400 space-y-1">
                <p className="font-bold text-slate-200">How to reset:</p>
                <p>1. Contact your HR Administrator or Manager.</p>
                <p>2. Request a password reset for your email address.</p>
              </div>
              <button
                onClick={() => setShowForgotPassword(false)}
                className="w-full rounded-2xl bg-orange-600 py-3 min-h-[48px] text-xs font-bold text-white hover:bg-orange-500 transition"
              >
                Understood
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
