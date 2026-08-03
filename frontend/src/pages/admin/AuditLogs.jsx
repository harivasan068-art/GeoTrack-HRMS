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
      setLogs(data || []);
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
    <div className="mx-auto max-w-4xl space-y-6 font-sans pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
            <FiLock className="text-orange-600 dark:text-orange-400" /> Audit Trail Logs
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Immutable tracking of admin verifications, approvals, and system changes.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-900 px-4 py-3 min-h-[48px] text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <FiRefreshCw className="h-4 w-4" /> Refresh Logs
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 text-center border border-slate-200 dark:border-slate-800 shadow-sm text-xs font-bold text-slate-500">
          No audit log records recorded yet.
        </div>
      ) : (
        <>
          {/* Mobile View: Cards Grid */}
          <div className="grid gap-3 sm:hidden">
            {logs.map((log) => (
              <div key={log.id} className="rounded-2xl bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white font-display flex items-center gap-1.5">
                    <FiShield className="text-orange-600 shrink-0" /> {log.action}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(log.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                  <p><strong>Admin:</strong> {log.admin_name}</p>
                  <p><strong>Target ID:</strong> <span className="font-mono text-orange-600">{log.employee_id || "System"}</span></p>
                  {log.remarks && <p className="mt-1 text-slate-500"><strong>Note:</strong> {log.remarks}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View: Table */}
          <div className="hidden sm:block overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
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
                  {logs.map((log, idx) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
                        <FiShield className="text-orange-600 shrink-0" /> {log.action}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-orange-600">{log.employee_id || "System N/A"}</td>
                      <td className="px-4 py-3 font-bold text-slate-900 dark:text-slate-200">{log.admin_name}</td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 max-w-xs truncate">{log.remarks || "--"}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditLogs;
