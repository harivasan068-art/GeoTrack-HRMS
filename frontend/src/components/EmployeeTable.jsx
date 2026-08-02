import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiEye,
  FiFilm,
  FiFilter,
  FiImage,
  FiMail,
  FiMapPin,
  FiMaximize2,
  FiPhone,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUserCheck,
  FiUserPlus,
  FiX,
} from "react-icons/fi";
import { adminService } from "../services/attendanceService";
import { getImageUrl } from "../services/api";
import DigitalIdCard from "./DigitalIdCard";
import VideoPlayer from "./VideoPlayer";
import ImageLightboxModal from "./ImageLightboxModal";

const ITEMS_PER_PAGE = 8;

const EmployeeTable = ({ employees = [], onDelete, loading, onAddEmployee }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name"); // 'name' | 'id' | 'date'
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [empAttendanceHistory, setEmpAttendanceHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'idcard' | 'attendance'

  const [deleteConfirmEmp, setDeleteConfirmEmp] = useState(null);

  // Lightbox State for Attendance History
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Departments list
  const departments = ["all", ...new Set(employees.map((e) => e.department).filter(Boolean))];

  // Fetch employee attendance history when selected
  useEffect(() => {
    if (selectedEmployee) {
      setFetchingHistory(true);
      adminService
        .getEmployeeAttendance(selectedEmployee.employee_id)
        .then((res) => {
          setEmpAttendanceHistory(Array.isArray(res) ? res : []);
        })
        .catch(() => setEmpAttendanceHistory([]))
        .finally(() => setFetchingHistory(false));
    }
  }, [selectedEmployee]);

  // Filtering & Sorting
  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      emp.full_name?.toLowerCase().includes(term) ||
      emp.employee_id?.toLowerCase().includes(term) ||
      emp.email?.toLowerCase().includes(term) ||
      emp.department?.toLowerCase().includes(term);

    const matchesDept = departmentFilter === "all" || emp.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && (emp.status === "Active" || !emp.status)) ||
      (statusFilter === "inactive" && emp.status === "Inactive");

    return matchesSearch && matchesDept && matchesStatus;
  });

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    if (sortBy === "id") return a.employee_id.localeCompare(b.employee_id);
    if (sortBy === "date") return new Date(b.joining_date || 0) - new Date(a.joining_date || 0);
    return a.full_name.localeCompare(b.full_name);
  });

  const totalPages = Math.ceil(sortedEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatTime = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  const openLightboxForAttRecord = (att, targetUrl) => {
    const list = [];
    const selfie = att.selfie_url || att.photo_url;
    if (selfie && getImageUrl(selfie)) {
      list.push({ url: selfie, title: `${att.date} - Check-In Selfie` });
    }
    if (att.work_photo_url && getImageUrl(att.work_photo_url)) {
      list.push({ url: att.work_photo_url, title: `${att.date} - Work Photo` });
    }
    if (att.checkout_selfie_url && getImageUrl(att.checkout_selfie_url)) {
      list.push({ url: att.checkout_selfie_url, title: `${att.date} - Checkout Selfie` });
    }
    if (att.checkout_work_photo_url && getImageUrl(att.checkout_work_photo_url)) {
      list.push({ url: att.checkout_work_photo_url, title: `${att.date} - Checkout Photo` });
    }

    if (list.length === 0) return;

    let targetIdx = list.findIndex((item) => item.url === targetUrl);
    if (targetIdx < 0) targetIdx = 0;

    setLightboxImages(list);
    setLightboxIndex(targetIdx);
    setIsLightboxOpen(true);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Search, Filter, Sort & Action Bar */}
      <div className="flex flex-col gap-4 rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between shadow-sm">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by employee name, ID, email, or department..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none font-medium min-h-[44px]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 font-sans text-xs">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold flex items-center gap-1"><FiFilter /> Dept:</span>
            <select
              value={departmentFilter}
              onChange={(e) => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300 focus:border-orange-500 focus:outline-none min-h-[44px]"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "all" ? "All Depts" : dept}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300 focus:border-orange-500 focus:outline-none min-h-[44px]"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 font-bold">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2.5 font-bold text-slate-700 dark:text-slate-300 focus:border-orange-500 focus:outline-none min-h-[44px]"
            >
              <option value="name">Name (A-Z)</option>
              <option value="id">Employee ID</option>
              <option value="date">Joining Date</option>
            </select>
          </div>

          {onAddEmployee && (
            <button
              onClick={onAddEmployee}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-600 px-4 py-2.5 font-bold text-white shadow hover:bg-orange-700 transition min-h-[44px]"
            >
              <FiUserPlus className="h-4 w-4" /> Add Employee
            </button>
          )}
        </div>
      </div>

      {/* MOBILE CARDS VIEW (< md screens) */}
      <div className="block md:hidden space-y-4">
        {paginatedEmployees.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 text-center text-slate-500 border border-slate-200 dark:border-slate-800 font-medium text-xs">
            No employee records match the search criteria.
          </div>
        ) : (
          paginatedEmployees.map((emp) => {
            const isAdmin = emp.designation?.toLowerCase() === "admin";
            return (
              <div
                key={emp.id || emp.employee_id}
                onClick={() => { setSelectedEmployee(emp); setActiveTab("details"); }}
                className="rounded-3xl bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 font-sans cursor-pointer hover:border-orange-500 transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(emp.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                      alt={emp.full_name}
                      className="h-12 w-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white font-display text-sm flex items-center gap-1.5">
                        {emp.full_name}
                        {isAdmin && (
                          <span className="rounded-full bg-orange-100 dark:bg-orange-950/50 px-2 py-0.5 text-[9px] font-extrabold text-orange-700 dark:text-orange-400 border border-orange-200 uppercase font-mono">
                            Admin
                          </span>
                        )}
                      </h3>
                      <div className="font-mono text-[11px] font-bold text-orange-600">
                        {emp.employee_id}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold shrink-0 ${
                      emp.status === "Active"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {emp.status || "Active"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Department:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{emp.department}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-sans">Role:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{emp.designation}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px] font-sans">Email:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">{emp.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => { setSelectedEmployee(emp); setActiveTab("details"); }}
                    className="inline-flex items-center justify-center gap-1 rounded-2xl bg-orange-50 dark:bg-orange-950/50 px-4 py-2.5 text-xs font-bold text-orange-600 border border-orange-200 dark:border-orange-800 min-h-[44px]"
                  >
                    <FiEye className="h-4 w-4" /> Inspect Profile
                  </button>
                  {!isAdmin && (
                    <button
                      onClick={() => setDeleteConfirmEmp(emp)}
                      disabled={loading}
                      className="inline-flex items-center justify-center gap-1 rounded-2xl bg-rose-50 dark:bg-rose-950/40 px-4 py-2.5 text-xs font-bold text-rose-700 border border-rose-200 dark:border-rose-800 min-h-[44px]"
                    >
                      <FiTrash2 className="h-4 w-4" /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Directory Table (DESKTOP >= md screens) */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950/90 text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4">Employee Details</th>
                <th className="px-5 py-4">Employee ID</th>
                <th className="px-5 py-4">Department & Designation</th>
                <th className="px-5 py-4">Email & Phone</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-center">Joining Date</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-medium bg-white dark:bg-slate-900">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No employee records match the search criteria.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  const isAdmin = emp.designation?.toLowerCase() === "admin";
                  return (
                    <tr
                      key={emp.id || emp.employee_id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition cursor-pointer"
                      onClick={() => { setSelectedEmployee(emp); setActiveTab("details"); }}
                    >
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(emp.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                            alt={emp.full_name}
                            className="h-10 w-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                              {emp.full_name}
                              {isAdmin && (
                                <span className="rounded-full bg-orange-100 dark:bg-orange-950/50 px-2 py-0.5 text-[9px] font-extrabold text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 uppercase font-mono">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">{emp.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="px-5 py-3.5 font-mono font-bold text-orange-600 dark:text-orange-400">
                        {emp.employee_id}
                      </td>

                      {/* Dept & Role */}
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-200">{emp.department}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{emp.designation}</div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5 space-y-0.5">
                        <div className="text-slate-800 dark:text-slate-200 font-medium">{emp.email}</div>
                        <div className="text-[11px] text-slate-500">{emp.phone || "N/A"}</div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                            emp.status === "Active"
                              ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {emp.status || "Active"}
                        </span>
                      </td>

                      {/* Joining Date */}
                      <td className="px-5 py-3.5 text-center text-slate-500 font-mono text-[11px]">
                        {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : "N/A"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setSelectedEmployee(emp); setActiveTab("details"); }}
                            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-slate-950 px-3 py-2 text-xs font-bold text-orange-600 dark:text-orange-400 border border-slate-200 dark:border-slate-800 hover:bg-orange-50 transition min-h-[44px]"
                          >
                            <FiEye className="h-4 w-4" /> Inspect
                          </button>

                          {!isAdmin && (
                            <button
                              onClick={() => setDeleteConfirmEmp(emp)}
                              disabled={loading}
                              className="inline-flex items-center gap-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-600 hover:text-white transition min-h-[44px]"
                            >
                              <FiTrash2 className="h-4 w-4" /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-950 text-xs font-medium">
            <span className="text-slate-500 font-mono">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length)} of {filteredEmployees.length} employees
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 text-slate-700 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <FiChevronLeft />
              </button>
              <span className="font-bold text-orange-600 font-mono px-2">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 text-slate-700 dark:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Details & Attendance Inspection Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/85 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto font-sans">
          <div className="relative max-w-3xl w-full rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl my-8 text-slate-900 dark:text-slate-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute right-4 top-4 rounded-2xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close modal"
            >
              <FiX className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 pr-10">
              <img
                src={getImageUrl(selectedEmployee.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                alt={selectedEmployee.full_name}
                className="h-16 w-16 rounded-2xl object-cover border-2 border-orange-500 shadow-md shrink-0"
              />
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">{selectedEmployee.full_name}</h3>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 font-mono mt-0.5">
                  <span className="text-orange-600 font-bold">ID: {selectedEmployee.employee_id}</span>
                  <span>•</span>
                  <span>{selectedEmployee.department}</span>
                  <span>•</span>
                  <span>{selectedEmployee.designation}</span>
                </div>
              </div>
            </div>

            {/* Modal Tabs */}
            <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 font-display text-xs">
              <button
                onClick={() => setActiveTab("details")}
                className={`flex-1 py-2.5 rounded-xl font-bold transition min-h-[44px] ${activeTab === "details" ? "bg-orange-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`}
              >
                Profile Details
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`flex-1 py-2.5 rounded-xl font-bold transition min-h-[44px] ${activeTab === "attendance" ? "bg-orange-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`}
              >
                Attendance History ({empAttendanceHistory.length})
              </button>
              <button
                onClick={() => setActiveTab("idcard")}
                className={`flex-1 py-2.5 rounded-xl font-bold transition min-h-[44px] ${activeTab === "idcard" ? "bg-orange-600 text-white shadow-sm" : "text-slate-600 dark:text-slate-400"}`}
              >
                Digital ID Card
              </button>
            </div>

            {/* TAB 1: Profile Details */}
            {activeTab === "details" && (
              <div className="grid gap-4 sm:grid-cols-2 text-xs font-sans">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Full Name:</span>
                  <span className="text-slate-900 dark:text-white font-bold text-sm font-display">{selectedEmployee.full_name}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Employee ID:</span>
                  <span className="text-orange-600 font-mono font-bold text-sm">{selectedEmployee.employee_id}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Email Address:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{selectedEmployee.email}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Phone Number:</span>
                  <span className="text-slate-900 dark:text-white font-medium">{selectedEmployee.phone || "N/A"}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Department:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{selectedEmployee.department}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Designation:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{selectedEmployee.designation}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Account Status:</span>
                  <span className="text-emerald-500 font-bold">{selectedEmployee.status || "Active"}</span>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-bold block">Joining Date:</span>
                  <span className="text-slate-900 dark:text-white font-mono">{selectedEmployee.joining_date ? new Date(selectedEmployee.joining_date).toLocaleDateString() : "N/A"}</span>
                </div>
              </div>
            )}

            {/* TAB 2: Attendance History & Full Proof Gallery */}
            {activeTab === "attendance" && (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1 text-xs">
                {fetchingHistory ? (
                  <div className="py-8 text-center"><LoadingSpinner size="md" /></div>
                ) : empAttendanceHistory.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 font-mono">No attendance records found for this employee.</div>
                ) : (
                  empAttendanceHistory.map((att) => (
                    <div key={att.id} className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-3 font-sans">
                      {/* Title & Status */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                        <div className="font-extrabold text-slate-900 dark:text-white font-display text-sm">
                          {att.date} <span className="text-slate-500 text-xs font-normal">({att.location_name || "Office Site"})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                            att.status === "Present" ? "bg-emerald-100 text-emerald-800" : att.status === "Absent" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {att.status || "Pending Approval"}
                          </span>
                        </div>
                      </div>

                      {/* Timestamps, Hours & GPS */}
                      <div className="grid gap-2 grid-cols-2 sm:grid-cols-4 text-[11px] font-mono bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div>
                          <span className="text-slate-400 block font-sans text-[10px]">Check-In:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-bold">{formatTime(att.check_in_time || att.check_in)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans text-[10px]">Check-Out:</span>
                          <span className="text-slate-800 dark:text-slate-200 font-bold">{formatTime(att.check_out_time || att.check_out)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans text-[10px]">Working Hours:</span>
                          <span className="text-orange-600 font-bold">{att.working_hours || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-sans text-[10px]">GPS Geofence:</span>
                          <span className={att.is_inside_geofence ? "text-emerald-600 font-bold" : "text-amber-500 font-bold"}>
                            {att.is_inside_geofence ? "Inside Zone" : "Outside Zone"}
                          </span>
                        </div>
                      </div>

                      {/* GPS & Admin Notes */}
                      {(att.address || att.location_name || att.admin_notes || att.remarks) && (
                        <div className="space-y-1 text-[11px] font-sans bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                          {(att.address || att.location_name) && (
                            <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                              <FiMapPin className="text-emerald-600 shrink-0" />
                              <span><strong className="font-bold">Location:</strong> {att.address || att.location_name}</span>
                            </div>
                          )}
                          {(att.admin_notes || att.remarks) && (
                            <div className="text-slate-600 dark:text-slate-400 pt-0.5">
                              <strong className="font-bold text-slate-800 dark:text-slate-200">Admin Notes:</strong> {att.admin_notes || att.remarks}
                            </div>
                          )}
                        </div>
                      )}

                      {/* All 6 Media Proof Grid */}
                      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                        {/* 1. Check-In Selfie */}
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">Check-In Selfie</span>
                          {getImageUrl(att.selfie_url || att.photo_url) ? (
                            <div className="relative group">
                              <img
                                src={getImageUrl(att.selfie_url || att.photo_url)}
                                alt="Check-In Selfie"
                                onClick={() => openLightboxForAttRecord(att, att.selfie_url || att.photo_url)}
                                className="h-24 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-90 transition"
                              />
                              <button
                                type="button"
                                onClick={() => openLightboxForAttRecord(att, att.selfie_url || att.photo_url)}
                                className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-lg text-[10px] opacity-80 hover:opacity-100"
                              >
                                <FiMaximize2 />
                              </button>
                            </div>
                          ) : (
                            <div className="h-24 w-full rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                              <FiImage className="h-4 w-4 mb-0.5 opacity-50" />
                              <span className="text-[10px]">No Photo Uploaded</span>
                            </div>
                          )}
                        </div>

                        {/* 2. Check-In Work Photo */}
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">Check-In Work Photo</span>
                          {getImageUrl(att.work_photo_url) ? (
                            <div className="relative group">
                              <img
                                src={getImageUrl(att.work_photo_url)}
                                alt="Work Photo"
                                onClick={() => openLightboxForAttRecord(att, att.work_photo_url)}
                                className="h-24 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-90 transition"
                              />
                              <button
                                type="button"
                                onClick={() => openLightboxForAttRecord(att, att.work_photo_url)}
                                className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-lg text-[10px] opacity-80 hover:opacity-100"
                              >
                                <FiMaximize2 />
                              </button>
                            </div>
                          ) : (
                            <div className="h-24 w-full rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                              <FiImage className="h-4 w-4 mb-0.5 opacity-50" />
                              <span className="text-[10px]">No Photo Uploaded</span>
                            </div>
                          )}
                        </div>

                        {/* 3. Checkout Selfie */}
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">Checkout Selfie</span>
                          {getImageUrl(att.checkout_selfie_url) ? (
                            <div className="relative group">
                              <img
                                src={getImageUrl(att.checkout_selfie_url)}
                                alt="Checkout Selfie"
                                onClick={() => openLightboxForAttRecord(att, att.checkout_selfie_url)}
                                className="h-24 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-90 transition"
                              />
                              <button
                                type="button"
                                onClick={() => openLightboxForAttRecord(att, att.checkout_selfie_url)}
                                className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-lg text-[10px] opacity-80 hover:opacity-100"
                              >
                                <FiMaximize2 />
                              </button>
                            </div>
                          ) : (
                            <div className="h-24 w-full rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                              <FiImage className="h-4 w-4 mb-0.5 opacity-50" />
                              <span className="text-[10px]">No Photo Uploaded</span>
                            </div>
                          )}
                        </div>

                        {/* 4. Checkout Work Photo */}
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">Checkout Work Photo</span>
                          {getImageUrl(att.checkout_work_photo_url) ? (
                            <div className="relative group">
                              <img
                                src={getImageUrl(att.checkout_work_photo_url)}
                                alt="Checkout Photo"
                                onClick={() => openLightboxForAttRecord(att, att.checkout_work_photo_url)}
                                className="h-24 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:opacity-90 transition"
                              />
                              <button
                                type="button"
                                onClick={() => openLightboxForAttRecord(att, att.checkout_work_photo_url)}
                                className="absolute bottom-1 right-1 p-1 bg-black/60 text-white rounded-lg text-[10px] opacity-80 hover:opacity-100"
                              >
                                <FiMaximize2 />
                              </button>
                            </div>
                          ) : (
                            <div className="h-24 w-full rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                              <FiImage className="h-4 w-4 mb-0.5 opacity-50" />
                              <span className="text-[10px]">No Photo Uploaded</span>
                            </div>
                          )}
                        </div>

                        {/* 5. Check-In Work Video */}
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">Check-In Work Video</span>
                          {getImageUrl(att.work_video_url) ? (
                            <VideoPlayer src={att.work_video_url} className="w-full" />
                          ) : (
                            <div className="h-24 w-full rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                              <FiFilm className="h-4 w-4 mb-0.5 opacity-50" />
                              <span className="text-[10px]">No Video Uploaded</span>
                            </div>
                          )}
                        </div>

                        {/* 6. Checkout Work Video */}
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">Checkout Work Video</span>
                          {getImageUrl(att.checkout_work_video_url) ? (
                            <VideoPlayer src={att.checkout_work_video_url} className="w-full" />
                          ) : (
                            <div className="h-24 w-full rounded-xl bg-slate-200/50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                              <FiFilm className="h-4 w-4 mb-0.5 opacity-50" />
                              <span className="text-[10px]">No Video Uploaded</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: Digital ID Card */}
            {activeTab === "idcard" && (
              <DigitalIdCard employee={selectedEmployee} />
            )}

            {/* Close Button */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedEmployee(null)}
                className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-6 py-3 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition min-h-[44px]"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/85 p-4 backdrop-blur-sm">
          <div className="relative max-w-md w-full rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-2xl text-slate-900 dark:text-slate-200 font-sans">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 text-rose-600">
              <FiAlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-extrabold font-display">Delete Employee Account?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Are you sure you want to permanently delete employee <strong className="text-slate-900 dark:text-white font-extrabold">{deleteConfirmEmp.full_name}</strong> (ID: <span className="font-mono text-orange-600 font-bold">{deleteConfirmEmp.employee_id}</span>)?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 font-sans">
              <button onClick={() => setDeleteConfirmEmp(null)} className="rounded-2xl bg-slate-100 dark:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 min-h-[44px]">Cancel</button>
              <button onClick={() => { onDelete(deleteConfirmEmp.employee_id); setDeleteConfirmEmp(null); }} className="rounded-2xl bg-rose-600 px-6 py-2.5 text-xs font-bold text-white min-h-[44px]">Permanently Delete</button>
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

export default EmployeeTable;
