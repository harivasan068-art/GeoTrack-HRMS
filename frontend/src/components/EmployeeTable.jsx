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
      <div className="flex flex-col gap-4 rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between shadow-sm">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search employee name, ID, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-11 pr-4 py-3 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none font-medium"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-bold">
              <FiFilter /> Dept:
            </span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3.5 py-3 min-h-[48px] text-xs font-bold text-slate-700 dark:text-slate-300 focus:border-orange-500 focus:outline-none"
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
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3 min-h-[48px] text-xs font-extrabold text-white shadow-md hover:from-orange-500 hover:to-amber-500 transition"
            >
              <FiUserPlus className="h-4 w-4" /> Register Employee
            </button>
          )}
        </div>
      </div>

      {/* MOBILE CARD VIEW (Visible on Small Screens < md) */}
      <div className="grid gap-3 md:hidden">
        {filteredEmployees.length === 0 ? (
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 text-center border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold text-slate-500">
            No employee records match search criteria.
          </div>
        ) : (
          filteredEmployees.map((emp) => {
            const isAdmin = emp.designation?.toLowerCase() === "admin";
            return (
              <div
                key={emp.id || emp.employee_id}
                className="rounded-3xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={getImageUrl(emp.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                      alt={emp.full_name}
                      className="h-12 w-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                    />
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white font-display flex items-center gap-1.5">
                        {emp.full_name}
                        {isAdmin && (
                          <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[9px] font-extrabold text-orange-600 dark:text-orange-400 border border-orange-500/20 uppercase font-mono">
                            Admin
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{emp.designation} &bull; {emp.department}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-xl border border-orange-500/20">
                    {emp.employee_id}
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 font-medium bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 truncate">
                    <FiMail className="text-slate-400 shrink-0" /> {emp.email}
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <FiPhone className="text-slate-400 shrink-0" /> {emp.phone}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setSelectedEmployee(emp)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition min-h-[40px]"
                  >
                    <FiEye className="h-4 w-4" /> Digital ID
                  </button>

                  <button
                    onClick={() => setDeleteConfirmEmp(emp)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 px-3.5 py-2 text-xs font-extrabold text-rose-600 hover:bg-rose-600 hover:text-white transition min-h-[40px]"
                  >
                    <FiTrash2 className="h-4 w-4" /> Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DESKTOP TABLE VIEW (Visible on Screens >= md) */}
      <div className="hidden md:block overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950/90 text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4">Employee Details</th>
                <th className="px-5 py-4">Employee ID</th>
                <th className="px-5 py-4">Department & Role</th>
                <th className="px-5 py-4">Contact Details</th>
                <th className="px-5 py-4 text-center">Account Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-medium bg-white dark:bg-slate-900">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400 font-bold">
                    No employee records match the search criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const isAdmin = emp.designation?.toLowerCase() === "admin";
                  return (
                    <tr key={emp.id || emp.employee_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(emp.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                            alt={emp.full_name}
                            className="h-10 w-10 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 font-display">
                              {emp.full_name}
                              {isAdmin && (
                                <span className="rounded-full bg-orange-500/10 px-2 py-0.5 text-[9px] font-extrabold text-orange-600 dark:text-orange-400 border border-orange-500/20 uppercase font-mono">
                                  Admin
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              Joined {emp.joining_date ? new Date(emp.joining_date).toLocaleDateString() : "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 font-mono font-bold text-orange-600 dark:text-orange-400">
                        {emp.employee_id}
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-200">{emp.department}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{emp.designation}</div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                          <FiMail className="text-slate-400 shrink-0" /> {emp.email}
                        </div>
                        {emp.phone && (
                          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                            <FiPhone className="text-slate-400 shrink-0" /> {emp.phone}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <FiUserCheck className="h-3 w-3" /> Active
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedEmployee(emp)}
                            className="rounded-xl bg-slate-100 dark:bg-slate-800 p-2 text-slate-700 dark:text-slate-300 hover:bg-orange-600 hover:text-white transition"
                            title="View Digital ID"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmEmp(emp)}
                            className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-2 text-rose-600 hover:bg-rose-600 hover:text-white transition"
                            title="Delete Employee"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
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

      {/* Digital ID Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase font-mono">Employee Digital ID</span>
              <button onClick={() => setSelectedEmployee(null)} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <FiX className="h-5 w-5" />
              </button>
            </div>
            <DigitalIdCard employee={selectedEmployee} />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 font-extrabold text-sm">
              <FiAlertTriangle className="h-6 w-6 shrink-0" /> Confirm Employee Deletion
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              Are you sure you want to delete employee <strong>'{deleteConfirmEmp.full_name}'</strong> ({deleteConfirmEmp.employee_id})? This will permanently erase their profile and attendance logs.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmEmp(null)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirmEmp.employee_id || deleteConfirmEmp.id, deleteConfirmEmp.full_name);
                  setDeleteConfirmEmp(null);
                }}
                className="rounded-2xl bg-rose-600 px-5 py-2.5 text-xs font-extrabold text-white shadow hover:bg-rose-700 transition"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTable;
