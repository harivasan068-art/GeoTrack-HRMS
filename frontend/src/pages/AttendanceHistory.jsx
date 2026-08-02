import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiMapPin, FiFilter, FiImage, FiFilm } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import VideoPlayer from "../components/VideoPlayer";
import { attendanceService } from "../services/attendanceService";
import { getImageUrl } from "../services/api";

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ start_date: "", end_date: "" });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      const data = await attendanceService.getHistory(params);
      setRecords(data);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
          <FiCalendar className="text-orange-600 dark:text-orange-400" /> My Attendance & Workday History
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
          View your check-in logs, check-out times, calculated working hours, and attached work proofs.
        </p>
      </div>

      <form onSubmit={handleFilter} className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            Start Date
          </label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium font-mono"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            End Date
          </label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium font-mono"
          />
        </div>
        <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition">
          <FiFilter /> Filter Records
        </button>
      </form>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 text-center border border-slate-200 dark:border-slate-800 shadow-sm">
          <FiCalendar className="mx-auto mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No attendance records found for selected dates</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div>
                  <p className="font-extrabold text-sm text-slate-900 dark:text-white font-display">{formatDate(record.date)}</p>
                  {record.location_name && (
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <FiMapPin className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                      {record.location_name}
                    </div>
                  )}
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-extrabold border ${
                    record.status === "Present"
                      ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : record.status === "Absent"
                      ? "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800"
                      : "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                  }`}
                >
                  {record.status || "Pending Approval"}
                </span>
              </div>

              {/* Timestamps & Hours */}
              <div className="grid gap-4 sm:grid-cols-3 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 font-sans block font-bold">Check-In Time:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatTime(record.check_in_time || record.check_in)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans block font-bold">Check-Out Time:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatTime(record.check_out_time || record.check_out)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans block font-bold">Total Working Hours:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">{record.working_hours || (record.check_out ? "Completed" : "In Progress")}</span>
                </div>
              </div>

              {/* Proof Files Preview */}
              {(record.photo_url || record.work_photo_url || record.work_video_url) && (
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 font-display">Attached Work Proofs:</span>
                  <div className="flex flex-wrap gap-4">
                    {record.photo_url && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold block">Selfie</span>
                        <img src={getImageUrl(record.photo_url)} alt="Selfie" className="h-20 w-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                      </div>
                    )}
                    {record.work_photo_url && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold block">Work Photo</span>
                        <img src={getImageUrl(record.work_photo_url)} alt="Work Photo" className="h-20 w-20 object-cover rounded-xl border border-slate-200 dark:border-slate-700" />
                      </div>
                    )}
                    {record.work_video_url && (
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-bold block flex items-center gap-1"><FiFilm className="text-orange-600" /> Work Video</span>
                        <VideoPlayer src={record.work_video_url} className="max-w-xs" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
