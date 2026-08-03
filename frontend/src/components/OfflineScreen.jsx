import { useEffect, useState } from "react";
import { FiRefreshCw, FiWifiOff } from "react-icons/fi";
import Branding from "./Branding";

const OfflineScreen = ({ children }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleRetry = () => {
    setRetrying(true);
    setTimeout(() => {
      setIsOnline(navigator.onLine);
      setRetrying(false);
    }, 1000);
  };

  if (!isOnline) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 px-4 text-center text-slate-100 font-sans">
        <div className="max-w-md space-y-6 rounded-3xl bg-slate-900 p-8 border border-slate-800 shadow-2xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <FiWifiOff className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-white font-display">Offline Mode</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Your internet connection appears to be offline. Don&apos;t worry, your app shell is cached locally by GeoTrack PWA service worker.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs text-slate-300 font-medium">
            Please check your Wi-Fi or cellular mobile data connection.
          </div>

          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-3.5 text-xs font-extrabold text-white shadow-lg hover:bg-orange-700 transition disabled:opacity-50 font-sans tracking-wide"
          >
            <FiRefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
            {retrying ? "Reconnecting..." : "Retry Connection"}
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default OfflineScreen;
