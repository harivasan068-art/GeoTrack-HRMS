import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBell,
  FiCalendar,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiMapPin,
  FiShield,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { attendanceService } from "../services/attendanceService";
import { getImageUrl } from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
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
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <img
            src={getImageUrl(user?.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
            alt={user?.full_name}
            className="h-16 w-16 object-cover rounded-2xl border-2 border-indigo-500 shadow-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
            }}
          />
          <div>
            <h1 className="text-2xl font-extrabold text-white">Welcome back, {user?.full_name}</h1>
            <p className="text-xs text-indigo-300 font-mono mt-0.5">
              ID: {user?.employee_id} &bull; {user?.designation} ({user?.department})
            </p>
          </div>
        </div>

        <Link
          to="/attendance"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition shrink-0"
        >
          <FiCamera /> Mark Live Attendance
        </Link>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today Check-In */}
        <div className="rounded-2xl bg-slate-900 p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Today's Check-In</span>
            <FiClock className="text-emerald-400 h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatTime(attendance?.check_in)}</div>
          <div className="text-[11px] text-slate-500 truncate">{attendance?.location_name || "No Check-in Recorded"}</div>
        </div>

        {/* Current Status */}
        <div className="rounded-2xl bg-slate-900 p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Approval Status</span>
            <FiShield className="text-indigo-400 h-4 w-4" />
          </div>
          <div className="text-xl font-bold text-white">
            {attendance?.status || "Not Submitted"}
          </div>
          <div className="text-[11px] text-slate-400">
            {attendance?.status === "Present" ? "Verified Present by Admin" : "Awaiting Admin Approval"}
          </div>
        </div>

        {/* Working Hours */}
        <div className="rounded-2xl bg-slate-900 p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Working Duration</span>
            <FiClock className="text-purple-400 h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-purple-300">{getWorkingHours()}</div>
          <div className="text-[11px] text-slate-500">Live duration timer today</div>
        </div>

        {/* Monthly Approved Attendance */}
        <div className="rounded-2xl bg-slate-900 p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>Monthly Approved Days</span>
            <FiCalendar className="text-amber-400 h-4 w-4" />
          </div>
          <div className="text-2xl font-bold text-amber-300">{presentDays} Days</div>
          <div className="text-[11px] text-slate-500">Verified attendance logs</div>
        </div>
      </div>

      {/* Notifications & Calendar Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Quick Actions */}
        <div className="rounded-2xl bg-slate-900 p-6 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <FiClock className="text-indigo-400" /> Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              to="/attendance"
              className="flex items-center justify-between rounded-xl bg-slate-950 p-3.5 border border-slate-800 hover:border-indigo-500/50 transition text-xs font-semibold text-white"
            >
              <span className="flex items-center gap-2">
                <FiCamera className="text-indigo-400" /> Geotag Photo Check-In
              </span>
              <FiArrowRight className="text-slate-500" />
            </Link>

            <Link
              to="/profile"
              className="flex items-center justify-between rounded-xl bg-slate-950 p-3.5 border border-slate-800 hover:border-indigo-500/50 transition text-xs font-semibold text-white"
            >
              <span className="flex items-center gap-2">
                <FiCreditCard className="text-purple-400" /> View Digital ID Card
              </span>
              <FiArrowRight className="text-slate-500" />
            </Link>

            <Link
              to="/attendance/history"
              className="flex items-center justify-between rounded-xl bg-slate-950 p-3.5 border border-slate-800 hover:border-indigo-500/50 transition text-xs font-semibold text-white"
            >
              <span className="flex items-center gap-2">
                <FiCalendar className="text-amber-400" /> Attendance Log History
              </span>
              <FiArrowRight className="text-slate-500" />
            </Link>
          </div>
        </div>

        {/* Recent Attendance Activity */}
        <div className="md:col-span-2 rounded-2xl bg-slate-900 p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FiCalendar className="text-purple-400" /> Recent Attendance History
            </h3>
            <Link to="/attendance/history" className="text-xs text-indigo-400 hover:underline">
              View All Logs &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-[11px] uppercase text-slate-400">
                <tr>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Check-In</th>
                  <th className="pb-3">Location Site</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.slice(0, 5).map((row) => (
                  <tr key={row.id}>
                    <td className="py-3 font-semibold text-white">{row.date}</td>
                    <td className="py-3 text-emerald-400">{formatTime(row.check_in)}</td>
                    <td className="py-3 text-slate-400 max-w-xs truncate">{row.location_name || "Office Site"}</td>
                    <td className="py-3 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 font-bold ${
                        row.status === "Present"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : row.status === "Absent"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
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
