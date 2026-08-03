import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiAward,
  FiCalendar,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiRefreshCw,
  FiShield,
  FiUserCheck,
  FiZap,
} from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { attendanceService } from "../services/attendanceService";
import { getImageUrl } from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const outletContext = useOutletContext() || {};
  const { location, geoLoading, geoError, getLocation } = outletContext;

  const [attendance, setAttendance] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todayData, histData] = await Promise.all([
          attendanceService.getTodayAttendance(),
          attendanceService.getHistory(),
        ]);
        setAttendance(Array.isArray(todayData) ? (todayData.length > 0 ? todayData[0] : null) : todayData);
        setHistory(histData || []);
      } catch (e) {
        console.warn("Dashboard fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--:--";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getWorkingHours = () => {
    if (!attendance?.check_in) return "0h 0m";
    const start = new Date(attendance.check_in);
    const end = attendance.check_out ? new Date(attendance.check_out) : new Date();
    const diffMs = Math.max(end - start, 0);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const formattedTodayDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const presentDays = history.filter((h) => h.status === "Present").length;
  const pendingDays = history.filter((h) => h.status === "Pending" || !h.status).length;

  return (
    <div className="space-y-6 font-sans pb-6">
      {/* Top Header / Greeting Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 sm:p-8 text-white shadow-xl shadow-orange-600/15 relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-12 h-56 w-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={getImageUrl(user?.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
              alt={user?.full_name}
              className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-2xl border-2 border-white/80 shadow-2xl ring-4 ring-white/20 shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-orange-100 uppercase tracking-wider font-mono">
                  {getGreeting()} 👋
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white font-display leading-tight">
                {user?.full_name || "Employee"}
              </h1>
              <p className="text-xs text-white/80 font-medium mt-0.5">
                {user?.designation || "Staff"} &bull; {user?.department || "Department"}
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-white/20 pt-3 sm:pt-0">
            <span className="text-xs text-orange-100 font-mono font-bold">Today</span>
            <span className="text-xs sm:text-sm font-extrabold text-white font-display bg-white/10 px-3 py-1 rounded-xl backdrop-blur-md">
              {formattedTodayDate}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Real-Time GPS Location Status Banner */}
      {location ? (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 p-4 border border-emerald-200 dark:border-emerald-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shrink-0">
              <FiMapPin className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300 uppercase font-mono">GPS Verified</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium line-clamp-1 mt-0.5">{location.location_name}</p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shrink-0">
            📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
          </span>
        </div>
      ) : (
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-4 border border-amber-200 dark:border-amber-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shrink-0">
              <FiAlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs text-amber-900 dark:text-amber-300 uppercase font-mono">GPS Required</p>
              <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-0.5">
                {geoError || "Enable GPS location access to mark site geotagged check-in."}
              </p>
            </div>
          </div>
          <button
            onClick={() => getLocation && getLocation()}
            disabled={geoLoading}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-4 py-2.5 min-h-[44px] text-xs font-bold text-white shadow hover:bg-amber-700 transition shrink-0"
          >
            {geoLoading ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiMapPin className="h-4 w-4" />}
            {geoLoading ? "Detecting GPS..." : "Enable GPS"}
          </button>
        </div>
      )}

      {/* Quick Stats Cards Grid (2x2 Mobile, 4 Columns Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Today's Status */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Today Status</span>
            <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <FiUserCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-display truncate">
            {attendance?.status === "Present" ? (
              <span className="text-emerald-600 dark:text-emerald-400">Present</span>
            ) : attendance?.status === "Pending" || (attendance?.check_in && !attendance?.status) ? (
              <span className="text-amber-600 dark:text-amber-400">Checked In</span>
            ) : (
              <span className="text-slate-400">Not Checked In</span>
            )}
          </p>
          <p className="text-[10px] text-slate-500 font-medium truncate">
            {attendance?.location_name || "Continuous Check-In"}
          </p>
        </div>

        {/* Card 2: Check-in Time */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Check-in</span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FiClock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-mono">
            {formatTime(attendance?.check_in)}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">First site arrival</p>
        </div>

        {/* Card 3: Check-out Time */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Check-out</span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <FiClock className="h-4 w-4" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-mono">
            {formatTime(attendance?.check_out)}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">Site departure</p>
        </div>

        {/* Card 4: Working Hours */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Working Hours</span>
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FiZap className="h-4 w-4" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white font-mono">
            {getWorkingHours()}
          </p>
          <p className="text-[10px] text-slate-500 font-medium">Elapsed site time</p>
        </div>
      </div>

      {/* Quick Action Large Colorful Touch Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
          Quick Actions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <Link to="/attendance">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 p-5 text-white shadow-lg shadow-orange-600/20 flex items-center justify-between min-h-[72px]"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                  <FiCamera className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base font-display">Mark Site Attendance</h3>
                  <p className="text-xs text-white/80 font-medium">Geotagged selfie check-in</p>
                </div>
              </div>
              <FiArrowRight className="h-6 w-6" />
            </motion.div>
          </Link>

          <Link to="/attendance/history">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-3xl bg-slate-900 dark:bg-slate-900 p-5 text-white border border-slate-800 shadow-lg flex items-center justify-between min-h-[72px]"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <FiCalendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base font-display">Attendance History</h3>
                  <p className="text-xs text-slate-400 font-medium">View past site visit logs</p>
                </div>
              </div>
              <FiArrowRight className="h-6 w-6 text-slate-400" />
            </motion.div>
          </Link>

          <Link to="/profile">
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-3xl bg-white dark:bg-slate-900 p-5 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between min-h-[72px]"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                  <FiCreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base font-display">Digital ID Card</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Scan QR code & print ID</p>
                </div>
              </div>
              <FiArrowRight className="h-6 w-6 text-slate-400" />
            </motion.div>
          </Link>

          <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between min-h-[72px]">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <FiAward className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base font-display">Approved Days</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{presentDays} days verified by Admin</p>
              </div>
            </div>
            <span className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{presentDays}d</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
