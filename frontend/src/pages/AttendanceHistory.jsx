import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiMapPin, FiFilter } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import WorkProofSection from "../components/WorkProofSection";
import { attendanceService } from "../services/attendanceService";

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
          <FiCalendar className="text-orange-600 dark:text-orange-400" /> Attendance Log History
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">View and filter your complete site check-in logs</p>
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
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium"
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
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium"
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
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No attendance records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <div key={record.id} className="rounded-2xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-orange-300 transition">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-extrabold text-xs text-slate-900 dark:text-white font-display">{formatDate(record.date)}</p>
                  {record.location_name && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      <FiMapPin className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                      {record.location_name}
                    </div>
                  )}
                </div>
                <div className="flex gap-6 text-xs">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <FiClock className="h-3 w-3" />
                      Check In
                    </div>
                    <p className="font-mono font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{formatTime(record.check_in)}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                      <FiClock className="h-3 w-3" />
                      Check Out
                    </div>
                    <p className="font-mono font-bold text-rose-700 dark:text-rose-300 mt-0.5">{formatTime(record.check_out)}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-extrabold border ${
                    record.check_out
                      ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                      : record.check_in
                      ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  {record.check_out ? "Complete" : record.check_in ? "Partial" : "Absent"}
                </span>
              </div>

              {/* Work Proof Module */}
              <WorkProofSection attendanceId={record.id} isReadOnly={true} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
