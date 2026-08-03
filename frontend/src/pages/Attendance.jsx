import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiAlertTriangle,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiMapPin,
  FiPlusCircle,
  FiRefreshCw,
  FiSend,
  FiXCircle,
  FiVideo,
  FiImage,
} from "react-icons/fi";
import InteractiveMap from "../components/InteractiveMap";
import LoadingSpinner from "../components/LoadingSpinner";
import WorkProofSection from "../components/WorkProofSection";
import { useBranding } from "../context/BrandingContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { attendanceService } from "../services/attendanceService";
import { API_BASE_URL, getImageUrl } from "../services/api";

const Attendance = () => {
  const { company } = useBranding();
  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Camera & Location States
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [locationName, setLocationName] = useState("");
  const [isInsideGeofence, setIsInsideGeofence] = useState(true);
  const [geofenceDistance, setGeofenceDistance] = useState(0);

  // Work Proof Module States
  const [workImages, setWorkImages] = useState([]);
  const [workVideos, setWorkVideos] = useState([]);
  const [workDescription, setWorkDescription] = useState("");

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { getLocation, loading: geoLoading } = useGeolocation();

  const fetchToday = async () => {
    try {
      const data = await attendanceService.getTodayAttendance();
      setTodayRecords(Array.isArray(data) ? data : data ? [data] : []);
    } catch {
      setTodayRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadPhoto = async (photoUrl, dateStr) => {
    try {
      const fullUrl = getImageUrl(photoUrl);
      if (!fullUrl) {
        toast.error("No photo available to download");
        return;
      }

      const fileName = `Selfie_Proof_${dateStr || Date.now()}.jpg`;
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast.success("Selfie proof downloaded to your device!");
    } catch {
      const fullUrl = getImageUrl(photoUrl);
      const link = document.createElement("a");
      link.href = fullUrl;
      link.target = "_blank";
      link.download = "Selfie_Proof.jpg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Opened photo download");
    }
  };

  useEffect(() => {
    fetchToday();
    requestLocation();
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371000;
    const p1 = (lat1 * Math.PI) / 180;
    const p2 = (lat2 * Math.PI) / 180;
    const dp = ((lat2 - lat1) * Math.PI) / 180;
    const dl = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(dp / 2) * Math.sin(dp / 2) +
      Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const requestLocation = async () => {
    try {
      const loc = await getLocation();
      setGpsLocation(loc);
      setLocationName(loc.location_name || "Customer Site Location");
      setAddress(loc.location_name || "Verified via GPS reverse geocoding");

      if (company?.office_latitude && company?.office_longitude) {
        const dist = calculateDistance(
          loc.latitude,
          loc.longitude,
          company.office_latitude,
          company.office_longitude
        );
        setGeofenceDistance(dist);
        setIsInsideGeofence(dist <= (company.geofence_radius_meters || 100));
      }
    } catch {
      toast.error("Location permission required for GPS attendance");
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  };

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      toast.error("Unable to access camera. You can upload a photo file instead.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `selfie_${Date.now()}.jpg`, { type: "image/jpeg" });
        setSelectedFile(file);
        setCapturedImage(URL.createObjectURL(blob));
        stopCamera();
        toast.success("Live selfie captured!");
      }
    }, "image/jpeg");
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (submitting) return;

    if (!selectedFile) {
      toast.error("Please capture or upload a live selfie");
      return;
    }

    setSubmitting(true);
    try {
      const loc = gpsLocation || (await getLocation());
      const formData = new FormData();
      formData.append("photo", selectedFile);
      formData.append("latitude", loc.latitude);
      formData.append("longitude", loc.longitude);
      formData.append("location_name", locationName || "Customer Site Location");
      formData.append("address", address || "Verified Location");
      if (workDescription.trim()) {
        formData.append("description", workDescription.trim());
      }

      if (workImages && workImages.length > 0) {
        Array.from(workImages).forEach((img) => {
          formData.append("work_images", img);
        });
      }

      if (workVideos && workVideos.length > 0) {
        Array.from(workVideos).forEach((vid) => {
          formData.append("work_videos", vid);
        });
      }

      await attendanceService.submitGeotagPhoto(formData);
      toast.success("Site check-in & work proofs submitted successfully!");

      setCapturedImage(null);
      setSelectedFile(null);
      setWorkImages([]);
      setWorkVideos([]);
      setWorkDescription("");
      fetchToday();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const getStatusBadge = (status) => {
    if (status === "Present") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          <FiCheckCircle /> Verified Present
        </span>
      );
    }
    if (status === "Absent") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-extrabold text-rose-600 dark:text-rose-400 border border-rose-500/20">
          <FiXCircle /> Marked Absent
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <FiClock className="animate-spin" /> Pending Approval
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 font-sans pb-28">
      {/* Page Header Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
          <FiCamera className="text-orange-600 dark:text-orange-400" /> Continuous Field Check-Ins
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Submit live geotagged check-in & work proofs for customer visits throughout the day.
        </p>
      </div>

      <form onSubmit={handleSubmitAttendance} className="space-y-4">
        {/* CARD 1: Customer Site Title & Info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
              <FiPlusCircle className="text-orange-600 dark:text-orange-400" /> Mark Site Visit Location
            </h2>
            <span className="text-[10px] font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              Live GPS Geotag
            </span>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
              Customer / Site Name
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Client Visit - Zenith Corp Site 1"
              className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
            />
          </div>
        </motion.div>

        {/* CARD 2: GPS Status & Geofence Warning */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FiMapPin className="text-orange-600 dark:text-orange-400" /> GPS Geofence Status
            </span>
            {isInsideGeofence ? (
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Inside Verified Zone
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                Outside Zone ({geofenceDistance}m away)
              </span>
            )}
          </div>

          {!isInsideGeofence && (
            <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-3.5 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
              <FiAlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-800 dark:text-amber-200/90 font-medium">
                You are {geofenceDistance}m away from the primary office geofence. Your site check-in will be flagged for Admin verification review.
              </div>
            </div>
          )}
        </motion.div>

        {/* CARD 3: Interactive Leaflet Map Preview */}
        {gpsLocation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
          >
            <InteractiveMap
              latitude={gpsLocation.latitude}
              longitude={gpsLocation.longitude}
              address={address}
              locationName={locationName}
              isInsideGeofence={isInsideGeofence}
              height="h-56 sm:h-64"
            />
          </motion.div>
        )}

        {/* CARD 4: Camera Viewfinder & Live Selfie Capture */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-center"
        >
          <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider text-left">
            Live Selfie Verification
          </label>

          {cameraActive ? (
            <div className="relative rounded-3xl overflow-hidden bg-black border-2 border-orange-500 max-w-sm mx-auto shadow-xl">
              <video ref={videoRef} autoPlay playsInline className="h-64 sm:h-72 w-full object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="rounded-full bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3 min-h-[48px] text-xs font-extrabold text-white shadow-xl hover:scale-105 transition"
                >
                  Take Selfie Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="rounded-full bg-slate-800/90 px-4 py-3 min-h-[48px] text-xs font-bold text-white backdrop-blur-md transition hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : capturedImage ? (
            <div className="space-y-3">
              <img
                src={capturedImage}
                alt="Captured Selfie"
                className="h-56 w-56 object-cover rounded-3xl mx-auto border-2 border-orange-500 shadow-lg"
              />
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 px-5 py-3 min-h-[48px] text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <FiRefreshCw className="h-4 w-4" /> Retake Selfie Photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 min-h-[56px] text-xs sm:text-sm font-extrabold text-white shadow-lg shadow-orange-600/25 hover:scale-[1.01] transition"
            >
              <FiCamera className="h-5 w-5" /> Open Live Camera & Capture Selfie
            </button>
          )}
        </motion.div>

        {/* CARD 5: Work Proof Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-900 dark:text-white uppercase font-mono tracking-wider">
            <FiPlusCircle className="text-orange-600 dark:text-orange-400 h-4 w-4" /> Work Proof Attachments (Optional)
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Site Posters / Photos (Max 10MB each)
              </label>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setWorkImages(e.target.files)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-600 dark:file:text-orange-400 hover:file:bg-orange-500/20 cursor-pointer"
              />
              {workImages && workImages.length > 0 && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  ✓ {workImages.length} image(s) attached
                </span>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Work Videos (Max 100MB each)
              </label>
              <input
                type="file"
                multiple
                accept="video/mp4,video/quicktime,video/webm"
                onChange={(e) => setWorkVideos(e.target.files)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-600 dark:file:text-orange-400 hover:file:bg-orange-500/20 cursor-pointer"
              />
              {workVideos && workVideos.length > 0 && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  ✓ {workVideos.length} video(s) attached
                </span>
              )}
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Work proof description / site notes..."
              value={workDescription}
              onChange={(e) => setWorkDescription(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 px-4 py-3 min-h-[48px] text-xs sm:text-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
            />
          </div>
        </motion.div>

        {/* Sticky Mobile Submit Action Button Bar */}
        <div className="fixed bottom-16 sm:bottom-0 inset-x-0 z-30 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 max-w-3xl mx-auto">
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 py-4 min-h-[52px] text-xs sm:text-sm font-extrabold text-white shadow-xl shadow-orange-600/30 hover:from-orange-500 hover:to-amber-500 transition disabled:opacity-60 font-sans tracking-wide flex items-center justify-center gap-2"
          >
            {submitting ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <FiSend className="h-5 w-5" /> Submit Site Check-In & Work Proofs
              </>
            )}
          </motion.button>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </form>

      {/* List of Today's Submitted Site Visits */}
      {todayRecords.length > 0 && (
        <div className="space-y-4 pt-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <FiClock className="text-orange-600 dark:text-orange-400" /> Today&apos;s Site Visits ({todayRecords.length})
          </h2>

          <div className="space-y-4">
            {todayRecords.map((att) => (
              <div key={att.id} className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-white font-display">{att.location_name || "Customer Site"}</span>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">Check-in at {formatTime(att.check_in)}</div>
                  </div>
                  {getStatusBadge(att.status)}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Address:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                      <FiMapPin className="text-orange-600 shrink-0" /> {att.address || att.location_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">GPS Coordinates:</span>
                    <div className="font-mono text-orange-600 dark:text-orange-400 font-bold mt-0.5">
                      {att.latitude?.toFixed(4)}, {att.longitude?.toFixed(4)}
                    </div>
                  </div>
                </div>

                {att.photo_url && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
                    <div className="relative group">
                      <img
                        src={getImageUrl(att.photo_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80"}
                        alt="Selfie Proof"
                        className="h-24 w-24 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80";
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => downloadPhoto(att.photo_url, att.date)}
                        className="absolute bottom-1 right-1 rounded-xl bg-slate-900/90 p-2 text-xs text-white border border-slate-700 shadow hover:bg-orange-600 transition"
                        title="Download selfie photo"
                      >
                        <FiDownload className="h-4 w-4" />
                      </button>
                    </div>
                    {att.remarks && (
                      <div className="text-xs bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1">
                        <span className="text-slate-500 block font-bold mb-1">Admin Remarks:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{att.remarks}</span>
                      </div>
                    )}
                  </div>
                )}

                <WorkProofSection attendanceId={att.id} isReadOnly={true} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
