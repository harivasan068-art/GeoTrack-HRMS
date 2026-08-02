import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FiBarChart2,
  FiCheckSquare,
  FiEdit3,
  FiHome,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiSettings,
  FiUsers,
} from "react-icons/fi";
import Branding from "./Branding";
import AdminProfileModal from "./AdminProfileModal";
import { useAuth } from "../hooks/useAuth";
import { getImageUrl } from "../services/api";
import toast from "react-hot-toast";

const AdminSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const navItems = [
    { to: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
    { to: "/admin/verifications", icon: FiCheckSquare, label: "Attendance Requests" },
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
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-5">
        <Branding size="sm" />
      </div>

      <nav className="flex-1 space-y-1.5 p-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
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
        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="w-full flex items-center justify-between gap-3 rounded-xl bg-slate-950 p-3 border border-slate-800 hover:border-indigo-500/50 transition group text-left"
          title="Click to edit admin details"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={getImageUrl(user?.photo) || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"}
              alt="Admin"
              className="h-8 w-8 rounded-lg object-cover border border-slate-700 shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80";
              }}
            />
            <div className="truncate">
              <p className="text-xs font-bold text-white truncate group-hover:text-indigo-300">{user?.full_name || "Admin"}</p>
              <p className="text-[10px] text-indigo-400 font-medium truncate">Administrator</p>
            </div>
          </div>
          <FiEdit3 className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 shrink-0" />
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
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
