import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiDownload,
  FiEye,
  FiFilter,
  FiGrid,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiAlertTriangle,
  FiSmartphone,
  FiX,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import InteractiveMap from "../../components/InteractiveMap";
import LoadingSpinner from "../../components/LoadingSpinner";
import WorkProofSection from "../../components/WorkProofSection";
import { adminService } from "../../services/attendanceService";
import { getImageUrl } from "../../services/api";

const GeotagVerificationSheet = () => {
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [remarksMap, setRemarksMap] = useState({});
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchSheetData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAttendanceSheet({ status_filter: statusFilter });
      setSheetData(data || []);
    } catch {
      toast.error("Failed to load attendance approval sheet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, [statusFilter]);

  const handleVerify = async (id, status) => {
    setActionLoadingId(id);
    const customRemarks = remarksMap[id] || `Verified as '${status}' by Admin`;
    try {
      await adminService.verifyAttendance(id, {
        status,
        admin_notes: customRemarks,
        remarks: customRemarks,
      });

      toast.success(`Attendance status updated to '${status}'!`);

      setSheetData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status, remarks: customRemarks, admin_notes: customRemarks } : item
        )
      );
    } catch {
      toast.error("Failed to process verification request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleRemarksChange = (id, value) => {
    setRemarksMap({ ...remarksMap, [id]: value });
  };

  const downloadPhoto = async (photoUrl, employeeName, empId) => {
    try {
      const fullUrl = getImageUrl(photoUrl);
      if (!fullUrl) return;
      const cleanName = (employeeName || "Selfie").replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = `${cleanName}_${empId || "Proof"}_Selfie.jpg`;

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

  const filteredData = sheetData.filter((item) => {
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    return (
      item.full_name?.toLowerCase().includes(query) ||
      item.employee_id?.toLowerCase().includes(query) ||
      item.department?.toLowerCase().includes(query) ||
      item.location_name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 font-sans pb-16">
      {/* Title Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
          <FiCheckCircle className="text-orange-600 dark:text-orange-400" /> Geotag Attendance Review Sheet
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Expand individual site check-in cards to inspect maps, selfies, work proofs, and approve/reject.
        </p>
      </div>

      {/* Filter Tabs & Search Bar Container */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Search Bar (48px Height) */}
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by employee name, ID, department, or site..."
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-12 pr-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none font-medium"
          />
        </div>

        {/* Status Filter Tabs (Touch Targets 48px) */}
        <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-extrabold">
          {[
            { id: "all", label: "All Submissions" },
            { id: "Pending", label: "Pending Review" },
            { id: "Present", label: "Approved Present" },
            { id: "Absent", label: "Rejected / Absent" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-2.5 rounded-2xl transition whitespace-nowrap min-h-[44px] border ${
                statusFilter === tab.id
                  ? "bg-orange-600 text-white border-orange-600 shadow-md"
                  : "bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sheet Content Container */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : filteredData.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 text-center border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
          <FiAlertCircle className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-extrabold text-slate-500">No attendance verification records found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredData.map((item) => {
            const isExpanded = expandedId === item.id;
            const currentRemarks = remarksMap[item.id] !== undefined ? remarksMap[item.id] : item.remarks || "";

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:border-orange-400/50 transition-all"
              >
                {/* Expandable Mobile Card Header Bar */}
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={getImageUrl(item.photo_url || item.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                      alt={item.full_name}
                      className="h-12 w-12 rounded-2xl object-cover border-2 border-orange-500 shadow-sm shrink-0"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                      }}
                    />
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white font-display">
                        {item.full_name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {item.designation} &bull; {item.department} &bull; <span className="font-mono font-bold text-orange-600">{item.employee_id}</span>
                      </p>
                      {item.location_name && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-0.5 flex items-center gap-1">
                          <FiMapPin className="text-orange-600 shrink-0" /> {item.location_name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      {item.is_inside_geofence ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          Inside Zone
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          Outside Zone
                        </span>
                      )}

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-extrabold border ${
                          item.status === "Present"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : item.status === "Absent"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {item.status || "Pending Review"}
                      </span>
                    </div>

                    <div className="rounded-xl p-2 bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {isExpanded ? <FiChevronUp className="h-4 w-4" /> : <FiChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Expandable Details & Action Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 dark:border-slate-800 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-950/50 space-y-5"
                    >
                      {/* Map & Coordinates */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider">
                            GPS Coordinates & Address
                          </span>
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                            {item.address || item.location_name || "Verified Location"}
                          </p>
                          <p className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400">
                            Latitude: {item.latitude?.toFixed(4)}, Longitude: {item.longitude?.toFixed(4)}
                          </p>
                        </div>

                        {item.latitude && item.longitude && (
                          <InteractiveMap
                            latitude={item.latitude}
                            longitude={item.longitude}
                            address={item.address}
                            locationName={item.location_name}
                            isInsideGeofence={item.is_inside_geofence}
                            height="h-44"
                          />
                        )}
                      </div>

                      {/* Selfie Image & Download */}
                      {item.photo_url && (
                        <div className="space-y-2">
                          <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider">
                            Verified Live Selfie Proof
                          </span>
                          <div className="flex items-center gap-4">
                            <img
                              src={getImageUrl(item.photo_url) || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80"}
                              alt="Selfie"
                              className="h-28 w-28 object-cover rounded-2xl border-2 border-orange-500 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => downloadPhoto(item.photo_url, item.full_name, item.employee_id)}
                              className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 px-4 py-3 min-h-[44px] text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-orange-600 hover:text-white transition shadow-sm"
                            >
                              <FiDownload className="h-4 w-4" /> Download Photo
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Work Proof Attachments */}
                      <WorkProofSection attendanceId={item.id} isReadOnly={true} />

                      {/* Remarks & Approval Actions */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider">
                          Admin Remarks / Audit Note
                        </label>
                        <input
                          type="text"
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                          placeholder="e.g. Verified site visit, approved by HR Admin"
                          className="w-full rounded-2xl bg-white dark:bg-slate-900 px-4 py-3 min-h-[48px] text-xs sm:text-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium focus:border-orange-500 focus:outline-none"
                        />

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            type="button"
                            onClick={() => handleVerify(item.id, "Present")}
                            disabled={actionLoadingId === item.id}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3.5 min-h-[48px] text-xs font-extrabold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition disabled:opacity-60"
                          >
                            {actionLoadingId === item.id ? <LoadingSpinner size="sm" /> : <><FiCheckCircle className="h-4 w-4" /> Approve Present</>}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleVerify(item.id, "Absent")}
                            disabled={actionLoadingId === item.id}
                            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-3.5 min-h-[48px] text-xs font-extrabold text-white shadow-md hover:from-rose-500 hover:to-red-500 transition disabled:opacity-60"
                          >
                            {actionLoadingId === item.id ? <LoadingSpinner size="sm" /> : <><FiXCircle className="h-4 w-4" /> Reject & Mark Absent</>}
                          </button>
                        </div>
                      </div>
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

export default GeotagVerificationSheet;
