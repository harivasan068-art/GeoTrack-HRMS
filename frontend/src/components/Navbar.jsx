import { Link, useLocation } from "react-router-dom";
import Branding from "./Branding";

const Navbar = () => {
  const location = useLocation();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/services", label: "Services" },
    { to: "/features", label: "Features" },
    { to: "/careers", label: "Careers" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        <Link to="/">
          <Branding size="md" />
        </Link>

        {/* Public SaaS Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`transition hover:text-indigo-400 ${
                location.pathname === link.to ? "text-indigo-400 font-semibold" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Portals CTA */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl bg-slate-900 border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition"
          >
            Employee Login
          </Link>
          <Link
            to="/admin/login"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition"
          >
            Admin Portal
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
