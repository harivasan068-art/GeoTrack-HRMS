import { useState } from "react";
import {
  FiAlertTriangle,
  FiCalendar,
  FiEye,
  FiFilter,
  FiMail,
  FiPhone,
  FiSearch,
  FiShield,
  FiTrash2,
  FiUserCheck,
  FiUserPlus,
  FiX,
} from "react-icons/fi";
import { getImageUrl } from "../services/api";
import DigitalIdCard from "./DigitalIdCard";

const EmployeeTable = ({ employees = [], onDelete, loading, onAddEmployee }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [deleteConfirmEmp, setDeleteConfirmEmp] = useState(null);

  // Get list of unique departments
  const departments = ["all", ...new Set(employees.map((e) => e.department).filter(Boolean))];

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      departmentFilter === "all" ||
      emp.department?.toLowerCase() === departmentFilter.toLowerCase();

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Search & Filter Header Bar */}
      <div className="flex flex-col gap-4 rounded-2xl bg-slate-900 p-4 border border-slate-800 sm:flex-row sm:items-center sm:justify-between shadow-xl">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by employee name, ID, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <FiFilter /> Dept:
            </span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 focus:border-indigo-500 focus:outline-none"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "all" ? "All Departments" : dept}
                </option>
              ))}
            </select>
          </div>

          {onAddEmployee && (
            <button
              onClick={onAddEmployee}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
            >
              <FiUserPlus className="h-4 w-4" /> Register New Employee
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4">Employee Details</th>
                <th className="px-5 py-4">Employee ID</th>
                <th className="px-5 py-4">Department & Role</th>
                <th className="px-5 py-4">Contact Details</th>
                <th className="px-5 py-4 text-center">Account Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No employee records match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isAdmin = emp.designation?.toLowerCase() === "admin";
                  return (
                    <tr key={emp.id || emp.employee_id} className="hover:bg-slate-800/40 transition">
                      {/* Name & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(emp.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                            alt={emp.full_name}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-700 shadow-sm"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                            }}
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {emp.full_name}
                              {isAdmin && (
                                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] font-extrabold text-indigo-400 border border-indigo-500/30 uppercase">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Joined {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="px-5 py-3.5 font-mono font-bold text-indigo-400">
                        {emp.employee_id}
                      </td>

                      {/* Dept & Designation */}
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-200">{emp.department}</div>
                        <div className="text-[11px] text-slate-400">{emp.designation}</div>
                      </td>

                      {/* Contact */}
                      <td className="px-5 py-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <FiMail className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span className="truncate">{emp.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <FiPhone className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{emp.phone || "N/A"}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${
                            emp.status === "Active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {emp.status || "Active"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedEmployee(emp)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-950 px-3 py-1.5 text-xs font-semibold text-indigo-400 border border-slate-800 hover:border-indigo-500 hover:text-white transition"
                            title="Inspect Employee Profile & ID Card"
                          >
                            <FiEye className="h-3.5 w-3.5" /> Details
                          </button>

                          {!isAdmin ? (
                            <button
                              onClick={() => setDeleteConfirmEmp(emp)}
                              disabled={loading}
                              className="inline-flex items-center gap-1 rounded-lg bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition disabled:opacity-30"
                              title="Delete employee account permanently"
                            >
                              <FiTrash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 italic px-2">System Admin</span>
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
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
          <div className="relative max-w-md w-full rounded-2xl bg-slate-900 p-6 border border-slate-800 space-y-4 shadow-2xl text-slate-200">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 text-rose-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/30">
                <FiAlertTriangle className="h-5 w-5 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Employee Account?</h3>
                <p className="text-xs text-rose-300/80">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to permanently delete employee{" "}
              <strong className="text-white">{deleteConfirmEmp.full_name}</strong> (ID:{" "}
              <span className="font-mono text-indigo-400">{deleteConfirmEmp.employee_id}</span>)?
              <br />
              <span className="text-slate-400 mt-2 block">
                All associated attendance logs, check-in selfies, and records for this employee will be deleted from the database.
              </span>
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setDeleteConfirmEmp(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirmEmp.employee_id);
                  setDeleteConfirmEmp(null);
                }}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-rose-500 transition disabled:opacity-50"
              >
                <FiTrash2 className="h-3.5 w-3.5" /> Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Inspection Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
          <div className="relative max-w-xl w-full rounded-3xl bg-slate-900 p-6 sm:p-8 border border-slate-800 space-y-6 shadow-2xl my-8 text-slate-200">
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <FiX className="h-6 w-6" />
            </button>

            <div className="text-center border-b border-slate-800 pb-4">
              <h3 className="text-xl font-bold text-white">Employee Profile & Digital ID</h3>
              <p className="text-xs text-indigo-400 font-mono mt-0.5">ID: {selectedEmployee.employee_id}</p>
            </div>

            {/* Digital ID Card Preview */}
            <DigitalIdCard employee={selectedEmployee} />

            {/* Action footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              {selectedEmployee.designation?.toLowerCase() !== "admin" ? (
                <button
                  onClick={() => {
                    const emp = selectedEmployee;
                    setSelectedEmployee(null);
                    setDeleteConfirmEmp(emp);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/10 px-4 py-2 text-xs font-bold text-rose-400 border border-rose-500/30 hover:bg-rose-600 hover:text-white transition"
                >
                  <FiTrash2 className="h-4 w-4" /> Delete Account
                </button>
              ) : (
                <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                  <FiShield /> Protected Admin Account
                </span>
              )}

              <button
                onClick={() => setSelectedEmployee(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
