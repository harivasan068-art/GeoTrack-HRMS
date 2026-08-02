import { useEffect, useRef, useState } from "react";
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
} from "react-icons/fi";
import InteractiveMap from "../components/InteractiveMap";
import LoadingSpinner from "../components/LoadingSpinner";
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

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { getLocation, loading: geoLoading } = useGeolocation();

  const fetchToday = async () => {
    try {
      const data = await attendanceService.getTodayAttendance();
      // data is an array of today's customer site check-in submissions
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
    } catch (error) {
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
    } catch (e) {
      toast.error("Location permission required for GPS attendance");
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
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
        setSelectedFile(file);
        setCapturedImage(URL.createObjectURL(blob));
        stopCamera();
        toast.success("Live selfie captured!");
      }
    }, "image/jpeg");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setCapturedImage(URL.createObjectURL(file));
      stopCamera();
    }
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
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

      const result = await attendanceService.submitGeotagPhoto(formData);
      toast.success("Site check-in submitted! Status: Pending Admin Approval");

      // Reset form states for next site visit
      setCapturedImage(null);
      setSelectedFile(null);
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
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
          <FiCheckCircle /> Marked Present by Admin
        </span>
      );
    }
    if (status === "Absent") {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
          <FiXCircle /> Marked Absent by Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
        <FiClock className="animate-spin" /> Pending Admin Approval
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
          <FiCamera className="text-orange-600 dark:text-orange-400" /> Continuous Field Geotag Check-Ins
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-medium">
          Submit location check-ins continuously for customer requests throughout the day. All submissions are sent to Admin for verification.
        </p>
      </div>

      {/* Geotag Submission Form */}
      <form onSubmit={handleSubmitAttendance} className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm dark:shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <FiPlusCircle className="text-orange-600 dark:text-orange-400" /> Mark New Customer Location Check-In
          </h2>
          <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 px-3 py-1 rounded-full border border-orange-200 dark:border-orange-800 font-mono">
            Continuous Site Visit Tracker
          </span>
        </div>

        {/* Location Name Customization */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Customer / Site Name</label>
          <input
            type="text"
            required
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Client Site Visit - Zenith Corp"
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
          />
        </div>

        {/* Geofence Warning Banner */}
        {!isInsideGeofence && (
          <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/30 p-4 border border-amber-200 dark:border-amber-800 flex items-start gap-3 font-sans">
            <FiAlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold text-amber-800 dark:text-amber-300">You are outside the main office geofence ({geofenceDistance}m away).</div>
              <div className="text-amber-700 dark:text-amber-200/80 mt-0.5 font-medium">
                Your customer site check-in will be flagged as <strong>'Outside Allowed Zone'</strong> for Admin review.
              </div>
            </div>
          </div>
        )}

        {/* Map Preview Component */}
        {gpsLocation && (
          <InteractiveMap
            latitude={gpsLocation.latitude}
            longitude={gpsLocation.longitude}
            address={address}
            locationName={locationName}
            isInsideGeofence={isInsideGeofence}
            height="h-52"
          />
        )}

        {/* Live Camera Viewfinder & Selfie Capture */}
        <div className="space-y-3 font-sans">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Capture Site Live Selfie</label>

          {cameraActive ? (
            <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-orange-500 max-w-sm mx-auto shadow-lg">
              <video ref={videoRef} autoPlay playsInline className="h-64 w-full object-cover" />
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={capturePhoto}
                  className="rounded-full bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-orange-700 transition"
                >
                  Take Photo
                </button>
                <button
                  type="button"
                  onClick={stopCamera}
                  className="rounded-full bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : capturedImage ? (
            <div className="space-y-3 text-center">
              <img src={capturedImage} alt="Captured Selfie" className="h-56 w-56 object-cover rounded-2xl mx-auto border-2 border-orange-500 shadow-md" />
              <button
                type="button"
                onClick={startCamera}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <FiRefreshCw /> Retake Photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-xs font-bold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 transition"
            >
              <FiCamera className="h-4 w-4" /> Open Camera & Capture Photo
            </button>
          )}
        </div>

        {/* Submit Attendance Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-orange-600 py-3.5 text-xs font-extrabold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 transition disabled:opacity-60 font-sans tracking-wide"
        >
          {submitting ? <LoadingSpinner size="sm" /> : "Submit Customer Site Check-In"}
        </button>
        <canvas ref={canvasRef} className="hidden" />
      </form>

      {/* List of Today's Submitted Site Visits */}
      {todayRecords.length > 0 && (
        <div className="space-y-4 font-sans">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <FiClock className="text-orange-600 dark:text-orange-400" /> Today's Submitted Site Check-Ins ({todayRecords.length})
          </h2>

          <div className="space-y-4">
            {todayRecords.map((att) => (
              <div key={att.id} className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-bold text-orange-600 dark:text-orange-400 font-display">{att.location_name || "Customer Site"}</span>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">Submitted at: {formatTime(att.check_in)}</div>
                  </div>
                  {getStatusBadge(att.status)}
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">GPS Address:</span>
                    <div className="font-bold text-slate-900 dark:text-slate-200 mt-0.5 flex items-center gap-1">
                      <FiMapPin className="text-orange-600 dark:text-orange-400 shrink-0" /> {att.address || att.location_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Coordinates:</span>
                    <div className="font-mono text-orange-600 dark:text-orange-400 font-bold mt-0.5">
                      {att.latitude?.toFixed(4)}, {att.longitude?.toFixed(4)}
                    </div>
                  </div>
                </div>

                {att.photo_url && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4">
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
                        onClick={() => downloadPhoto(att.photo_url, att.date)}
                        className="absolute bottom-1 right-1 rounded-lg bg-slate-900/90 p-1.5 text-xs text-white border border-slate-700 shadow hover:bg-orange-600 transition"
                        title="Download selfie photo"
                      >
                        <FiDownload className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {att.remarks && (
                      <div className="text-xs bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1">
                        <span className="text-slate-500 dark:text-slate-400 block font-bold mb-1">Admin Remarks:</span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium">{att.remarks}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
