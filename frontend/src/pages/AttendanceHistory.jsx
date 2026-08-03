import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiFilter,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiXCircle,
  FiDownload,
} from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import WorkProofSection from "../components/WorkProofSection";
import { attendanceService } from "../services/attendanceService";
import { getImageUrl } from "../services/api";
import toast from "react-hot-toast";

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filters, setFilters] = useState({ start_date: "", end_date: "" });

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      const data = await attendanceService.getHistory(params);
      setRecords(data || []);
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

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--:--";
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

  const downloadPhoto = async (photoUrl, dateStr) => {
    try {
      const fullUrl = getImageUrl(photoUrl);
      if (!fullUrl) return;
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

      toast.success("Selfie proof downloaded!");
    } catch {
      toast.error("Download failed");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans pb-16">
      {/* Title Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
          <FiCalendar className="text-orange-600 dark:text-orange-400" /> Attendance History Cards
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          View and tap individual log cards to inspect site check-in details & work proofs.
        </p>
      </div>

      {/* Date Filter Form */}
      <form onSubmit={handleFilter} className="rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="mb-1 block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider">
            Start Date
          </label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider">
            End Date
          </label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium"
          />
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3.5 min-h-[48px] text-xs font-extrabold text-white shadow-md hover:from-orange-500 hover:to-amber-500 transition active:scale-95"
        >
          <FiFilter className="h-4 w-4" /> Filter Logs
        </button>
      </form>

      {/* Content Container */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <FiCalendar className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-extrabold text-slate-500 dark:text-slate-400">No attendance records found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            const isExpanded = expandedId === record.id;
            return (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-orange-400/50 transition-all"
              >
                {/* Card Main Bar */}
                <div
                  onClick={() => toggleExpand(record.id)}
                  className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
                      <FiClock className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white font-display">
                        {formatDate(record.date || record.check_in)}
                      </h3>
                      {record.location_name && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                          <FiMapPin className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                          {record.location_name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex gap-4 text-xs font-mono">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans font-bold">Check-In</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatTime(record.check_in)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-sans font-bold">Check-Out</span>
                        <span className="font-bold text-rose-600 dark:text-rose-400">{formatTime(record.check_out)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-extrabold border ${
                          record.status === "Present"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : record.status === "Absent"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {record.status || (record.check_out ? "Complete" : "Pending")}
                      </span>

                      <div className="rounded-xl p-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {isExpanded ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expandable Details Sheet */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 dark:border-slate-800 p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-950/50 space-y-4"
                    >
                      <div className="grid gap-3 sm:grid-cols-2 text-xs">
                        <div>
                          <span className="text-slate-500 font-bold">GPS Verified Address:</span>
                          <p className="font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                            {record.address || record.location_name || "Location verified"}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-500 font-bold">Coordinates:</span>
                          <p className="font-mono font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                            {record.latitude?.toFixed(4)}, {record.longitude?.toFixed(4)}
                          </p>
                        </div>
                      </div>

                      {record.photo_url && (
                        <div className="flex items-center gap-4 pt-2">
                          <img
                            src={getImageUrl(record.photo_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80"}
                            alt="Selfie"
                            className="h-20 w-20 object-cover rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
                          />
                          <button
                            onClick={() => downloadPhoto(record.photo_url, record.date)}
                            className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 px-4 py-2.5 min-h-[44px] text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-orange-600 hover:text-white transition"
                          >
                            <FiDownload className="h-4 w-4" /> Download Selfie
                          </button>
                        </div>
                      )}

                      <WorkProofSection attendanceId={record.id} isReadOnly={true} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttendanceHistory;
