import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
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
    <div>
      <div className="mb-8">
        <h1 className="page-title">Attendance History</h1>
        <p className="page-subtitle">View your past attendance records</p>
      </div>

      <form onSubmit={handleFilter} className="card mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Start Date
          </label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            End Date
          </label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="input-field"
          />
        </div>
        <button type="submit" className="btn-primary">
          Filter
        </button>
      </form>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : records.length === 0 ? (
        <div className="card text-center">
          <FiCalendar className="mx-auto mb-3 h-12 w-12 text-slate-300" />
          <p className="text-slate-500">No attendance records found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((record) => (
            <div key={record.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{formatDate(record.date)}</p>
                  {record.location_name && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <FiMapPin className="h-3 w-3" />
                      {record.location_name}
                    </div>
                  )}
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <FiClock className="h-3 w-3" />
                      Check In
                    </div>
                    <p className="font-semibold text-green-700">{formatTime(record.check_in)}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <FiClock className="h-3 w-3" />
                      Check Out
                    </div>
                    <p className="font-semibold text-red-700">{formatTime(record.check_out)}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    record.check_out
                      ? "bg-green-100 text-green-700"
                      : record.check_in
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {record.check_out ? "Complete" : record.check_in ? "Partial" : "Absent"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
