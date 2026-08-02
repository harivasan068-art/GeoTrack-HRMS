import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiAlertTriangle,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiEye,
  FiLogOut,
  FiMapPin,
  FiRefreshCw,
  FiX,
  FiXCircle,
} from "react-icons/fi";
import InteractiveMap from "../components/InteractiveMap";
import LoadingSpinner from "../components/LoadingSpinner";
import ImageLightboxModal from "../components/ImageLightboxModal";
import { useBranding } from "../context/BrandingContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { attendanceService } from "../services/attendanceService";
import { getImageUrl } from "../services/api";

const Attendance = () => {
  const { company } = useBranding();
  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Active mode: 'checkin' | 'checkout'
  const [activeTab, setActiveTab] = useState("checkin");

  // Camera & Selfie state
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedSelfieFile, setSelectedSelfieFile] = useState(null);

  // GPS State
  const [gpsLocation, setGpsLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [locationName, setLocationName] = useState("");
  const [isInsideGeofence, setIsInsideGeofence] = useState(true);
  const [geofenceDistance, setGeofenceDistance] = useState(0);

  // Selfie Preview Modal
  const [previewSelfieUrl, setPreviewSelfieUrl] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { getLocation } = useGeolocation();

  const fetchToday = async () => {
    try {
      const data = await attendanceService.getTodayAttendance();
      const records = Array.isArray(data) ? data : data ? [data] : [];
      setTodayRecords(records);
      if (records.length > 0 && records[0].check_in && !records[0].check_out) {
        setActiveTab("checkout");
      }
    } catch {
      setTodayRecords([]);
    } finally {
      setLoading(false);
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
      setLocationName(loc.location_name || "Primary Location");
      setAddress(loc.location_name || "GPS Verified Location");

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
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      toast.error("Unable to access camera. Please select a photo file.");
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
        setSelectedSelfieFile(file);
        setCapturedImage(URL.createObjectURL(blob));
        stopCamera();
        toast.success("Live selfie captured!");
      }
    }, "image/jpeg");
  };

  const handleSelfieFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedSelfieFile(file);
      setCapturedImage(URL.createObjectURL(file));
      stopCamera();
    }
  };

  const handleSubmitCheckIn = async () => {
    if (!gpsLocation) {
      toast.error("Please enable GPS location before submitting attendance.");
      return;
    }
    if (!selectedSelfieFile) {
      toast.error("Please capture a live selfie before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("latitude", gpsLocation.latitude);
      formData.append("longitude", gpsLocation.longitude);
      formData.append("location_name", locationName || "On-Site Work Location");
      formData.append("photo", selectedSelfieFile);

      await attendanceService.submitGeotagPhoto(formData);
      toast.success("Attendance submitted successfully!");
      setCapturedImage(null);
      setSelectedSelfieFile(null);
      fetchToday();
      setActiveTab("checkout");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to submit check-in attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitCheckOut = async () => {
    if (!gpsLocation) {
      toast.error("Please enable GPS location before checking out.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("latitude", gpsLocation.latitude);
      formData.append("longitude", gpsLocation.longitude);
      formData.append("location_name", locationName || "Check-Out Location");

      await attendanceService.checkOutFull(formData);
      toast.success("Checked out successfully!");
      fetchToday();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to submit check-out");
    } finally {
      setSubmitting(false);
    }
  };

  const activeRecord = todayRecords.length > 0 ? todayRecords[0] : null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 font-sans pb-12">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 font-display">
          <FiCamera className="text-orange-600 dark:text-orange-400" /> Attendance Check-In
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
          Capture live camera selfie with real-time GPS location verification
        </p>
      </div>

      {/* Check-In / Check-Out Mode Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab("checkin")}
          className={`py-3 rounded-xl text-xs font-black transition min-h-[44px] flex items-center justify-center gap-2 ${
            activeTab === "checkin"
              ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-md"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FiCamera className="h-4 w-4" /> Check In (Selfie + GPS)
        </button>
        <button
          onClick={() => setActiveTab("checkout")}
          className={`py-3 rounded-xl text-xs font-black transition min-h-[44px] flex items-center justify-center gap-2 ${
            activeTab === "checkout"
              ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-orange-400 shadow-md"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FiLogOut className="h-4 w-4" /> Check Out
        </button>
      </div>

      {/* GPS Location Status Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiMapPin className="text-emerald-600 dark:text-emerald-400 h-5 w-5 shrink-0" />
            <span className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
              GPS Location Verification
            </span>
          </div>
          <button
            onClick={requestLocation}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 min-h-[44px] px-2"
          >
            <FiRefreshCw className="h-3.5 w-3.5" /> Refresh GPS
          </button>
        </div>

        {gpsLocation ? (
          <div className="space-y-2 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-200">{locationName}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                  isInsideGeofence
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                {isInsideGeofence ? "Inside Zone" : "Outside Zone"}
              </span>
            </div>
            <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
              📍 {gpsLocation.latitude.toFixed(5)}, {gpsLocation.longitude.toFixed(5)}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2">
            <FiAlertTriangle className="h-5 w-5 shrink-0" /> GPS permission required. Click Refresh GPS above.
          </div>
        )}
      </div>

      {/* CHECK-IN TAB CONTENT */}
      {activeTab === "checkin" && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-3">
            <label className="block text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Step 1: Live Selfie Capture
            </label>

            {/* Camera View / Captured Image Preview */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-900 border-2 border-slate-200 dark:border-slate-800 aspect-video flex items-center justify-center">
              {cameraActive ? (
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : capturedImage ? (
                <img src={capturedImage} alt="Captured Selfie" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <FiCamera className="h-12 w-12 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-400 font-medium">No selfie captured yet</p>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Camera Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              {cameraActive ? (
                <button
                  onClick={capturePhoto}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-xs font-extrabold text-white shadow hover:bg-emerald-700 min-h-[44px]"
                >
                  <FiCamera className="h-4 w-4" /> Capture Photo
                </button>
              ) : (
                <button
                  onClick={startCamera}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-3 text-xs font-extrabold text-white shadow hover:bg-orange-700 min-h-[44px]"
                >
                  <FiCamera className="h-4 w-4" /> {capturedImage ? "Retake Selfie" : "Open Camera"}
                </button>
              )}

              <label className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer min-h-[44px]">
                <span>Choose Photo File</span>
                <input type="file" accept="image/*" onChange={handleSelfieFileSelect} className="hidden" />
              </label>
            </div>
          </div>

          {/* Submit Attendance Button */}
          <button
            disabled={submitting || !selectedSelfieFile || !gpsLocation}
            onClick={handleSubmitCheckIn}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-4 text-sm font-black text-white shadow-xl hover:scale-[1.01] transition disabled:opacity-40 min-h-[48px]"
          >
            {submitting ? <LoadingSpinner size="sm" /> : <FiCheckCircle className="h-5 w-5" />}
            {submitting ? "Submitting Attendance..." : "Submit Check-In Attendance"}
          </button>
        </div>
      )}

      {/* CHECK-OUT TAB CONTENT */}
      {activeTab === "checkout" && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Check-In Time:</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatTime(activeRecord?.check_in_time || activeRecord?.check_in)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Working Duration:</span>
              <span className="font-bold text-orange-600">{activeRecord?.working_hours || "In Progress"}</span>
            </div>
          </div>

          <button
            disabled={submitting || !gpsLocation || activeRecord?.check_out}
            onClick={handleSubmitCheckOut}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 px-6 py-4 text-sm font-black text-white shadow-xl hover:bg-rose-700 transition disabled:opacity-40 min-h-[48px]"
          >
            {submitting ? <LoadingSpinner size="sm" /> : <FiLogOut className="h-5 w-5" />}
            {activeRecord?.check_out ? "Already Checked Out Today" : "Check Out Now"}
          </button>
        </div>
      )}

      {/* Today's Attendance Records Summary */}
      {todayRecords.length > 0 && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-display">
            <FiClock className="text-orange-600 dark:text-orange-400" /> Today's Attendance Summary
          </h3>

          {todayRecords.map((rec) => {
            const selfieUrl = rec.selfie_url || rec.photo_url;
            return (
              <div
                key={rec.id}
                className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/80 dark:border-slate-800 space-y-3 font-sans text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">{rec.date}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                      rec.status === "Present"
                        ? "bg-emerald-100 text-emerald-800"
                        : rec.status === "Absent"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {rec.status || "Pending Approval"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div>
                    <span className="text-slate-400 block font-sans">Check-In:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatTime(rec.check_in)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-sans">Check-Out:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatTime(rec.check_out)}</span>
                  </div>
                </div>

                {selfieUrl && (
                  <button
                    onClick={() => setPreviewSelfieUrl(getImageUrl(selfieUrl))}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 px-3 py-2 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-600 hover:text-white transition min-h-[44px]"
                  >
                    <FiEye className="h-4 w-4" /> View Selfie
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Selfie Preview Modal */}
      {previewSelfieUrl && (
        <ImageLightboxModal
          isOpen={!!previewSelfieUrl}
          onClose={() => setPreviewSelfieUrl(null)}
          images={[previewSelfieUrl]}
          initialIndex={0}
        />
      )}
    </div>
  );
};

export default Attendance;
