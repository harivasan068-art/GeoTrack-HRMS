import { NavLink, useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiClock,
  FiHome,
  FiLogOut,
  FiMapPin,
  FiUser,
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import toast from "react-hot-toast";

const Sidebar = () => {
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
    <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
            <FiMapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="font-bold text-slate-900">GeoTrack</p>
            <p className="text-xs text-slate-500">Employee Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="mb-3 rounded-lg bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-900">{user?.full_name}</p>
          <p className="text-xs text-slate-500">{user?.employee_id}</p>
        </div>
        <button onClick={handleLogout} className="btn-secondary w-full">
          <FiLogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
