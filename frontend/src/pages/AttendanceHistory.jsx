import { useEffect, useState } from "react";
import { FiCalendar, FiClock, FiMapPin, FiFilter, FiImage, FiFilm, FiMaximize2 } from "react-icons/fi";
import LoadingSpinner from "../components/LoadingSpinner";
import VideoPlayer from "../components/VideoPlayer";
import ImageLightboxModal from "../components/ImageLightboxModal";
import { attendanceService } from "../services/attendanceService";
import { getImageUrl } from "../services/api";

const AttendanceHistory = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ start_date: "", end_date: "" });

  // Lightbox Modal state
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      const data = await attendanceService.getHistory(params);
      setRecords(Array.isArray(data) ? data : []);
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
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const openLightboxForRecord = (record, targetUrl) => {
    const list = [];
    const selfie = record.selfie_url || record.photo_url;
    if (selfie && getImageUrl(selfie)) {
      list.push({ url: selfie, title: `${formatDate(record.date)} - Check-In Selfie` });
    }
    if (record.work_photo_url && getImageUrl(record.work_photo_url)) {
      list.push({ url: record.work_photo_url, title: `${formatDate(record.date)} - Work Photo` });
    }
    if (record.checkout_selfie_url && getImageUrl(record.checkout_selfie_url)) {
      list.push({ url: record.checkout_selfie_url, title: `${formatDate(record.date)} - Checkout Selfie` });
    }
    if (record.checkout_work_photo_url && getImageUrl(record.checkout_work_photo_url)) {
      list.push({ url: record.checkout_work_photo_url, title: `${formatDate(record.date)} - Checkout Photo` });
    }

    if (list.length === 0) return;

    let targetIndex = list.findIndex((item) => item.url === targetUrl);
    if (targetIndex < 0) targetIndex = 0;

    setLightboxImages(list);
    setLightboxIndex(targetIndex);
    setIsLightboxOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 font-sans">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
          <FiCalendar className="text-orange-600 dark:text-orange-400" /> My Attendance & Workday History
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          View your check-in logs, check-out times, calculated working hours, and attached work proofs.
        </p>
      </div>

      <form onSubmit={handleFilter} className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            Start Date
          </label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium font-mono min-h-[44px]"
          />
        </div>
        <div className="flex-1">
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            End Date
          </label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium font-mono min-h-[44px]"
          />
        </div>
        <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition min-h-[44px]">
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
            <div key={record.id} className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
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
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-500 font-sans block font-bold text-[10px]">Check-In Time:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatTime(record.check_in_time || record.check_in)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans block font-bold text-[10px]">Check-Out Time:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatTime(record.check_out_time || record.check_out)}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-sans block font-bold text-[10px]">Working Hours:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">{record.working_hours || (record.check_out ? "Completed" : "In Progress")}</span>
                </div>
              </div>

              {/* Remarks / Notes */}
              {(record.admin_notes || record.remarks) && (
                <div className="text-xs text-slate-600 dark:text-slate-400 font-sans bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <strong className="font-bold text-slate-800 dark:text-slate-200">Admin Remarks:</strong> {record.admin_notes || record.remarks}
                </div>
              )}

              {/* Proof Files Preview Gallery (All 6 fields) */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300 font-display block">Workday Media Proofs:</span>
                <div className="grid gap-3 grid-cols-2 sm:grid-cols-3">
                  {/* 1. Check-In Selfie */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Check-In Selfie</span>
                    {getImageUrl(record.selfie_url || record.photo_url) ? (
                      <div className="relative group">
                        <img
                          src={getImageUrl(record.selfie_url || record.photo_url)}
                          alt="Check-In Selfie"
                          onClick={() => openLightboxForRecord(record, record.selfie_url || record.photo_url)}
                          className="h-24 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition"
                        />
                        <button
                          type="button"
                          onClick={() => openLightboxForRecord(record, record.selfie_url || record.photo_url)}
                          className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-lg text-[10px]"
                        >
                          <FiMaximize2 />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                        <FiImage className="h-4 w-4 mb-0.5 opacity-50" />
                        <span className="text-[10px]">No Photo Uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* 2. Check-In Work Photo */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Check-In Work Photo</span>
                    {getImageUrl(record.work_photo_url) ? (
                      <div className="relative group">
                        <img
                          src={getImageUrl(record.work_photo_url)}
                          alt="Work Photo"
                          onClick={() => openLightboxForRecord(record, record.work_photo_url)}
                          className="h-24 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition"
                        />
                        <button
                          type="button"
                          onClick={() => openLightboxForRecord(record, record.work_photo_url)}
                          className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-lg text-[10px]"
                        >
                          <FiMaximize2 />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                        <FiImage className="h-4 w-4 mb-0.5 opacity-50" />
                        <span className="text-[10px]">No Photo Uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* 3. Checkout Selfie */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Checkout Selfie</span>
                    {getImageUrl(record.checkout_selfie_url) ? (
                      <div className="relative group">
                        <img
                          src={getImageUrl(record.checkout_selfie_url)}
                          alt="Checkout Selfie"
                          onClick={() => openLightboxForRecord(record, record.checkout_selfie_url)}
                          className="h-24 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition"
                        />
                        <button
                          type="button"
                          onClick={() => openLightboxForRecord(record, record.checkout_selfie_url)}
                          className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-lg text-[10px]"
                        >
                          <FiMaximize2 />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                        <FiImage className="h-4 w-4 mb-0.5 opacity-50" />
                        <span className="text-[10px]">No Photo Uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* 4. Checkout Work Photo */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Checkout Work Photo</span>
                    {getImageUrl(record.checkout_work_photo_url) ? (
                      <div className="relative group">
                        <img
                          src={getImageUrl(record.checkout_work_photo_url)}
                          alt="Checkout Photo"
                          onClick={() => openLightboxForRecord(record, record.checkout_work_photo_url)}
                          className="h-24 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-90 transition"
                        />
                        <button
                          type="button"
                          onClick={() => openLightboxForRecord(record, record.checkout_work_photo_url)}
                          className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-lg text-[10px]"
                        >
                          <FiMaximize2 />
                        </button>
                      </div>
                    ) : (
                      <div className="h-24 w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                        <FiImage className="h-4 w-4 mb-0.5 opacity-50" />
                        <span className="text-[10px]">No Photo Uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* 5. Check-In Work Video */}
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Check-In Work Video</span>
                    {getImageUrl(record.work_video_url) ? (
                      <VideoPlayer src={record.work_video_url} className="w-full" />
                    ) : (
                      <div className="h-24 w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                        <FiFilm className="h-4 w-4 mb-0.5 opacity-50 text-orange-500" />
                        <span className="text-[10px]">No Video Uploaded</span>
                      </div>
                    )}
                  </div>

                  {/* 6. Checkout Work Video */}
                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Checkout Work Video</span>
                    {getImageUrl(record.checkout_work_video_url) ? (
                      <VideoPlayer src={record.checkout_work_video_url} className="w-full" />
                    ) : (
                      <div className="h-24 w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                        <FiFilm className="h-4 w-4 mb-0.5 opacity-50 text-orange-500" />
                        <span className="text-[10px]">No Video Uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Lightbox Preview Modal */}
      {isLightboxOpen && (
        <ImageLightboxModal
          images={lightboxImages}
          currentIndex={lightboxIndex}
          onClose={() => setIsLightboxOpen(false)}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}
    </div>
  );
};

export default AttendanceHistory;
