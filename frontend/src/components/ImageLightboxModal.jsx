import { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiRotateCcw, FiX, FiZoomIn, FiZoomOut } from "react-icons/fi";
import { getImageUrl } from "../services/api";

/**
 * ImageLightboxModal - Full-screen interactive image viewer
 * Supports Zoom In/Out/Reset, Keyboard Navigation (Arrow Keys / Escape), and Previous/Next Image cycling.
 */
const ImageLightboxModal = ({ images = [], currentIndex = 0, onClose, onNavigate }) => {
  const [zoom, setZoom] = useState(1);

  const currentImage = images[currentIndex] || null;

  useEffect(() => {
    setZoom(1);
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate]);

  if (!currentImage) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.3, 0.7));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4 select-none">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10 font-sans">
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold font-display bg-slate-800/80 border border-slate-700/80 px-3 py-1.5 rounded-2xl shadow-sm">
            {currentImage.title || "Media Image"}
          </span>
          {images.length > 1 && (
            <span className="text-xs font-mono text-slate-400 font-bold">
              {currentIndex + 1} of {images.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-1 shadow-sm">
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={zoom <= 0.7}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-xl transition disabled:opacity-40 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Zoom Out"
            >
              <FiZoomOut className="h-5 w-5" />
            </button>
            <span className="text-xs font-mono font-bold px-2 text-slate-200">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/60 rounded-xl transition disabled:opacity-40 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Zoom In"
            >
              <FiZoomIn className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleResetZoom}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/60 rounded-xl transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Reset Zoom"
              aria-label="Reset Zoom"
            >
              <FiRotateCcw className="h-4 w-4" />
            </button>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-2xl bg-rose-600/80 hover:bg-rose-600 text-white shadow-lg transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close Preview"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Previous Image Navigation Arrow */}
      {images.length > 1 && currentIndex > 0 && (
        <button
          type="button"
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-slate-800/80 border border-slate-700 hover:bg-orange-600 text-white shadow-xl transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Previous Image"
        >
          <FiChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Main Image Stage */}
      <div className="relative max-w-full max-h-[85vh] overflow-auto flex items-center justify-center p-4">
        <img
          src={getImageUrl(currentImage.url)}
          alt={currentImage.title || "Preview"}
          style={{ transform: `scale(${zoom})`, transition: "transform 0.2s ease-out" }}
          className="max-h-[80vh] max-w-full object-contain rounded-2xl shadow-2xl origin-center"
        />
      </div>

      {/* Next Image Navigation Arrow */}
      {images.length > 1 && currentIndex < images.length - 1 && (
        <button
          type="button"
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-slate-800/80 border border-slate-700 hover:bg-orange-600 text-white shadow-xl transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Next Image"
        >
          <FiChevronRight className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default ImageLightboxModal;
