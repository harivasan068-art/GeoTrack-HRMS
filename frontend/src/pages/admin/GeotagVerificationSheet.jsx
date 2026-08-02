import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiAlertTriangle,
  FiCamera,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiEye,
  FiFilm,
  FiFilter,
  FiGrid,
  FiImage,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiSmartphone,
  FiX,
  FiXCircle,
  FiMaximize2,
} from "react-icons/fi";
import InteractiveMap from "../../components/InteractiveMap";
import LoadingSpinner from "../../components/LoadingSpinner";
import VideoPlayer from "../../components/VideoPlayer";
import ErrorBoundary from "../../components/ErrorBoundary";
import ImageLightboxModal from "../../components/ImageLightboxModal";
import { adminService } from "../../services/attendanceService";
import { getImageUrl } from "../../services/api";

const GeotagVerificationSheet = () => {
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarksInput, setRemarksInput] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Lightbox Modal state
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fetchSheetData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAttendanceSheet({
        status_filter: statusFilter,
        attendance_date: dateFilter || undefined,
        search_query: searchTerm || undefined,
        department_filter: departmentFilter !== "all" ? departmentFilter : undefined,
      });
      setSheetData(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load attendance approval sheet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, [statusFilter, departmentFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSheetData();
  };

  const handleVerify = async (id, status, customRemarks = "") => {
    setActionLoadingId(id);
    try {
      const finalRemarks = customRemarks || remarksInput || `Verified as '${status}' by Admin`;
      await adminService.verifyAttendance(id, {
        status,
        admin_notes: finalRemarks,
        remarks: finalRemarks,
      });

      toast.success(`Attendance status updated to '${status}'!`);

      setSheetData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status, remarks: finalRemarks, admin_notes: finalRemarks } : item
        )
      );
      if (selectedRequest && selectedRequest.id === id) {
        setSelectedRequest(null);
        setRemarksInput("");
      }
    } catch {
      toast.error("Failed to process verification request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const downloadMedia = async (url, employeeName, label) => {
    try {
      const fullUrl = getImageUrl(url);
      if (!fullUrl) {
        toast.error("No file available to download");
        return;
      }

      const cleanName = (employeeName || "File").replace(/[^a-zA-Z0-9]/g, "_");
      const ext = url.split(".").pop().split("?")[0] || "file";
      const fileName = `${cleanName}_${label}.${ext}`;

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

      toast.success(`${label} downloaded successfully!`);
    } catch {
      const fullUrl = getImageUrl(url);
      window.open(fullUrl, "_blank");
    }
  };

  const openLightboxForRequest = (req, targetUrl) => {
    const list = [];
    const selfie = req.selfie_url || req.photo_url;
    if (selfie && getImageUrl(selfie)) {
      list.push({ url: selfie, title: `${req.full_name} - Check-In Selfie` });
    }
    if (req.work_photo_url && getImageUrl(req.work_photo_url)) {
      list.push({ url: req.work_photo_url, title: `${req.full_name} - Work Photo` });
    }
    if (req.checkout_selfie_url && getImageUrl(req.checkout_selfie_url)) {
      list.push({ url: req.checkout_selfie_url, title: `${req.full_name} - Checkout Selfie` });
    }
    if (req.checkout_work_photo_url && getImageUrl(req.checkout_work_photo_url)) {
      list.push({ url: req.checkout_work_photo_url, title: `${req.full_name} - Checkout Photo` });
    }

    if (list.length === 0) return;

    let targetIndex = list.findIndex((item) => item.url === targetUrl);
    if (targetIndex < 0) targetIndex = 0;

    setLightboxImages(list);
    setLightboxIndex(targetIndex);
    setIsLightboxOpen(true);
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const departments = ["all", ...new Set(sheetData.map((d) => d.department).filter(Boolean))];

  const filteredData = sheetData.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      item.full_name?.toLowerCase().includes(term) ||
      item.employee_id?.toLowerCase().includes(term) ||
      item.department?.toLowerCase().includes(term) ||
      (item.date && String(item.date).toLowerCase().includes(term));

    return matchesSearch;
  });

  const getMediaListForCount = (item) => {
    const rawList = [
      item.selfie_url || item.photo_url,
      item.work_photo_url,
      item.work_video_url,
      item.checkout_selfie_url,
      item.checkout_work_photo_url,
      item.checkout_work_video_url,
    ];
    const validList = rawList.filter((u) => getImageUrl(u));
    console.log(`[DEBUG STEP 5] Attendance ID: ${item.id} | Employee: ${item.full_name}`);
    console.log("  Received Object:", item);
    console.log("  selfie_url / photo_url:", item.selfie_url || item.photo_url);
    console.log("  work_photo_url:        ", item.work_photo_url);
    console.log("  work_video_url:        ", item.work_video_url);
    console.log("  checkout_selfie_url:    ", item.checkout_selfie_url);
    console.log("  checkout_work_photo_url:", item.checkout_work_photo_url);
    console.log("  checkout_work_video_url:", item.checkout_work_video_url);
    console.log(`  Calculated Media Count = ${validList.length} (out of ${rawList.length} potential slots)`);
    return validList;
  };


  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <FiGrid className="text-orange-600 dark:text-orange-400" /> Attendance & Work Proof Verification Console
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Inspect live selfies, work photos, HTML5 work videos, and GPS geofence data. Grant <strong>Present</strong> or <strong>Absent</strong> verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSheetData}
            className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm min-h-[44px]"
          >
            <FiRefreshCw className="h-4 w-4" /> Refresh Sheet
          </button>
        </div>
      </div>

      {/* Filter & Multi-Criteria Search Bar */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="grid gap-3 sm:grid-cols-4 font-sans text-xs">
          {/* Text Search */}
          <div className="relative sm:col-span-2">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by Employee ID, Name, Date, or Department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none font-medium min-h-[44px]"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300 focus:border-orange-500 focus:outline-none min-h-[44px]"
            >
              <option value="all">All Departments</option>
              {departments.filter((d) => d !== "all").map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300 focus:border-orange-500 focus:outline-none font-mono text-xs min-h-[44px]"
            />
          </div>
        </form>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 dark:border-slate-800 font-sans text-xs">
          <span className="text-slate-500 font-bold flex items-center gap-1 shrink-0"><FiFilter /> Status:</span>
          {["all", "pending", "present", "absent"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3.5 py-2 text-xs font-extrabold uppercase tracking-wider transition shrink-0 min-h-[44px] flex items-center justify-center ${
                statusFilter === st
                  ? "bg-orange-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* MOBILE RESPONSIVE CARDS VIEW (< md screens) */}
      <div className="block md:hidden space-y-4">
        {loading ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 text-center border border-slate-200 dark:border-slate-800">
            <LoadingSpinner size="md" />
          </div>
        ) : filteredData.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 text-center text-slate-400 border border-slate-200 dark:border-slate-800 font-medium text-xs">
            No verification records found.
          </div>
        ) : (
          filteredData.map((item) => {
            const mediaCount = getMediaListForCount(item).length;
            return (
              <div
                key={item.id}
                className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 font-sans"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(item.employee_photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                      alt={item.full_name}
                      className="h-12 w-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white font-display text-sm">{item.full_name}</h3>
                      <div className="font-mono text-[11px] font-bold text-orange-600">
                        {item.employee_id} &bull; {item.department}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold shrink-0 ${
                      item.status === "Present"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "Absent"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.status || "Pending Approval"}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Check-In:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatTime(item.check_in_time || item.check_in)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Check-Out:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatTime(item.check_out_time || item.check_out)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Working Hours:</span>
                    <span className="font-bold text-orange-600">{item.working_hours || (item.check_out ? "Completed" : "In Progress")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Geofence:</span>
                    <span className={item.is_inside_geofence ? "font-bold text-emerald-600" : "font-bold text-amber-500"}>
                      {item.is_inside_geofence ? "Inside" : "Outside"}
                    </span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={() => {
                      setSelectedRequest(item);
                      setRemarksInput(item.remarks || "");
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-orange-50 dark:bg-orange-950/50 px-4 py-2.5 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-600 hover:text-white transition min-h-[44px]"
                  >
                    <FiEye className="h-4 w-4" /> Inspect Media ({mediaCount})
                  </button>

                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      disabled={actionLoadingId === item.id || item.status === "Present"}
                      onClick={() => handleVerify(item.id, "Present")}
                      className="inline-flex items-center justify-center gap-1 rounded-2xl bg-emerald-600 px-3 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-40 min-h-[44px]"
                    >
                      <FiCheckCircle className="h-4 w-4" /> Approve
                    </button>
                    <button
                      disabled={actionLoadingId === item.id || item.status === "Absent"}
                      onClick={() => handleVerify(item.id, "Absent")}
                      className="inline-flex items-center justify-center gap-1 rounded-2xl bg-rose-600 px-3 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-700 disabled:opacity-40 min-h-[44px]"
                    >
                      <FiXCircle className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESPRESSIONS & DESKTOP TABLE VIEW (>= md screens) */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm font-sans">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950/90 text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-4">Employee</th>
                <th className="px-4 py-4">Check-In / Check-Out</th>
                <th className="px-4 py-4">Working Hours</th>
                <th className="px-4 py-4">Selfie & Work Proof</th>
                <th className="px-4 py-4">GPS Location</th>
                <th className="px-4 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-center">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-medium bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center"><LoadingSpinner size="md" /></td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No verification records found.</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    {/* Employee */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(item.employee_photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                          alt={item.full_name}
                          className="h-10 w-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white font-display">{item.full_name}</div>
                          <div className="font-mono text-[11px] font-bold text-orange-600">{item.employee_id} &bull; {item.department}</div>
                        </div>
                      </div>
                    </td>

                    {/* Check In / Check Out */}
                    <td className="px-4 py-3.5 font-mono">
                      <div className="text-slate-900 dark:text-white font-bold">In: {formatTime(item.check_in_time || item.check_in)}</div>
                      <div className="text-slate-500 text-[11px]">Out: {formatTime(item.check_out_time || item.check_out)}</div>
                    </td>

                    {/* Working Hours */}
                    <td className="px-4 py-3.5 font-mono font-bold text-orange-600">
                      {item.working_hours || (item.check_out ? "Completed" : "In Progress")}
                    </td>

                    {/* Proof Icons & Inspection Button */}
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => { setSelectedRequest(item); setRemarksInput(item.remarks || ""); }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 px-3.5 py-2 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-600 hover:text-white transition min-h-[44px]"
                      >
                        <FiEye className="h-4 w-4" /> Inspect Media ({getMediaListForCount(item).length})
                      </button>
                    </td>

                    {/* GPS Location */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-slate-200 max-w-xs truncate flex items-center gap-1">
                        <FiMapPin className="text-emerald-600 shrink-0" /> {item.location_name || "Office Site"}
                      </div>
                      {item.is_inside_geofence ? (
                        <span className="text-[10px] text-emerald-600 font-bold">Inside Geofence</span>
                      ) : (
                        <span className="text-[10px] text-amber-500 font-bold">Outside Zone</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                        item.status === "Present" ? "bg-emerald-100 text-emerald-800" : item.status === "Absent" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                      }`}>
                        {item.status || "Pending Approval"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          disabled={actionLoadingId === item.id || item.status === "Present"}
                          onClick={() => handleVerify(item.id, "Present")}
                          className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-40 min-h-[44px] flex items-center gap-1"
                        >
                          <FiCheckCircle /> Approve
                        </button>
                        <button
                          disabled={actionLoadingId === item.id || item.status === "Absent"}
                          onClick={() => handleVerify(item.id, "Absent")}
                          className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-rose-700 disabled:opacity-40 min-h-[44px] flex items-center gap-1"
                        >
                          <FiXCircle /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Media Inspection & Video Player Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/85 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto">
          <div className="relative max-w-4xl w-full rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl my-8 text-slate-900 dark:text-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute right-4 top-4 rounded-2xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <FiX className="h-6 w-6" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 pr-10">
              <img
                src={getImageUrl(selectedRequest.employee_photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                alt={selectedRequest.full_name}
                className="h-14 w-14 object-cover rounded-2xl border-2 border-orange-500 shadow-md shrink-0"
              />
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display">{selectedRequest.full_name}</h3>
                <div className="text-xs text-orange-600 font-mono font-bold">
                  ID: {selectedRequest.employee_id} &bull; {selectedRequest.department} ({selectedRequest.designation})
                </div>
              </div>
            </div>

            {/* Timestamps & Hours Bar */}
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 text-xs font-mono">
              <div><span className="text-slate-400 block font-sans">Check-In:</span><span className="font-bold text-slate-900 dark:text-white">{formatTime(selectedRequest.check_in_time || selectedRequest.check_in)}</span></div>
              <div><span className="text-slate-400 block font-sans">Check-Out:</span><span className="font-bold text-slate-900 dark:text-white">{formatTime(selectedRequest.check_out_time || selectedRequest.check_out)}</span></div>
              <div><span className="text-slate-400 block font-sans">Working Hours:</span><span className="font-bold text-orange-600">{selectedRequest.working_hours || "N/A"}</span></div>
              <div><span className="text-slate-400 block font-sans">Geofence Status:</span><span className={selectedRequest.is_inside_geofence ? "font-bold text-emerald-500" : "font-bold text-amber-500"}>{selectedRequest.is_inside_geofence ? "Inside Geofence" : "Outside Zone"}</span></div>
            </div>

            {/* Media Proof Gallery */}
            <div className="space-y-4">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white font-display flex items-center gap-2">
                <FiCamera className="text-orange-600" /> Uploaded Work Proofs & Media
              </h4>

              {getMediaListForCount(selectedRequest).length === 0 ? (
                <div className="rounded-2xl bg-amber-50 dark:bg-amber-950/40 p-5 border border-amber-200 dark:border-amber-800 text-center font-sans text-xs text-amber-800 dark:text-amber-300">
                  <FiAlertTriangle className="mx-auto h-6 w-6 mb-2 text-amber-500" />
                  <p className="font-bold">No Media Files Available</p>
                  <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                    No valid selfie photo, work photo, or video was uploaded for this record.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* 1. Morning Selfie */}
                  {getImageUrl(selectedRequest.selfie_url || selectedRequest.photo_url) ? (
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold font-sans">
                        <span>Morning Live Selfie</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openLightboxForRequest(selectedRequest, selectedRequest.selfie_url || selectedRequest.photo_url)}
                            className="text-slate-500 hover:text-orange-600 flex items-center gap-1 font-sans"
                            title="Full Screen Preview"
                          >
                            <FiMaximize2 className="h-3.5 w-3.5" /> Enlarge
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadMedia(selectedRequest.selfie_url || selectedRequest.photo_url, selectedRequest.full_name, "Selfie")}
                            className="text-orange-600 hover:underline flex items-center gap-1"
                          >
                            <FiDownload /> Save
                          </button>
                        </div>
                      </div>
                      <img
                        src={getImageUrl(selectedRequest.selfie_url || selectedRequest.photo_url)}
                        alt="Selfie"
                        onClick={() => openLightboxForRequest(selectedRequest, selectedRequest.selfie_url || selectedRequest.photo_url)}
                        className="h-44 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-90 transition"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 p-4 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-1 text-slate-400 min-h-[180px]">
                      <FiImage className="h-6 w-6 opacity-40 text-orange-500" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans">Morning Live Selfie</span>
                      <span className="text-[11px] text-slate-400">No Photo Uploaded</span>
                    </div>
                  )}

                  {/* 2. Work Photo */}
                  {getImageUrl(selectedRequest.work_photo_url) ? (
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold font-sans">
                        <span>Morning Work Photo</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openLightboxForRequest(selectedRequest, selectedRequest.work_photo_url)}
                            className="text-slate-500 hover:text-orange-600 flex items-center gap-1 font-sans"
                            title="Full Screen Preview"
                          >
                            <FiMaximize2 className="h-3.5 w-3.5" /> Enlarge
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadMedia(selectedRequest.work_photo_url, selectedRequest.full_name, "Work_Photo")}
                            className="text-orange-600 hover:underline flex items-center gap-1"
                          >
                            <FiDownload /> Save
                          </button>
                        </div>
                      </div>
                      <img
                        src={getImageUrl(selectedRequest.work_photo_url)}
                        alt="Work Photo"
                        onClick={() => openLightboxForRequest(selectedRequest, selectedRequest.work_photo_url)}
                        className="h-44 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-90 transition"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 p-4 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-1 text-slate-400 min-h-[180px]">
                      <FiImage className="h-6 w-6 opacity-40 text-orange-500" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans">Morning Work Photo</span>
                      <span className="text-[11px] text-slate-400">No Photo Uploaded</span>
                    </div>
                  )}

                  {/* 3. Checkout Selfie */}
                  {getImageUrl(selectedRequest.checkout_selfie_url) ? (
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold font-sans">
                        <span>Evening Checkout Selfie</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openLightboxForRequest(selectedRequest, selectedRequest.checkout_selfie_url)}
                            className="text-slate-500 hover:text-orange-600 flex items-center gap-1 font-sans"
                            title="Full Screen Preview"
                          >
                            <FiMaximize2 className="h-3.5 w-3.5" /> Enlarge
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadMedia(selectedRequest.checkout_selfie_url, selectedRequest.full_name, "Checkout_Selfie")}
                            className="text-orange-600 hover:underline flex items-center gap-1"
                          >
                            <FiDownload /> Save
                          </button>
                        </div>
                      </div>
                      <img
                        src={getImageUrl(selectedRequest.checkout_selfie_url)}
                        alt="Checkout Selfie"
                        onClick={() => openLightboxForRequest(selectedRequest, selectedRequest.checkout_selfie_url)}
                        className="h-44 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-90 transition"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 p-4 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-1 text-slate-400 min-h-[180px]">
                      <FiImage className="h-6 w-6 opacity-40 text-orange-500" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans">Evening Checkout Selfie</span>
                      <span className="text-[11px] text-slate-400">No Photo Uploaded</span>
                    </div>
                  )}

                  {/* 4. Checkout Work Photo */}
                  {getImageUrl(selectedRequest.checkout_work_photo_url) ? (
                    <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold font-sans">
                        <span>Evening Checkout Photo</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openLightboxForRequest(selectedRequest, selectedRequest.checkout_work_photo_url)}
                            className="text-slate-500 hover:text-orange-600 flex items-center gap-1 font-sans"
                            title="Full Screen Preview"
                          >
                            <FiMaximize2 className="h-3.5 w-3.5" /> Enlarge
                          </button>
                          <button
                            type="button"
                            onClick={() => downloadMedia(selectedRequest.checkout_work_photo_url, selectedRequest.full_name, "Checkout_Photo")}
                            className="text-orange-600 hover:underline flex items-center gap-1"
                          >
                            <FiDownload /> Save
                          </button>
                        </div>
                      </div>
                      <img
                        src={getImageUrl(selectedRequest.checkout_work_photo_url)}
                        alt="Checkout Photo"
                        onClick={() => openLightboxForRequest(selectedRequest, selectedRequest.checkout_work_photo_url)}
                        className="h-44 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-90 transition"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 p-4 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-1 text-slate-400 min-h-[180px]">
                      <FiImage className="h-6 w-6 opacity-40 text-orange-500" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans">Evening Checkout Photo</span>
                      <span className="text-[11px] text-slate-400">No Photo Uploaded</span>
                    </div>
                  )}

                  {/* 5. Work Video */}
                  {getImageUrl(selectedRequest.work_video_url) ? (
                    <div className="col-span-1 sm:col-span-2 rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold font-sans">
                        <span className="flex items-center gap-1.5"><FiFilm className="text-orange-600" /> Morning Work Completion Video</span>
                        <button
                          type="button"
                          onClick={() => downloadMedia(selectedRequest.work_video_url, selectedRequest.full_name, "Work_Video")}
                          className="text-orange-600 hover:underline flex items-center gap-1"
                        >
                          <FiDownload /> Save Video
                        </button>
                      </div>
                      <ErrorBoundary>
                        <VideoPlayer src={selectedRequest.work_video_url} className="max-w-lg mx-auto" />
                      </ErrorBoundary>
                    </div>
                  ) : (
                    <div className="col-span-1 sm:col-span-2 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 p-4 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-1 text-slate-400 min-h-[120px]">
                      <FiFilm className="h-6 w-6 opacity-40 text-orange-500" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans">Morning Work Completion Video</span>
                      <span className="text-[11px] text-slate-400">No Video Uploaded</span>
                    </div>
                  )}

                  {/* 6. Checkout Work Video */}
                  {getImageUrl(selectedRequest.checkout_work_video_url) ? (
                    <div className="col-span-1 sm:col-span-2 rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold font-sans">
                        <span className="flex items-center gap-1.5"><FiFilm className="text-orange-600" /> Evening Checkout Video</span>
                        <button
                          type="button"
                          onClick={() => downloadMedia(selectedRequest.checkout_work_video_url, selectedRequest.full_name, "Checkout_Video")}
                          className="text-orange-600 hover:underline flex items-center gap-1"
                        >
                          <FiDownload /> Save Video
                        </button>
                      </div>
                      <ErrorBoundary>
                        <VideoPlayer src={selectedRequest.checkout_work_video_url} className="max-w-lg mx-auto" />
                      </ErrorBoundary>
                    </div>
                  ) : (
                    <div className="col-span-1 sm:col-span-2 rounded-2xl bg-slate-100/70 dark:bg-slate-950/60 p-4 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-1 text-slate-400 min-h-[120px]">
                      <FiFilm className="h-6 w-6 opacity-40 text-orange-500" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 font-sans">Evening Checkout Video</span>
                      <span className="text-[11px] text-slate-400">No Video Uploaded</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Map */}
            <div>
              <span className="text-xs font-bold text-slate-500 block mb-2 font-sans">Check-In GPS Geofence Map:</span>
              <ErrorBoundary>
                <InteractiveMap
                  latitude={selectedRequest.latitude}
                  longitude={selectedRequest.longitude}
                  address={selectedRequest.address || selectedRequest.location_name}
                  locationName={selectedRequest.location_name}
                  isInsideGeofence={selectedRequest.is_inside_geofence}
                  height="h-52"
                />
              </ErrorBoundary>
            </div>

            {/* Remarks Input Box */}
            <div className="font-sans">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Admin Remarks / Verification Notes</label>
              <textarea
                rows={2}
                placeholder="Enter verification remarks..."
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 font-sans">
              <button
                onClick={() => handleVerify(selectedRequest.id, "Absent", remarksInput)}
                className="w-full sm:w-auto rounded-2xl bg-rose-600 px-6 py-3 text-xs font-bold text-white hover:bg-rose-700 shadow-md transition min-h-[44px]"
              >
                Reject (Mark Absent)
              </button>
              <button
                onClick={() => handleVerify(selectedRequest.id, "Present", remarksInput)}
                className="w-full sm:w-auto rounded-2xl bg-emerald-600 px-6 py-3 text-xs font-bold text-white hover:bg-emerald-700 shadow-md transition min-h-[44px]"
              >
                Approve (Mark Present)
              </button>
            </div>
          </div>
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

export default GeotagVerificationSheet;
