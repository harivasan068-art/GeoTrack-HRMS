import { useEffect, useState } from "react";
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
} from "react-icons/fi";
import InteractiveMap from "../../components/InteractiveMap";
import LoadingSpinner from "../../components/LoadingSpinner";
import { adminService } from "../../services/attendanceService";
import { API_BASE_URL, getImageUrl } from "../../services/api";

const GeotagVerificationSheet = () => {
  const [sheetData, setSheetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remarksInput, setRemarksInput] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchSheetData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAttendanceSheet({ status_filter: statusFilter });
      setSheetData(data);
    } catch (e) {
      toast.error("Failed to load attendance approval sheet");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetData();
  }, [statusFilter]);

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
    } catch (e) {
      toast.error("Failed to process verification request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const downloadPhoto = async (photoUrl, employeeName, empId) => {
    try {
      const fullUrl = getImageUrl(photoUrl);
      if (!fullUrl) {
        toast.error("No photo available to download");
        return;
      }

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

      toast.success("Selfie proof saved to your device!");
    } catch (error) {
      const fullUrl = getImageUrl(photoUrl);
      const link = document.createElement("a");
      link.href = fullUrl;
      link.target = "_blank";
      link.download = `${employeeName || "Selfie"}_Proof.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Opened photo download");
    }
  };

  const exportToCSV = () => {
    if (!sheetData.length) return;
    const headers = [
      "ID",
      "Employee Name",
      "Employee ID",
      "Department",
      "Designation",
      "Check-In Time",
      "Geofence Status",
      "Location Address",
      "Latitude",
      "Longitude",
      "Status",
      "Approved By",
      "Remarks",
    ];

    const rows = sheetData.map((item) => [
      item.id,
      `"${item.full_name}"`,
      item.employee_id,
      `"${item.department}"`,
      `"${item.designation}"`,
      item.check_in ? new Date(item.check_in).toLocaleString() : "N/A",
      item.is_inside_geofence ? "Inside Geofence" : "Outside Zone",
      `"${item.address || item.location_name || ""}"`,
      item.latitude || "",
      item.longitude || "",
      item.status,
      `"${item.approved_by || "Admin"}"`,
      `"${item.remarks || ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Approval_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported attendance report to CSV!");
  };

  const filteredData = sheetData.filter((item) => {
    const matchesSearch =
      item.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <FiGrid className="text-indigo-400" /> Attendance Requests Approval Console
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Inspect live selfies, interactive maps, and GPS geofence status. Admins decide and grant <strong>Present</strong> or <strong>Absent</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSheetData}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
          >
            <FiRefreshCw className="h-3.5 w-3.5" /> Refresh Requests
          </button>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition"
          >
            <FiDownload className="h-3.5 w-3.5" /> Export Excel / CSV
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-slate-900 p-4 border border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by employee name, ID, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <FiFilter /> Filter:
          </span>
          {["all", "pending", "present", "absent"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                statusFilter === st
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-950 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Spreadsheet Approval Grid */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/90 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Employee Details</th>
                <th className="px-4 py-3.5">Check-In Time</th>
                <th className="px-4 py-3.5">Selfie Proof</th>
                <th className="px-4 py-3.5">Location & Geofence</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-4 py-3.5 text-center">Admin Approval Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <LoadingSpinner size="md" />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No attendance requests matching current filters.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono text-slate-500">{idx + 1}</td>

                    {/* Employee info */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={getImageUrl(item.employee_photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                          alt={item.full_name}
                          className="h-9 w-9 rounded-xl object-cover border border-slate-700"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                          }}
                        />
                        <div>
                          <div className="font-bold text-white">{item.full_name}</div>
                          <div className="font-mono text-[11px] text-indigo-400">{item.employee_id} &bull; {item.department}</div>
                        </div>
                      </div>
                    </td>

                    {/* Check In Time */}
                    <td className="px-4 py-3 text-slate-300 font-mono">
                      {item.check_in ? new Date(item.check_in).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true }) : "--"}
                    </td>

                    {/* Selfie Proof */}
                    <td className="px-4 py-3">
                      {item.photo_url ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedRequest(item);
                              setRemarksInput(item.remarks || "");
                            }}
                            className="group flex items-center gap-2 rounded-lg bg-slate-950 p-1 border border-slate-800 hover:border-indigo-500 transition"
                          >
                            <img
                              src={getImageUrl(item.photo_url) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"}
                              alt="Selfie"
                              className="h-10 w-12 object-cover rounded"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";
                              }}
                            />
                            <span className="text-[11px] text-indigo-400 group-hover:underline flex items-center gap-1 pr-1">
                              <FiEye /> Inspect
                            </span>
                          </button>
                          <button
                            onClick={() => downloadPhoto(item.photo_url, item.full_name, item.employee_id)}
                            className="rounded-lg bg-slate-950 p-2 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition"
                            title="Download selfie photo to device"
                          >
                            <FiDownload className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No Selfie</span>
                      )}
                    </td>

                    {/* Location & Geofence */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 font-semibold text-slate-200 max-w-xs truncate">
                        <FiMapPin className="text-emerald-400 shrink-0" /> {item.location_name || "Check-In Site"}
                      </div>
                      <div className="mt-0.5">
                        {item.is_inside_geofence ? (
                          <span className="text-[10px] font-bold text-emerald-400">Inside Allowed Geofence</span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                            <FiAlertTriangle /> Outside Allowed Zone
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      {item.status === "Present" && (
                        <span className="inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
                          Present
                        </span>
                      )}
                      {item.status === "Absent" && (
                        <span className="inline-flex rounded-full bg-rose-500/10 px-2.5 py-1 text-xs font-bold text-rose-400 border border-rose-500/30">
                          Absent
                        </span>
                      )}
                      {(!item.status || item.status.includes("Pending")) && (
                        <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
                          Pending Approval
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={actionLoadingId === item.id || item.status === "Present"}
                          onClick={() => handleVerify(item.id, "Present")}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-emerald-500 disabled:opacity-30 transition"
                        >
                          <FiCheckCircle /> Present
                        </button>
                        <button
                          disabled={actionLoadingId === item.id || item.status === "Absent"}
                          onClick={() => handleVerify(item.id, "Absent")}
                          className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-rose-500 disabled:opacity-30 transition"
                        >
                          <FiXCircle /> Absent
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

      {/* Full Approval Inspection Modal with Interactive Map */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-3xl w-full rounded-2xl bg-slate-900 p-6 border border-slate-800 space-y-5 shadow-2xl my-8">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <FiX className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <img
                src={getImageUrl(selectedRequest.employee_photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                alt={selectedRequest.full_name}
                className="h-12 w-12 object-cover rounded-xl border border-slate-700"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                }}
              />
              <div>
                <h3 className="text-lg font-bold text-white">{selectedRequest.full_name}</h3>
                <div className="text-xs text-indigo-400 font-mono">
                  ID: {selectedRequest.employee_id} &bull; {selectedRequest.designation} ({selectedRequest.department})
                </div>
              </div>
            </div>

            {/* Selfie & Interactive Map Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Large Selfie */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">Live Captured Selfie Proof:</span>
                  {selectedRequest.photo_url && (
                    <button
                      onClick={() => downloadPhoto(selectedRequest.photo_url, selectedRequest.full_name, selectedRequest.employee_id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
                      title="Download photo to device"
                    >
                      <FiDownload className="h-3.5 w-3.5" /> Save Photo
                    </button>
                  )}
                </div>
                <div className="relative group">
                  <img
                    src={getImageUrl(selectedRequest.photo_url) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80"}
                    alt="Large Selfie Proof"
                    className="h-64 w-full object-cover rounded-2xl border border-slate-800 shadow-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80";
                    }}
                  />
                  {selectedRequest.photo_url && (
                    <button
                      onClick={() => downloadPhoto(selectedRequest.photo_url, selectedRequest.full_name, selectedRequest.employee_id)}
                      className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-xl bg-slate-950/90 backdrop-blur px-3 py-2 text-xs font-bold text-white border border-slate-700 shadow-xl hover:bg-indigo-600 hover:border-indigo-500 transition"
                    >
                      <FiDownload className="h-4 w-4" /> Download Photo to Device
                    </button>
                  )}
                </div>
              </div>

              {/* Interactive Map Component */}
              <div>
                <span className="text-xs font-bold text-slate-400 block mb-2">GPS Location & Geofence Map:</span>
                <InteractiveMap
                  latitude={selectedRequest.latitude}
                  longitude={selectedRequest.longitude}
                  address={selectedRequest.address || selectedRequest.location_name}
                  locationName={selectedRequest.location_name}
                  isInsideGeofence={selectedRequest.is_inside_geofence}
                  height="h-64"
                />
              </div>
            </div>

            {/* Device & Submission Details */}
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 grid gap-3 sm:grid-cols-3 text-xs">
              <div>
                <span className="text-slate-400">Submission Timestamp:</span>
                <div className="font-semibold text-white mt-0.5">{selectedRequest.check_in ? new Date(selectedRequest.check_in).toLocaleString() : "N/A"}</div>
              </div>
              <div>
                <span className="text-slate-400 flex items-center gap-1"><FiSmartphone /> Device / Client:</span>
                <div className="font-semibold text-slate-200 mt-0.5 truncate">{selectedRequest.device || "Web Browser"}</div>
              </div>
              <div>
                <span className="text-slate-400">IP Address:</span>
                <div className="font-mono text-indigo-300 mt-0.5">{selectedRequest.ip_address || "N/A"}</div>
              </div>
            </div>

            {/* Admin Remarks Input Box */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Admin Remarks / Approval Reason</label>
              <textarea
                rows={2}
                placeholder="Enter approval or rejection remarks for audit log..."
                value={remarksInput}
                onChange={(e) => setRemarksInput(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Modal Decision Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => handleVerify(selectedRequest.id, "Absent", remarksInput)}
                className="rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow-md transition"
              >
                Reject (Mark Absent)
              </button>
              <button
                onClick={() => handleVerify(selectedRequest.id, "Present", remarksInput)}
                className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md transition"
              >
                Approve (Mark Present)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeotagVerificationSheet;
