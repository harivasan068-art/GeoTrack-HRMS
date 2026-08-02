import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiAlertCircle,
  FiBarChart2,
  FiCheckCircle,
  FiCheckSquare,
  FiClock,
  FiEdit,
  FiMapPin,
  FiPieChart,
  FiShield,
  FiUserCheck,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import LoadingSpinner from "../../components/LoadingSpinner";
import AdminProfileModal from "../../components/AdminProfileModal";
import { adminService } from "../../services/attendanceService";
import { useAuth } from "../../hooks/useAuth";
import { getImageUrl } from "../../services/api";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const result = await adminService.getDashboard();
        setData(result);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

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
      color: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    },
    {
      label: "Approved Present Today",
      value: data?.present_today || 0,
      icon: FiCheckCircle,
      color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    },
    {
      label: "Pending Approvals",
      value: data?.pending_approvals || 0,
      icon: FiCheckSquare,
      color: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    },
    {
      label: "Absent Today",
      value: data?.absent_today || 0,
      icon: FiXCircle,
      color: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    },
    {
      label: "Attendance Rate",
      value: `${attendanceRate}%`,
      icon: FiPieChart,
      color: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    },
    {
      label: "Checked Out Today",
      value: data?.checked_out_today || 0,
      icon: FiClock,
      color: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Enterprise HRMS Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Real-time executive oversight, attendance rates, and pending approval items</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
          >
            <FiUserCheck className="h-4 w-4 text-indigo-400" /> Edit Admin Details
          </button>
          <Link
            to="/admin/verifications"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
          >
            <FiCheckSquare className="h-4 w-4" /> Open Approval Console
          </Link>
        </div>
      </div>

      {/* Admin Profile Overview Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-5 border border-slate-800 shadow-lg">
        <div className="flex items-center gap-4">
          <img
            src={getImageUrl(user?.photo) || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80"}
            alt="Admin Avatar"
            className="h-14 w-14 object-cover rounded-2xl border-2 border-indigo-500 shadow-md"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80";
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">{user?.full_name || "Administrator"}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-extrabold text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                <FiShield /> Super Admin
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Email: <span className="text-slate-200">{user?.email || "admin@geotrack.com"}</span> &bull; ID: <span className="text-indigo-400">{user?.employee_id || "EMP001"}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditProfileOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600/10 border border-indigo-500/30 px-4 py-2 text-xs font-bold text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
        >
          <FiEdit className="h-3.5 w-3.5" /> Edit Admin Profile & Password
        </button>
      </div>

      {/* Pending Approvals Alert Banner */}
      {data?.pending_approvals > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-amber-500/10 p-5 border border-amber-500/30">
          <div className="flex items-center gap-3">
            <FiCheckSquare className="h-6 w-6 text-amber-400 shrink-0" />
            <div>
              <div className="text-sm font-bold text-amber-300">
                {data.pending_approvals} Attendance Submissions Pending Verification
              </div>
              <div className="text-xs text-amber-200/80">
                Review selfie proofs, reverse geocoded addresses, and mark Present or Absent.
              </div>
            </div>
          </div>
          <Link
            to="/admin/verifications"
            className="shrink-0 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
          >
            Review Submissions
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl bg-slate-900 p-6 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">{label}</p>
                <p className="mt-2 text-3xl font-extrabold text-white">{value}</p>
              </div>
              <div className={`rounded-xl p-3.5 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Submissions Table */}
      <div className="rounded-2xl bg-slate-900 p-6 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Recent Attendance Logs Today</h2>
          <Link to="/admin/verifications" className="text-xs text-indigo-400 hover:underline">
            View All in Approval Sheet &rarr;
          </Link>
        </div>

        {!data?.recent_attendance?.length ? (
          <p className="text-sm text-slate-500 py-6 text-center">No attendance submissions recorded today</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="pb-3">Employee ID</th>
                  <th className="pb-3">Check-In</th>
                  <th className="pb-3">Location Site</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.recent_attendance.map((record) => (
                  <tr key={record.id}>
                    <td className="py-3 font-mono text-indigo-400">{record.employee_id}</td>
                    <td className="py-3 text-emerald-400 font-mono">{formatTime(record.check_in)}</td>
                    <td className="py-3 text-slate-300 flex items-center gap-1">
                      <FiMapPin className="text-indigo-400" /> {record.location_name || "Office HQ"}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 font-bold ${
                        record.status === "Present"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : record.status === "Absent"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
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

      {/* Admin Profile Modal */}
      <AdminProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
    </div>
  );
};

export default AdminDashboard;
