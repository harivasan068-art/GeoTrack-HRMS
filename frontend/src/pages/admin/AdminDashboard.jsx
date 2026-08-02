import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiActivity,
  FiAlertCircle,
  FiBarChart2,
  FiCheckCircle,
  FiCheckSquare,
  FiClock,
  FiEdit,
  FiMapPin,
  FiPieChart,
  FiShield,
  FiTrash2,
  FiUserCheck,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/LoadingSpinner";
import AdminProfileModal from "../../components/AdminProfileModal";
import { adminService } from "../../services/attendanceService";
import { useAuth } from "../../hooks/useAuth";
import { getImageUrl } from "../../services/api";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [employeeList, setEmployeeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

  const fetchDashboard = async () => {
    try {
      const [result, emps] = await Promise.all([
        adminService.getDashboard(),
        adminService.getEmployees(),
      ]);
      setData(result);
      setEmployeeList(Array.isArray(emps) ? emps : []);
    } catch {
      setData(null);
      setEmployeeList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleDeleteEmployee = async (empId, empName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete employee '${empName}' (${empId})? This action will remove all their attendance logs and cannot be undone.`
      )
    )
      return;

    setDeleteLoadingId(empId);
    try {
      await adminService.deleteEmployee(empId);
      toast.success(`Deleted employee '${empName}' (${empId})`);
      fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to delete employee");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const totalEmps = data?.total_employees || 1;
  const presentCount = data?.present_today || 0;
  const attendanceRate = Math.round((presentCount / totalEmps) * 100);

  const stats = [
    {
      label: "Total Employees",
      value: data?.total_employees || 0,
      icon: FiUsers,
      color: "bg-blue-50 text-blue-600 border border-blue-200",
    },
    {
      label: "Approved Present Today",
      value: data?.present_today || 0,
      icon: FiCheckCircle,
      color: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    },
    {
      label: "Pending Approvals",
      value: data?.pending_approvals || 0,
      icon: FiCheckSquare,
      color: "bg-amber-50 text-amber-600 border border-amber-200",
    },
    {
      label: "Absent Today",
      value: data?.absent_today || 0,
      icon: FiXCircle,
      color: "bg-rose-50 text-rose-600 border border-rose-200",
    },
    {
      label: "Attendance Rate",
      value: `${attendanceRate}%`,
      icon: FiPieChart,
      color: "bg-orange-50 text-orange-600 border border-orange-200 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-800",
    },
    {
      label: "Checked Out Today",
      value: data?.checked_out_today || 0,
      icon: FiClock,
      color: "bg-cyan-50 text-cyan-600 border border-cyan-200",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Executive Header Console */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-widest font-mono">
            <FiActivity className="animate-pulse" /> Live HR Command Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 font-display">
            Enterprise HRMS Analytics
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Real-time workforce attendance metrics, geofence verification & approval sheet
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-sm font-sans"
          >
            <FiUserCheck className="h-4 w-4 text-orange-600 dark:text-orange-400" /> Edit Admin Profile
          </button>
          <Link
            to="/admin/verifications"
            className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-600/20 hover:bg-orange-700 transition font-sans"
          >
            <FiCheckSquare className="h-4 w-4" /> Open Verification Sheet
          </Link>
        </div>
      </div>

      {/* Admin Overview Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={getImageUrl(user?.photo) || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"}
              alt="Admin Avatar"
              className="h-16 w-16 object-cover rounded-2xl border-2 border-white/80 shadow-xl ring-4 ring-white/10 shrink-0"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80";
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white font-display">{user?.full_name || "Administrator"}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/30 border border-orange-400/40 px-2.5 py-0.5 text-[10px] font-bold text-orange-200 uppercase tracking-wider backdrop-blur-md font-mono">
                  <FiShield /> Super Admin
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-1">
                Email: <span className="text-white">{user?.email || "admin@geotrack.com"}</span> &bull; ID: <span className="text-orange-400 font-bold">{user?.employee_id || "EMP001"}</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white hover:text-slate-900 transition font-sans"
          >
            <FiEdit className="h-3.5 w-3.5" /> Edit Settings & Password
          </button>
        </div>
      </div>

      {/* Pending Approvals Alert Banner */}
      {data?.pending_approvals > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl bg-amber-50 dark:bg-amber-950/40 p-5 border border-amber-200 dark:border-amber-800 shadow-sm font-sans">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-2xl bg-amber-500 text-white border border-amber-600 flex items-center justify-center shrink-0 shadow-sm">
              <FiCheckSquare className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-300 font-display">
                {data.pending_approvals} Attendance Submissions Pending Verification
              </div>
              <div className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-0.5 font-medium">
                Review selfie proofs, reverse geocoded customer addresses, and mark Present or Absent.
              </div>
            </div>
          </div>
          <Link
            to="/admin/verifications"
            className="shrink-0 rounded-2xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-400 shadow-md transition font-sans"
          >
            Review Submissions &rarr;
          </Link>
        </div>
      )}

      {/* 6 Executive Stats Cards - Light Corporate Theme */}
      <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-3 font-sans">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="group rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 transition-all duration-300 shadow-sm hover:shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] sm:text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{label}</p>
              <div className={`rounded-2xl p-2 sm:p-3 ${color} shrink-0 group-hover:scale-110 transition`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Attendance Logs Today */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm font-sans">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-display">
            <FiClock className="text-emerald-600 dark:text-emerald-400" /> Today's Attendance Logs
          </h2>
          <Link to="/admin/verifications" className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 font-bold hover:underline">
            View All in Approval Sheet &rarr;
          </Link>
        </div>

        {!data?.recent_attendance?.length ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-8 text-center">No attendance submissions recorded today</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-3.5">Employee ID</th>
                  <th className="p-3.5">Check-In</th>
                  <th className="p-3.5">Location Site</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium bg-white dark:bg-slate-900">
                {data.recent_attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3.5 font-mono font-bold text-orange-600 dark:text-orange-400">{record.employee_id}</td>
                    <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-mono font-bold">{formatTime(record.check_in)}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-semibold">
                      <FiMapPin className="text-orange-600 dark:text-orange-400 shrink-0" />
                      <span className="truncate">{record.location_name || "Office HQ"}</span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 font-extrabold text-[10px] ${
                        record.status === "Present"
                          ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : record.status === "Absent"
                          ? "bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                          : "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                      }`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registered Employees Directory Overview */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-display">
              <FiUsers className="text-orange-600 dark:text-orange-400" /> Employee Directory Overview
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">Inspect active employees, department assignments, and roles</p>
          </div>
          <Link to="/admin/employees" className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 font-bold hover:underline">
            Manage Directory ({employeeList.length}) &rarr;
          </Link>
        </div>

        {!employeeList.length ? (
          <p className="text-xs text-slate-500 py-8 text-center">No employee records found</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 uppercase font-bold text-[11px]">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Department & Role</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium bg-white dark:bg-slate-900">
                {employeeList.slice(0, 5).map((emp) => {
                  const isAdmin = emp.designation?.toLowerCase() === "admin";
                  return (
                    <tr key={emp.id || emp.employee_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(emp.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                            alt={emp.full_name}
                            className="h-9 w-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                            }}
                          />
                          <span className="font-bold text-slate-900 dark:text-white">{emp.full_name}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-orange-600 dark:text-orange-400 font-bold">{emp.employee_id}</td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">{emp.department} &bull; {emp.designation}</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono">{emp.email}</td>
                      <td className="p-3.5 text-center">
                        {!isAdmin ? (
                          <button
                            disabled={deleteLoadingId === emp.employee_id}
                            onClick={() => handleDeleteEmployee(emp.employee_id, emp.full_name)}
                            className="inline-flex items-center gap-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-600 hover:text-white transition disabled:opacity-30 min-h-[44px]"
                            title="Delete this employee account"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic font-semibold">Protected Admin</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Admin Profile Modal */}
      <AdminProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
    </div>
  );
};

export default AdminDashboard;
