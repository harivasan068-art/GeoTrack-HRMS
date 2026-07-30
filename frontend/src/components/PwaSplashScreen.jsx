import { useEffect, useState } from "react";
import { FiMapPin } from "react-icons/fi";

const PwaSplashScreen = ({ children }) => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-500">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white font-extrabold shadow-lg shadow-indigo-600/40">
              <FiMapPin className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white tracking-tight">GeoTrack HRMS</div>
              <div className="text-[11px] font-medium text-slate-400">Workforce Management Platform</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 pt-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
            Loading Enterprise PWA App...
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default PwaSplashScreen;
