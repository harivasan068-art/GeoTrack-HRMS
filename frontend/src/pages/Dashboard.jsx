import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
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
        console.warn(e);
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
    if (!dateStr) return "Not yet";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
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

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const presentDays = history.filter((h) => h.status === "Present").length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Real-Time GPS Location Status Banner */}
      {location ? (
        <div className="relative overflow-hidden rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-md shadow-emerald-500/20 shrink-0">
                <FiMapPin className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs tracking-wide text-emerald-800 uppercase">GPS Location Verified</span>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
                <p className="text-xs text-slate-700 font-medium line-clamp-1 mt-0.5">{location.location_name}</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-sm shrink-0">
              📍 {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-amber-50/80 p-4 border border-amber-200 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20 shrink-0">
                <FiAlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-extrabold text-xs text-amber-900 uppercase tracking-wide">GPS Permission Required</p>
                <p className="text-xs text-amber-800/80 mt-0.5">
                  {geoError || "Enable GPS location access to mark site geotagged attendance."}
                </p>
              </div>
            </div>
            <button
              onClick={() => getLocation && getLocation()}
              disabled={geoLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-amber-500/20 hover:scale-[1.02] transition shrink-0"
            >
              {geoLoading ? <FiRefreshCw className="h-4 w-4 animate-spin" /> : <FiMapPin className="h-4 w-4" />}
              {geoLoading ? "Detecting GPS..." : "Enable GPS Location"}
            </button>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 sm:p-8 text-white shadow-xl shadow-orange-600/10">
        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={getImageUrl(user?.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                alt={user?.full_name}
                className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-2xl border-2 border-white/80 shadow-xl ring-4 ring-white/20 shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                }}
              />
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center text-[10px] text-slate-900 font-black">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-orange-100 uppercase tracking-wider">{getGreeting()} 👋</span>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold text-white backdrop-blur-md font-mono">
                  {user?.department || "Operations"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5 font-display">{user?.full_name}</h1>
              <p className="text-xs text-orange-100 font-mono mt-1 flex items-center gap-2">
                <span>ID: <strong className="text-white">{user?.employee_id}</strong></span>
                <span>&bull;</span>
                <span>{user?.designation}</span>
              </p>
            </div>
          </div>

          <Link
            to="/attendance"
            className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-white px-6 py-4 text-xs font-black text-orange-700 shadow-xl hover:bg-slate-50 hover:scale-[1.02] transition shrink-0 w-full sm:w-auto text-center tracking-wide font-sans"
          >
            <FiCamera className="h-4 w-4 text-orange-600" /> Mark Live Attendance
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid - Light Corporate Theme */}
      <div className="grid gap-4 sm:gap-6 grid-cols-2 lg:grid-cols-4 font-sans">
        {/* Card 1: Today Check-In */}
        <div className="group rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 transition-all duration-300 shadow-sm hover:shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Check-In</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center group-hover:scale-110 transition">
              <FiClock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono">{formatTime(attendance?.check_in)}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1 font-medium">{attendance?.location_name || "No check-in today"}</p>
          </div>
        </div>

        {/* Card 2: Current Status */}
        <div className="group rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Approval Status</span>
            <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800 flex items-center justify-center group-hover:scale-110 transition">
              <FiShield className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate tracking-tight font-display">
              {attendance?.status || "Not Submitted"}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1 font-medium">
              {attendance?.status === "Present" ? "Verified Present" : "Awaiting HR Review"}
            </p>
          </div>
        </div>

        {/* Card 3: Working Duration */}
        <div className="group rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 hover:border-amber-300 transition-all duration-300 shadow-sm hover:shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Working Hours</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800 flex items-center justify-center group-hover:scale-110 transition">
              <FiZap className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight font-mono">{getWorkingHours()}</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1 font-medium">Live duration timer today</p>
          </div>
        </div>

        {/* Card 4: Monthly Approved Days */}
        <div className="group rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200/80 dark:border-slate-800 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Approved</span>
            <div className="h-9 w-9 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-100 dark:border-orange-800 flex items-center justify-center group-hover:scale-110 transition">
              <FiAward className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-orange-600 dark:text-orange-400 tracking-tight font-display">{presentDays} Days</div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1 font-medium">Verified attendance logs</p>
          </div>
        </div>
      </div>

      {/* Quick Action Hub & Recent Activity Grid */}
      <div className="grid gap-6 md:grid-cols-3 font-sans">
        {/* Action Hub */}
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-display">
            <FiZap className="text-orange-600 dark:text-orange-400" /> Action Hub
          </h3>
          <div className="space-y-3">
            <Link
              to="/attendance"
              className="group flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/80 dark:border-slate-800 hover:border-orange-300 hover:bg-orange-50/40 transition-all duration-300 text-xs font-bold text-slate-900 dark:text-white shadow-sm"
            >
              <span className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition">
                  <FiCamera />
                </div>
                Geotag Photo Check-In
              </span>
              <FiArrowRight className="text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/profile"
              className="group flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/80 dark:border-slate-800 hover:border-orange-300 hover:bg-orange-50/40 transition-all duration-300 text-xs font-bold text-slate-900 dark:text-white shadow-sm"
            >
              <span className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-110 transition">
                  <FiCreditCard />
                </div>
                View Digital ID Card
              </span>
              <FiArrowRight className="text-slate-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/attendance/history"
              className="group flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200/80 dark:border-slate-800 hover:border-amber-300 hover:bg-amber-50/40 transition-all duration-300 text-xs font-bold text-slate-900 dark:text-white shadow-sm"
            >
              <span className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
                  <FiCalendar />
                </div>
                Attendance History
              </span>
              <FiArrowRight className="text-slate-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="md:col-span-2 rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-display">
              <FiCalendar className="text-orange-600 dark:text-orange-400" /> Recent Attendance Activity
            </h3>
            <Link to="/attendance/history" className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 font-bold hover:underline flex items-center gap-1">
              View All Logs &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 min-w-[340px]">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-[11px] uppercase font-bold text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Check-In Time</th>
                  <th className="p-3.5">Location Site</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium bg-white dark:bg-slate-900">
                {history.slice(0, 5).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{row.date}</td>
                    <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold">{formatTime(row.check_in)}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate">{row.location_name || "Office Site"}</td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-block rounded-full px-3 py-1 text-[10px] font-extrabold ${
                        row.status === "Present"
                          ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : row.status === "Absent"
                          ? "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          : "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
