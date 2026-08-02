import { Link, useLocation } from "react-router-dom";
import Branding from "./Branding";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../context/ThemeContext";

const Navbar = () => {
  const location = useLocation();
  const { isDark } = useTheme();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/features", label: "Features" },
    { to: "/careers", label: "Careers" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/">
          <Branding size="md" dark={isDark} />
        </Link>

        {/* Public SaaS Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600 dark:text-slate-300 font-sans">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`transition hover:text-orange-600 dark:hover:text-orange-400 ${
                location.pathname === link.to ? "text-orange-600 dark:text-orange-400 font-extrabold" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Portals CTA & Theme Switcher */}
        <div className="flex items-center gap-3 font-sans">
          <ThemeToggle />
          <Link
            to="/login"
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm"
          >
            Employee Login
          </Link>
          <Link
            to="/admin/login"
            className="rounded-2xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-600/30 hover:bg-orange-700 transition"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
