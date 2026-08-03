import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiGrid,
  FiUsers,
  FiCheckSquare,
  FiBarChart2,
  FiSettings,
  FiMenu,
  FiShield,
  FiFileText,
  FiLogOut,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import AdminSidebar from "../components/AdminSidebar";
import ThemeToggle from "../components/ThemeToggle";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const AdminLayout = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const adminMobileNavItems = [
    { to: "/admin/dashboard", icon: FiGrid, label: "Dashboard" },
    { to: "/admin/employees", icon: FiUsers, label: "Employees" },
    { to: "/admin/verifications", icon: FiCheckSquare, label: "Attendance" },
    { to: "/admin/reports", icon: FiBarChart2, label: "Analytics" },
    { to: "/admin/settings", icon: FiSettings, label: "Settings" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out of Admin Console");
      navigate("/admin/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans lg:flex-row transition-colors duration-300">
      {/* Mobile Top Navigation Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 px-4 py-3 backdrop-blur-md lg:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/30">
            <FiShield className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-display">Admin Console</span>
            <span className="block text-[9px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono">HR Enterprise</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="rounded-2xl bg-slate-100 dark:bg-slate-800 p-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95"
            aria-label="Open Admin Menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <ThemeToggle />
        </div>
      </header>

      {/* Desktop Admin Left Sidebar */}
      <AdminSidebar isMobileOpen={false} onCloseMobile={() => {}} />

      {/* Main Admin Canvas */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:p-8"
        >
          <Outlet />
        </motion.div>
      </main>

      {/* Mobile Fixed Admin Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 py-1.5 backdrop-blur-xl lg:hidden shadow-lg shadow-slate-900/10 pb-[calc(env(safe-area-inset-bottom,0px)+6px)]">
        {adminMobileNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl text-[11px] font-bold transition-all duration-200 ${
                isActive
                  ? "text-orange-600 dark:text-orange-400 bg-orange-500/10 scale-105"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95"
              }`
            }
          >
            <Icon className="h-5 w-5 mb-0.5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Admin Mobile Menu Slide-up Drawer Modal */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed bottom-0 inset-x-0 z-50 rounded-t-[32px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 shadow-2xl lg:hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-md">
                    <FiShield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-display">HR Administrator</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Enterprise Management Portal</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="rounded-2xl p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2 py-2">
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    navigate("/admin/audit-logs");
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition min-h-[48px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      <FiFileText className="h-5 w-5" />
                    </div>
                    <span>Audit Logs & System History</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    navigate("/dashboard");
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition min-h-[48px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <FiArrowLeft className="h-5 w-5" />
                    </div>
                    <span>Switch to Employee Portal</span>
                  </div>
                </button>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="flex-1">
                  <ThemeToggle className="w-full justify-center min-h-[48px] rounded-2xl" />
                </div>
                <button
                  onClick={handleLogout}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-4 py-3 min-h-[48px] text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition"
                >
                  <FiLogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
