import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiBarChart2,
  FiCheckSquare,
  FiEdit3,
  FiHome,
  FiLock,
  FiLogOut,
  FiSettings,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import AdminProfileModal from "./AdminProfileModal";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import { getImageUrl } from "../services/api";
import toast from "react-hot-toast";

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const navItems = [
    { to: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
    { to: "/admin/verifications", icon: FiCheckSquare, label: "Attendance Review" },
    { to: "/admin/employees", icon: FiUsers, label: "Employee Directory" },
    { to: "/admin/reports", icon: FiBarChart2, label: "Reports & Analytics" },
    { to: "/admin/audit-logs", icon: FiLock, label: "Audit Trail Logs" },
    { to: "/admin/settings", icon: FiSettings, label: "Company Settings" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/admin/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl text-slate-900 dark:text-slate-100 min-h-screen sticky top-0 h-screen">
      {/* Admin Brand Header */}
      <div className="flex items-center gap-3 border-b border-slate-200/80 dark:border-slate-800/80 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-600/30">
          <FiShield className="h-6 w-6" />
        </div>
        <div>
          <p className="font-extrabold tracking-tight text-slate-900 dark:text-white font-display text-lg">HR Admin</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono">
            Enterprise Console
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ scale: 1.02, x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-3.5 rounded-2xl px-4 py-3.5 text-xs font-extrabold transition-all duration-200 min-h-[48px] ${
                  isActive
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/25"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{label}</span>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Admin Profile & Footer */}
      <div className="border-t border-slate-200/80 dark:border-slate-800/80 p-4 space-y-3">
        <ThemeToggle className="w-full justify-center min-h-[44px] rounded-2xl" />

        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="w-full flex items-center justify-between gap-3 rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 hover:border-orange-300 dark:hover:border-orange-500 transition group text-left shadow-sm"
          title="Click to edit admin profile details"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={getImageUrl(user?.photo) || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"}
              alt="Admin"
              className="h-9 w-9 rounded-xl object-cover border-2 border-orange-500 shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80";
              }}
            />
            <div className="truncate">
              <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate font-display group-hover:text-orange-600 dark:group-hover:text-orange-400">{user?.full_name || "Admin"}</p>
              <p className="text-[10px] text-orange-600 dark:text-orange-400 font-bold truncate">Administrator</p>
            </div>
          </div>
          <FiEdit3 className="h-4 w-4 text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 shrink-0" />
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 dark:border-slate-700 px-4 py-3 min-h-[44px] text-xs font-bold text-slate-700 dark:text-slate-300 transition hover:bg-rose-500 hover:text-white hover:border-rose-500"
        >
          <FiLogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      <AdminProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
    </aside>
  );
};

export default AdminSidebar;
