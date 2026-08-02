import { useEffect, useState } from "react";
import { FiDownload, FiSmartphone, FiX } from "react-icons/fi";
import Branding from "./Branding";

const InstallPwaBanner = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem("pwa_banner_dismissed");
    if (isDismissed === "true") {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent default Chrome prompt from showing automatically
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      console.log("User accepted the GeoTrack HRMS PWA install prompt");
    }
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    localStorage.setItem("pwa_banner_dismissed", "true");
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-3xl bg-slate-900/95 p-5 border border-orange-500/40 shadow-2xl backdrop-blur-xl animate-fade-in text-white font-sans">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-600 shadow-md">
            <FiSmartphone className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white font-display">Install GeoTrack HRMS App</h4>
            <p className="text-xs text-slate-300 mt-0.5 font-medium">
              Install for instant access, offline mode & native performance.
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1"
          aria-label="Dismiss banner"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 font-sans">
        <button
          onClick={handleDismiss}
          className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-200"
        >
          Not Now
        </button>
        <button
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-1.5 text-xs font-extrabold text-white shadow-md shadow-orange-600/30 hover:bg-orange-700 transition"
        >
          <FiDownload className="h-3.5 w-3.5" /> Install App
        </button>
      </div>
    </div>
  );
};

export default InstallPwaBanner;
