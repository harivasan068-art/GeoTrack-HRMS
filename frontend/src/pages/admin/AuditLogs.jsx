import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiClock, FiLock, FiRefreshCw, FiShield, FiUserCheck } from "react-icons/fi";
import LoadingSpinner from "../../components/LoadingSpinner";
import { adminService } from "../../services/attendanceService";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAuditLogs();
      setLogs(data);
    } catch {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FiLock className="text-indigo-600 dark:text-indigo-400" /> Enterprise Audit Trail Logs
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Immutable tracking of all admin approvals, attendance rejections, employee updates, and company settings changes.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 shadow-sm"
        >
          <FiRefreshCw className="h-3.5 w-3.5" /> Refresh Audit Trail
        </button>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-950 text-xs font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">Action Executed</th>
                <th className="px-4 py-3.5">Target Employee ID</th>
                <th className="px-4 py-3.5">Admin User</th>
                <th className="px-4 py-3.5">Remarks / Details</th>
                <th className="px-4 py-3.5 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-medium bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <LoadingSpinner size="md" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No audit log records found.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono text-slate-400 dark:text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <FiShield className="text-indigo-600 dark:text-indigo-400 shrink-0" /> {log.action}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-300">{log.employee_id || "System N/A"}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-200">{log.admin_name}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">{log.remarks || "--"}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500 dark:text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogs;
