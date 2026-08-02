import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiHome,
  FiMapPin,
  FiMenu,
  FiRefreshCw,
  FiUser,
} from "react-icons/fi";
import Sidebar from "../components/Sidebar";
import { useGeolocation } from "../hooks/useGeolocation";

const MainLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { location, loading: geoLoading, error: geoError, getLocation } = useGeolocation({ autoFetch: true });

  const mobileNavItems = [
    { to: "/dashboard", icon: FiHome, label: "Home" },
    { to: "/attendance", icon: FiClock, label: "Mark Attendance" },
    { to: "/attendance/history", icon: FiCalendar, label: "History" },
    { to: "/profile", icon: FiUser, label: "Profile" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans lg:flex-row">
      {/* Mobile Top Sticky Navigation Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded-xl bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            aria-label="Open Menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <FiMapPin className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-sm tracking-wide text-white">GeoTrack</span>
          </div>
        </div>

        {/* Location Status Badge in Header */}
        <div className="flex items-center gap-2">
          {location ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              GPS Active
            </span>
          ) : geoLoading ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold text-indigo-300 border border-indigo-500/20">
              <FiRefreshCw className="h-3 w-3 animate-spin" />
              GPS Loading
            </span>
          ) : (
            <button
              onClick={() => getLocation()}
              className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition"
            >
              <FiMapPin className="h-3 w-3" />
              Enable GPS
            </button>
          )}
        </div>
      </header>

      {/* Main Drawer Sidebar */}
      <Sidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Main Screen Content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:p-8">
          <Outlet context={{ location, geoLoading, geoError, getLocation }} />
        </div>
      </main>

      {/* Fixed Mobile Bottom Action Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-slate-800 bg-slate-900/95 py-2 backdrop-blur-lg lg:hidden">
        {mobileNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-semibold transition ${
                isActive
                  ? "text-indigo-400 scale-105"
                  : "text-slate-400 hover:text-slate-200"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default MainLayout;

