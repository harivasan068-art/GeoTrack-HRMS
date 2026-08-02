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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white transition-opacity duration-500 font-sans">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white font-extrabold shadow-lg shadow-orange-600/40">
              <FiMapPin className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-extrabold text-white tracking-tight font-display">GeoTrack HRMS</div>
              <div className="text-[11px] font-bold text-orange-400 uppercase font-mono tracking-wider">Workforce Platform</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-orange-400 pt-2 font-mono">
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-ping" />
            Loading Enterprise PWA App...
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default PwaSplashScreen;
