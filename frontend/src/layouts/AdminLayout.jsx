import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FiCheckSquare, FiFileText, FiGrid, FiMenu, FiShield, FiUsers } from "react-icons/fi";
import AdminSidebar from "../components/AdminSidebar";
import ThemeToggle from "../components/ThemeToggle";
import ErrorBoundary from "../components/ErrorBoundary";

const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const adminMobileNavItems = [
    { to: "/admin/dashboard", icon: FiGrid, label: "Dashboard" },
    { to: "/admin/verification-sheet", icon: FiCheckSquare, label: "Verification" },
    { to: "/admin/employees", icon: FiUsers, label: "Employees" },
    { to: "/admin/reports", icon: FiFileText, label: "Reports" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans lg:flex-row transition-colors duration-300">
      {/* Mobile Top Header for Admin Console */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 px-4 py-3 backdrop-blur-md lg:hidden shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open Admin Menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/30">
              <FiShield className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-sm tracking-wide text-slate-900 dark:text-white font-display">HR Admin Console</span>
          </div>
        </div>

        <ThemeToggle />
      </header>

      {/* Admin Side Drawer */}
      <AdminSidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Admin Content View */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-8">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:p-8">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* Fixed Admin Mobile Bottom Action Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 py-2 backdrop-blur-lg lg:hidden shadow-lg">
        {adminMobileNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1 text-[11px] font-bold transition min-h-[44px] justify-center ${
                isActive
                  ? "text-orange-600 dark:text-orange-400 scale-105"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
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

export default AdminLayout;
