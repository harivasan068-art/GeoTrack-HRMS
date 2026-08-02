import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  FiAlertTriangle,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiFilm,
  FiImage,
  FiLogOut,
  FiMapPin,
  FiPlayCircle,
  FiPlusCircle,
  FiRefreshCw,
  FiSend,
  FiUploadCloud,
  FiXCircle,
} from "react-icons/fi";
import InteractiveMap from "../components/InteractiveMap";
import LoadingSpinner from "../components/LoadingSpinner";
import VideoPlayer from "../components/VideoPlayer";
import { useBranding } from "../context/BrandingContext";
import { useGeolocation } from "../hooks/useGeolocation";
import { attendanceService } from "../services/attendanceService";
import { getImageUrl } from "../services/api";

const Attendance = () => {
  const { company } = useBranding();
  const [todayRecords, setTodayRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Check-In Mode or Check-Out Mode
  const [activeTab, setActiveTab] = useState("checkin"); // 'checkin' | 'checkout'

  // Camera & Location States
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [selectedSelfieFile, setSelectedSelfieFile] = useState(null);

  // Work Photo & Video File States (Check-In)
  const [workPhotoFile, setWorkPhotoFile] = useState(null);
  const [workPhotoPreview, setWorkPhotoPreview] = useState(null);

  const [workVideoFile, setWorkVideoFile] = useState(null);
  const [workVideoPreview, setWorkVideoPreview] = useState(null);

  // Check-Out Media File States
  const [checkoutSelfieFile, setCheckoutSelfieFile] = useState(null);
  const [checkoutSelfiePreview, setCheckoutSelfiePreview] = useState(null);

  const [checkoutPhotoFile, setCheckoutPhotoFile] = useState(null);
  const [checkoutPhotoPreview, setCheckoutPhotoPreview] = useState(null);

  const [checkoutVideoFile, setCheckoutVideoFile] = useState(null);
  const [checkoutVideoPreview, setCheckoutVideoPreview] = useState(null);

  const [gpsLocation, setGpsLocation] = useState(null);
  const [address, setAddress] = useState("");
  const [locationName, setLocationName] = useState("");
  const [isInsideGeofence, setIsInsideGeofence] = useState(true);
  const [geofenceDistance, setGeofenceDistance] = useState(0);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { getLocation } = useGeolocation();

  const fetchToday = async () => {
    try {
      const data = await attendanceService.getTodayAttendance();
      const records = Array.isArray(data) ? data : data ? [data] : [];
      setTodayRecords(records);
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
      setLocationName(loc.location_name || "Primary Office Location");
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
    } catch (e) {
      toast.error("Location permission required for GPS attendance");
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  // Start live camera stream
  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
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

  const handleWorkPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["jpg", "jpeg", "png"].includes(ext)) {
      toast.error("Invalid photo format. Allowed: JPG, JPEG, PNG");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Work photo exceeds 10 MB maximum limit");
      return;
    }
    setWorkPhotoFile(file);
    setWorkPhotoPreview(URL.createObjectURL(file));
  };

  const handleWorkVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["mp4", "mov", "webm"].includes(ext)) {
      toast.error("Invalid video format. Allowed: MP4, MOV, WEBM");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Work video exceeds 100 MB maximum limit");
      return;
    }
    setWorkVideoFile(file);
    setWorkVideoPreview(URL.createObjectURL(file));
  };

  const handleCheckoutPhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Checkout photo exceeds 10 MB maximum limit");
      return;
    }
    setCheckoutPhotoFile(file);
    setCheckoutPhotoPreview(URL.createObjectURL(file));
  };

  const handleCheckoutVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Checkout video exceeds 100 MB maximum limit");
      return;
    }
    setCheckoutVideoFile(file);
    setCheckoutVideoPreview(URL.createObjectURL(file));
  };

  const handleCheckInSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSelfieFile) {
      toast.error("Live selfie or selfie photo is required for check-in");
      return;
    }

    setSubmitting(true);
    setUploadProgress(10);

    try {
      const loc = gpsLocation || (await getLocation());
      const formData = new FormData();
      formData.append("photo", selectedSelfieFile);
      formData.append("latitude", loc.latitude);
      formData.append("longitude", loc.longitude);
      formData.append("location_name", locationName || "Primary Office Location");
      formData.append("address", address || "Verified GPS Location");

      if (workPhotoFile) {
        formData.append("work_photo", workPhotoFile);
      }
      if (workVideoFile) {
        formData.append("work_video", workVideoFile);
      }

      setUploadProgress(50);
      await attendanceService.submitGeotagPhoto(formData);
      setUploadProgress(100);

      toast.success("Check-In & Work Proof Submitted Successfully!");
      setCapturedImage(null);
      setSelectedSelfieFile(null);
      setWorkPhotoFile(null);
      setWorkPhotoPreview(null);
      setWorkVideoFile(null);
      setWorkVideoPreview(null);
      fetchToday();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Check-In submission failed");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleCheckOutSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setUploadProgress(20);

    try {
      const loc = gpsLocation || (await getLocation());
      const formData = new FormData();
      formData.append("latitude", loc.latitude);
      formData.append("longitude", loc.longitude);
      formData.append("location_name", locationName || "Check-Out Location");

      if (checkoutSelfieFile) {
        formData.append("checkout_selfie", checkoutSelfieFile);
      }
      if (checkoutPhotoFile) {
        formData.append("checkout_work_photo", checkoutPhotoFile);
      }
      if (checkoutVideoFile) {
        formData.append("checkout_work_video", checkoutVideoFile);
      }

      setUploadProgress(60);
      await attendanceService.checkOutFull(formData);
      setUploadProgress(100);

      toast.success("Check-Out Completed! Working hours calculated.");
      setCheckoutSelfieFile(null);
      setCheckoutSelfiePreview(null);
      setCheckoutPhotoFile(null);
      setCheckoutPhotoPreview(null);
      setCheckoutVideoFile(null);
      setCheckoutVideoPreview(null);
      fetchToday();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Check-Out submission failed");
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Find primary today record
  const primaryRecord = todayRecords.length > 0 ? todayRecords[0] : null;
  const isCheckedIn = !!primaryRecord;
  const isCheckedOut = !!(primaryRecord && (primaryRecord.check_out || primaryRecord.check_out_time));

  return (
    <div className="mx-auto max-w-4xl space-y-8 font-sans">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-bold font-mono tracking-wider uppercase backdrop-blur-md">
              Workday Attendance Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display mt-2">
              GPS Check-In & Check-Out Portal
            </h1>
            <p className="text-xs sm:text-sm text-orange-100 mt-1 font-medium max-w-xl">
              Log your daily check-in with selfie and work proof attachments. Complete check-out in the evening to calculate automatic working hours.
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-md border border-white/20 text-center shrink-0 min-w-[160px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-orange-200 font-mono">Today's Status</div>
            <div className="text-lg font-extrabold mt-1 font-display">
              {isCheckedOut ? "Checked Out" : isCheckedIn ? "Checked In" : "Not Checked In"}
            </div>
            {primaryRecord && (
              <div className="text-[11px] font-mono text-orange-100 mt-0.5">
                {isCheckedOut ? `Hrs: ${primaryRecord.working_hours || "Calculated"}` : `In: ${formatTime(primaryRecord.check_in)}`}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Check-In / Check-Out Tabs */}
      <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 font-display">
        <button
          onClick={() => setActiveTab("checkin")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold transition ${
            activeTab === "checkin"
              ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FiCamera className="h-4 w-4" /> 1. Morning Check-In
        </button>

        <button
          onClick={() => setActiveTab("checkout")}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-extrabold transition ${
            activeTab === "checkout"
              ? "bg-orange-600 text-white shadow-md shadow-orange-600/30"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FiLogOut className="h-4 w-4" /> 2. Evening Check-Out
        </button>
      </div>

      {/* 1. CHECK-IN SECTION */}
      {activeTab === "checkin" && (
        <div className="space-y-6">
          {isCheckedIn && (
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm font-sans">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                    <FiCheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-display">Active Workday Check-In ({todayRecords.length} Site Logs)</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      First check-in recorded at <strong className="text-orange-600 dark:text-orange-400 font-mono">{formatTime(todayRecords[todayRecords.length - 1]?.check_in)}</strong>. You can continuously log new site locations below.
                    </p>
                  </div>
                </div>

                {!isCheckedOut && (
                  <button
                    onClick={() => setActiveTab("checkout")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-orange-700 transition"
                  >
                    <FiLogOut /> Proceed to Check-Out
                  </button>
                )}
              </div>

              {/* Logged Sites */}
              <div className="grid gap-2 sm:grid-cols-2 text-xs font-mono">
                {todayRecords.map((rec, idx) => (
                  <div key={rec.id || idx} className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white font-sans block">{rec.location_name || "Work Site"}</span>
                      <span className="text-slate-400 text-[10px]">{formatTime(rec.check_in)}</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-500 font-sans px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 rounded-full border border-amber-200 dark:border-amber-800">
                      {rec.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleCheckInSubmit} className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                <FiPlusCircle className="text-orange-600 dark:text-orange-400" /> {isCheckedIn ? "Log New Worksite Location & Work Proof" : "Morning Check-In & Work Proof Submission"}
              </h2>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800 font-mono">
                {isCheckedIn ? "Location Update" : "Daily Check-In"}
              </span>
            </div>

              {/* Location Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Site / Office Location Name</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. San Francisco Tech Park HQ"
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none font-medium"
                />
              </div>

              {/* Geofence Banner */}
              {!isInsideGeofence && (
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
                  <FiAlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-300">
                    <span className="font-bold">Outside Geofence ({geofenceDistance}m away).</span> Submission will be flagged for Admin review.
                  </div>
                </div>
              )}

              {/* Map Preview */}
              {gpsLocation && (
                <InteractiveMap
                  latitude={gpsLocation.latitude}
                  longitude={gpsLocation.longitude}
                  address={address}
                  locationName={locationName}
                  isInsideGeofence={isInsideGeofence}
                  height="h-48"
                />
              )}

              {/* 1. Selfie Capture */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  1. Live Selfie Photo <span className="text-rose-500">*</span>
                </label>

                {cameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-orange-500 max-w-sm mx-auto shadow-lg">
                    <video ref={videoRef} autoPlay playsInline className="h-56 w-full object-cover" />
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="rounded-full bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-lg hover:bg-orange-700 transition"
                      >
                        Capture
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : capturedImage ? (
                  <div className="space-y-2 text-center">
                    <img src={capturedImage} alt="Selfie Preview" className="h-48 w-48 object-cover rounded-2xl mx-auto border-2 border-orange-500 shadow-md" />
                    <button
                      type="button"
                      onClick={startCamera}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition"
                    >
                      <FiRefreshCw /> Retake Photo
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition"
                    >
                      <FiCamera className="h-4 w-4" /> Open Camera & Capture Selfie
                    </button>
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition">
                      <FiUploadCloud className="h-4 w-4" /> Select File
                      <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleSelfieFileSelect} className="hidden" />
                    </label>
                  </div>
                )}
              </div>

              {/* 2. Work Photo Upload (Optional) */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FiImage className="text-orange-600" /> 2. Work Photo Attachment <span className="font-normal text-slate-400">(JPG, JPEG, PNG • Max 10 MB)</span>
                </label>

                {workPhotoPreview ? (
                  <div className="relative inline-block">
                    <img src={workPhotoPreview} alt="Work Photo Preview" className="h-36 w-auto object-cover rounded-2xl border border-orange-500 shadow-md" />
                    <button
                      type="button"
                      onClick={() => { setWorkPhotoFile(null); setWorkPhotoPreview(null); }}
                      className="absolute -top-2 -right-2 rounded-full bg-rose-600 text-white p-1 text-xs shadow hover:bg-rose-700"
                    >
                      <FiXCircle />
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 hover:border-orange-500 transition text-center">
                    <FiImage className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Work Photo</span>
                    <span className="text-[11px] text-slate-400 font-medium">Click to select photo proof</span>
                    <input type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleWorkPhotoChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* 3. Work Video Upload (Optional) */}
              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <FiFilm className="text-orange-600" /> 3. Work Completion Video <span className="font-normal text-slate-400">(MP4, MOV, WEBM • Max 100 MB)</span>
                </label>

                {workVideoPreview ? (
                  <div className="space-y-2">
                    <VideoPlayer src={workVideoPreview} className="max-w-md mx-auto" />
                    <button
                      type="button"
                      onClick={() => { setWorkVideoFile(null); setWorkVideoPreview(null); }}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 text-rose-500 px-3 py-1 text-xs font-bold border border-rose-500/30 hover:bg-rose-500/20"
                    >
                      <FiXCircle /> Remove Video
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-4 hover:border-orange-500 transition text-center">
                    <FiFilm className="h-6 w-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Upload Work Video</span>
                    <span className="text-[11px] text-slate-400 font-medium">Click to attach video proof</span>
                    <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={handleWorkVideoChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Progress Indicator */}
              {submitting && uploadProgress > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono font-bold text-orange-600">
                    <span>Uploading Work Proof...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-orange-600 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-orange-600 py-3.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 disabled:opacity-60 transition font-sans tracking-wide"
              >
                {submitting ? <LoadingSpinner size="sm" /> : isCheckedIn ? "Submit Site Location & Work Proof Update" : "Submit Morning Check-In & Work Proof"}
              </button>
              <canvas ref={canvasRef} className="hidden" />
            </form>
          </div>
        )}

      {/* 2. CHECK-OUT SECTION */}
      {activeTab === "checkout" && (
        <div className="space-y-6 font-sans">
          {!isCheckedIn ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-500 border border-rose-500/30">
                <FiXCircle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Cannot Check Out Without Check In</h2>
              <p className="text-xs text-slate-500 font-medium">Please complete your morning check-in first before submitting your evening check-out.</p>
              <button
                onClick={() => setActiveTab("checkin")}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-3 text-xs font-bold text-white shadow-md"
              >
                Go to Morning Check-In
              </button>
            </div>
          ) : isCheckedOut ? (
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                <FiCheckCircle className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Workday Completed & Checked Out</h2>
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 max-w-md mx-auto text-left text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Check-In Time:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{formatTime(primaryRecord.check_in)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Check-Out Time:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{formatTime(primaryRecord.check_out || primaryRecord.check_out_time)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-orange-600 font-bold">
                  <span>Total Working Hours:</span>
                  <span>{primaryRecord.working_hours || "Calculated"}</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCheckOutSubmit} className="rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                  <FiLogOut className="text-orange-600 dark:text-orange-400" /> Evening Check-Out & Workday Confirmation
                </h2>
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800 font-mono">
                  End Workday
                </span>
              </div>

              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">Active Check-In: {formatTime(primaryRecord.check_in)}</div>
                <div className="text-slate-500">Location: {primaryRecord.location_name}</div>
              </div>

              {/* Optional Checkout Photo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Optional Work Completion Photo <span className="font-normal text-slate-400">(JPG, PNG • Max 10 MB)</span>
                </label>
                {checkoutPhotoPreview ? (
                  <div className="relative inline-block">
                    <img src={checkoutPhotoPreview} alt="Checkout Photo" className="h-32 rounded-2xl border border-orange-500" />
                    <button type="button" onClick={() => setCheckoutPhotoPreview(null)} className="absolute -top-2 -right-2 bg-rose-600 text-white rounded-full p-1"><FiXCircle /></button>
                  </div>
                ) : (
                  <input type="file" accept="image/*" onChange={handleCheckoutPhotoChange} className="block text-xs text-slate-500" />
                )}
              </div>

              {/* Optional Checkout Video */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Optional Work Completion Video <span className="font-normal text-slate-400">(MP4, MOV, WEBM • Max 100 MB)</span>
                </label>
                {checkoutVideoPreview ? (
                  <VideoPlayer src={checkoutVideoPreview} className="max-w-sm mx-auto" />
                ) : (
                  <input type="file" accept="video/*" onChange={handleCheckoutVideoChange} className="block text-xs text-slate-500" />
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-orange-600 py-3.5 text-xs font-extrabold text-white shadow-md hover:bg-orange-700 transition"
              >
                {submitting ? <LoadingSpinner size="sm" /> : "Confirm & Submit Evening Check-Out"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Attendance;
