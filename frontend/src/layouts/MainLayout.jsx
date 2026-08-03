import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiHome,
  FiMapPin,
  FiMenu,
  FiRefreshCw,
  FiUser,
  FiX,
  FiCreditCard,
  FiInfo,
  FiLogOut,
  FiChevronRight,
  FiShield,
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import ThemeToggle from "../components/ThemeToggle";
import { useGeolocation } from "../hooks/useGeolocation";
import { useAuth } from "../hooks/useAuth";
import { getImageUrl } from "../services/api";
import toast from "react-hot-toast";

const MainLayout = () => {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { location, loading: geoLoading, error: geoError, getLocation } = useGeolocation({ autoFetch: true });

  const mobileNavItems = [
    { to: "/dashboard", icon: FiHome, label: "Home" },
    { to: "/attendance", icon: FiClock, label: "Attendance" },
    { to: "/attendance/history", icon: FiCalendar, label: "History" },
    { to: "/profile", icon: FiUser, label: "Profile" },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans lg:flex-row transition-colors duration-300">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 px-4 py-3 backdrop-blur-md lg:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/30">
            <FiMapPin className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-display">GeoTrack</span>
            <span className="block text-[9px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono">Mobile HRMS</span>
          </div>
        </div>

        {/* GPS Live Pill Badge & Theme Switcher */}
        <div className="flex items-center gap-2">
          {location ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              GPS Active
            </span>
          ) : geoLoading ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-1 text-[11px] font-bold text-orange-600 dark:text-orange-400 border border-orange-500/20">
              <FiRefreshCw className="h-3 w-3 animate-spin" />
              Locating...
            </span>
          ) : (
            <button
              onClick={() => getLocation()}
              className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition active:scale-95 shadow-sm"
            >
              <FiMapPin className="h-3 w-3 text-amber-600" />
              Enable GPS
            </button>
          )}

          <ThemeToggle />
        </div>
      </header>

      {/* Desktop Left Sidebar */}
      <Sidebar isMobileOpen={false} onCloseMobile={() => {}} />

      {/* Main Page Canvas */}
      <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:p-8"
        >
          <Outlet context={{ location, geoLoading, geoError, getLocation }} />
        </motion.div>
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Minimum 48px Touch Target Height) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-slate-200/80 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 py-1.5 backdrop-blur-xl lg:hidden shadow-lg shadow-slate-900/10 pb-[calc(env(safe-area-inset-bottom,0px)+6px)]">
        {mobileNavItems.map(({ to, icon: Icon, label }) => (
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

        {/* ☰ More Button */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex flex-col items-center justify-center min-w-[56px] min-h-[48px] py-1 px-2 rounded-2xl text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white active:scale-95 transition-all duration-200"
          aria-label="More Menu"
        >
          <FiMenu className="h-5 w-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

      {/* Mobile "More" Slide-up Bottom Drawer Modal */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden"
            />

            {/* Bottom Sheet Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed bottom-0 inset-x-0 z-50 rounded-t-[32px] bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-6 shadow-2xl lg:hidden max-h-[85vh] overflow-y-auto"
            >
              {/* Top Handle Bar */}
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-6" />

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={getImageUrl(user?.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                    alt={user?.full_name}
                    className="h-12 w-12 rounded-2xl object-cover border-2 border-orange-500 shadow-md shrink-0"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                    }}
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white font-display">{user?.full_name || "Employee"}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user?.designation} &bull; {user?.department}</p>
                    <p className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400 mt-0.5">ID: {user?.employee_id}</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="rounded-2xl p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Action Links List */}
              <div className="space-y-2 py-2">
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    navigate("/profile");
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition min-h-[48px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                      <FiCreditCard className="h-5 w-5" />
                    </div>
                    <span>Digital Employee ID Card</span>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    navigate("/features");
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition min-h-[48px]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      <FiInfo className="h-5 w-5" />
                    </div>
                    <span>Platform Features & Help</span>
                  </div>
                  <FiChevronRight className="h-4 w-4 text-slate-400" />
                </button>

                {user?.is_admin && (
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      navigate("/admin/dashboard");
                    }}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-xs font-bold text-orange-700 dark:text-orange-300 transition min-h-[48px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md">
                        <FiShield className="h-5 w-5" />
                      </div>
                      <span>Switch to Admin Console</span>
                    </div>
                    <FiChevronRight className="h-4 w-4 text-orange-500" />
                  </button>
                )}
              </div>

              {/* Bottom Row: Theme & Logout */}
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

export default MainLayout;
