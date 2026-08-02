import { useState } from "react";
import { Outlet } from "react-router-dom";
import { FiMenu, FiShield } from "react-icons/fi";
import AdminSidebar from "../components/AdminSidebar";

const AdminLayout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans lg:flex-row">
      {/* Mobile Top Header for Admin Console */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="rounded-xl bg-slate-800 p-2 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            aria-label="Open Admin Menu"
          >
            <FiMenu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
              <FiShield className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-sm tracking-wide text-white">HR Admin Console</span>
          </div>
        </div>
      </header>

      {/* Admin Side Drawer */}
      <AdminSidebar isMobileOpen={isMobileOpen} onCloseMobile={() => setIsMobileOpen(false)} />

      {/* Admin Content View */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

