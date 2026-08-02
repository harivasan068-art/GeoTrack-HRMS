import { NavLink, useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiHome,
  FiLogOut,
  FiMapPin,
  FiUser,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { getImageUrl } from "../services/api";
import toast from "react-hot-toast";

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { to: "/dashboard", icon: FiHome, label: "Dashboard" },
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
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-100 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <FiMapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold tracking-wide text-white">GeoTrack</p>
              <p className="text-[10px] font-medium uppercase tracking-wider text-indigo-400">
                Employee Portal
              </p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close Sidebar"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 p-4 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold transition ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-3 border border-slate-800">
            <img
              src={getImageUrl(user?.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
              alt={user?.full_name}
              className="h-9 w-9 rounded-lg object-cover border border-slate-700 shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
              }}
            />
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate">{user?.full_name || "Employee"}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.employee_id}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <FiLogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

