import { useRef, useState } from "react";
import { FiFilm, FiMaximize, FiPause, FiPlay, FiVolume2, FiVolumeX } from "react-icons/fi";
import { getImageUrl } from "../services/api";

const VideoPlayer = ({ src, className = "" }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  if (!src) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-slate-400 font-sans ${className}`}>
        <FiFilm className="h-8 w-8 mb-2 opacity-50 text-orange-500" />
        <span className="text-xs font-bold font-mono">No Video Available</span>
      </div>
    );
  }

  const mediaUrl = getImageUrl(src);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration || 1;
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const seekTime = (parseFloat(e.target.value) / 100) * (videoRef.current?.duration || 1);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setProgress(e.target.value);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black border border-slate-800 shadow-xl group font-sans ${className}`}>
      <video
        ref={videoRef}
        src={mediaUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        className="w-full h-auto max-h-80 object-contain mx-auto bg-black"
        playsInline
      />

      {/* Control Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 opacity-90 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={handleSeek}
          className="w-full h-1 bg-slate-700 accent-orange-600 rounded-lg cursor-pointer mb-2"
        />

        <div className="flex items-center justify-between text-white text-xs font-mono">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition shadow-sm"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <FiPause className="h-4 w-4" /> : <FiPlay className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1 text-slate-300 hover:text-white transition"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <FiVolumeX className="h-4 w-4" /> : <FiVolume2 className="h-4 w-4" />}
            </button>

            <span className="text-[11px] font-bold text-slate-300">
              {formatTime(videoRef.current?.currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1 text-slate-300 hover:text-white transition"
            aria-label="Fullscreen"
          >
            <FiMaximize className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
