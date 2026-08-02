import { FiMoon, FiSun } from "react-icons/fi";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative inline-flex items-center gap-2 rounded-2xl border p-2 text-xs font-bold transition-all duration-300 font-sans ${
        isDark
          ? "border-slate-700 bg-slate-800 text-amber-300 hover:bg-slate-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-sm"
      } ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Light/Dark Theme"
    >
      {isDark ? (
        <>
          <FiSun className="h-4 w-4 text-amber-400 animate-pulse" />
          <span className="hidden sm:inline">Light Mode</span>
        </>
      ) : (
        <>
          <FiMoon className="h-4 w-4 text-orange-600" />
          <span className="hidden sm:inline">Dark Mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;
