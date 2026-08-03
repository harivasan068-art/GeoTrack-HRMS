import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser, FiMapPin, FiPhone, FiBriefcase, FiHash, FiArrowLeft } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(formData);
      toast.success("Account registered successfully! Please sign in.");
      navigate("/login");
    } catch (error) {
      const errMsg = error.response?.data?.detail || "";
      if (
        errMsg.toLowerCase().includes("already exists") ||
        errMsg.toLowerCase().includes("duplicate") ||
        errMsg.toLowerCase().includes("registered")
      ) {
        toast.error("Employee already exists with this Employee ID or Email.");
      } else {
        toast.error(errMsg || "Registration failed. Please check your information.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-orange-950/40 text-slate-100 font-sans relative overflow-hidden py-10">
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-lg my-auto"
      >
        <div className="rounded-[32px] bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-xl shadow-orange-600/30 mb-4">
              <FiMapPin className="h-8 w-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              Employee Registration
            </h1>
            <p className="mt-1.5 text-xs text-slate-400 font-medium">
              Create official profile for geotagged attendance portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 pl-12 pr-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
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

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-extrabold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                Phone Number
              </label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 pl-12 pr-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium transition-all"
                  placeholder="+1 234 567 8900"
                  required
                />
              </div>
            </div>

            {/* Department & Designation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                  Department
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 pl-12 pr-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium transition-all"
                    placeholder="Engineering"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-extrabold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                  Designation
                </label>
                <div className="relative">
                  <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 pl-12 pr-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium transition-all"
                    placeholder="Field Specialist"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password */}
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
                  placeholder="Min 6 characters"
                  minLength={6}
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

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 py-3.5 min-h-[48px] text-xs sm:text-sm font-extrabold text-white shadow-xl shadow-orange-600/30 hover:from-orange-500 hover:to-amber-500 transition-all disabled:opacity-60 font-sans tracking-wide mt-2"
            >
              {loading ? <LoadingSpinner size="sm" /> : "Complete Account Registration"}
            </motion.button>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs font-medium">
            Already registered?{" "}
            <Link to="/login" className="font-extrabold text-orange-400 hover:text-orange-300 hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
