import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
  FiChevronRight,
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
    if (!dateStr) return "--:--";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
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
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    },
    {
      label: "Approved Present",
      value: data?.present_today || 0,
      icon: FiCheckCircle,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    },
    {
      label: "Pending Approvals",
      value: data?.pending_approvals || 0,
      icon: FiCheckSquare,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    },
    {
      label: "Absent Today",
      value: data?.absent_today || 0,
      icon: FiXCircle,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    },
    {
      label: "Attendance Rate",
      value: `${attendanceRate}%`,
      icon: FiPieChart,
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
    },
    {
      label: "Checked Out",
      value: data?.checked_out_today || 0,
      icon: FiClock,
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
    },
  ];

  return (
    <div className="space-y-6 font-sans pb-16">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider font-mono">
            <FiActivity className="animate-pulse" /> Live HR Command Console
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 font-display">
            Enterprise HR Analytics
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Real-time workforce attendance metrics, geofence verification & approval sheet
          </p>
        </div>

        <Link to="/admin/verifications">
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3 min-h-[48px] text-xs font-extrabold text-white shadow-lg shadow-orange-600/25 hover:from-orange-500 hover:to-amber-500 transition"
          >
            <FiCheckSquare className="h-4 w-4" /> Go to Verification Sheet
          </motion.button>
        </Link>
      </div>

      {/* Stats Cards Grid (2 cols on mobile, 3/6 on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <motion.div
              key={st.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-3xl bg-white dark:bg-slate-900 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 line-clamp-1">{st.label}</span>
                <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${st.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white font-display">
                {st.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Access Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Link to="/admin/verifications">
          <div className="rounded-3xl bg-gradient-to-r from-orange-600 to-amber-600 p-5 text-white shadow-lg shadow-orange-600/20 flex items-center justify-between min-h-[72px]">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
                <FiCheckSquare className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm font-display">Attendance Review Sheet</h3>
                <p className="text-[11px] text-white/80 font-medium">{data?.pending_approvals || 0} pending review</p>
              </div>
            </div>
            <FiChevronRight className="h-5 w-5" />
          </div>
        </Link>

        <Link to="/admin/employees">
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between min-h-[72px]">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FiUsers className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm font-display">Manage Employees</h3>
                <p className="text-[11px] text-slate-500 font-medium">{employeeList.length} total staff</p>
              </div>
            </div>
            <FiChevronRight className="h-5 w-5 text-slate-400" />
          </div>
        </Link>

        <Link to="/admin/settings">
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-5 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between min-h-[72px]">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <FiMapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm font-display">Company Geofence</h3>
                <p className="text-[11px] text-slate-500 font-medium">Configure office GPS radius</p>
              </div>
            </div>
            <FiChevronRight className="h-5 w-5 text-slate-400" />
          </div>
        </Link>
      </div>

      {/* Employee Directory Summary (Cards on mobile, table on desktop) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <FiUsers className="text-orange-600" /> Recent Employees Directory ({employeeList.length})
          </h2>
          <Link to="/admin/employees" className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline">
            View All &rarr;
          </Link>
        </div>

        {/* Mobile View: Responsive Cards Grid */}
        <div className="grid gap-3 sm:hidden">
          {employeeList.slice(0, 5).map((emp) => (
            <div key={emp.id} className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={getImageUrl(emp.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                  alt={emp.full_name}
                  className="h-11 w-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="truncate">
                  <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{emp.full_name}</h4>
                  <p className="text-[10px] text-slate-500 font-medium truncate">{emp.designation} &bull; {emp.department}</p>
                  <p className="text-[10px] text-orange-600 font-mono font-bold">ID: {emp.employee_id}</p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}
                disabled={deleteLoadingId === emp.id}
                className="rounded-xl p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Delete Employee"
              >
                {deleteLoadingId === emp.id ? <LoadingSpinner size="sm" /> : <FiTrash2 className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>

        {/* Desktop View: Clean Table */}
        <div className="hidden sm:block rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-mono font-extrabold uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">ID</th>
                <th className="p-4">Department</th>
                <th className="p-4">Designation</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {employeeList.slice(0, 6).map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={getImageUrl(emp.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                      alt={emp.full_name}
                      className="h-9 w-9 rounded-xl object-cover border shrink-0"
                    />
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block">{emp.full_name}</span>
                      <span className="text-[10px] text-slate-400">{emp.email}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-bold text-orange-600">{emp.employee_id}</td>
                  <td className="p-4">{emp.department}</td>
                  <td className="p-4">{emp.designation}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteEmployee(emp.id, emp.full_name)}
                      disabled={deleteLoadingId === emp.id}
                      className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold hover:underline"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AdminProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
    </div>
  );
};

export default AdminDashboard;
