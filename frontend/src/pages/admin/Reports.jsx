import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiBarChart2, FiFilter, FiTrendingUp } from "react-icons/fi";
import LoadingSpinner from "../../components/LoadingSpinner";
import ReportChart from "../../components/ReportChart";
import { adminService } from "../../services/attendanceService";

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ start_date: "", end_date: "" });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const [reportData, summaryData] = await Promise.all([
        adminService.getReports(params),
        adminService.getReportsSummary(),
      ]);
      setReports(reportData);
      setSummary(summaryData);
    } catch {
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleFilter = (e) => {
    e.preventDefault();
    fetchReports();
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
          <FiBarChart2 className="text-orange-600 dark:text-orange-400" /> Attendance Reports & Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">Analyze organization-wide attendance trends, department stats, and rates</p>
      </div>

      {summary && (
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <FiTrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Weekly Present</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-display">
                  {summary.weekly_present}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800">
                <FiBarChart2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Monthly Present</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-0.5 font-display">
                  {summary.monthly_present}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleFilter} className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            Start Date
          </label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
            End Date
          </label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium"
          />
        </div>
        <button type="submit" className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition">
          <FiFilter /> Generate Report
        </button>
      </form>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <ReportChart reports={reports} />

          {summary?.department_stats && (
            <div className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white font-display">
                Department Stats (Today)
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(summary.department_stats).map(([dept, stats]) => (
                  <div key={dept} className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
                    <p className="font-extrabold text-xs text-slate-900 dark:text-white font-display">{dept}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {stats.present} / {stats.total} present
                    </p>
                    <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-orange-600"
                        style={{
                          width: `${stats.total ? (stats.present / stats.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 text-xs font-extrabold uppercase text-slate-600 dark:text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Total Days</th>
                    <th className="px-6 py-4">Present</th>
                    <th className="px-6 py-4">Absent</th>
                    <th className="px-6 py-4">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium bg-white dark:bg-slate-900">
                  {reports.map((report) => (
                    <tr key={report.employee_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <p className="font-extrabold text-slate-900 dark:text-white font-display">{report.full_name}</p>
                        <p className="font-mono text-orange-600 dark:text-orange-400 font-bold">{report.employee_id}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{report.department}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-bold">{report.total_days}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">
                        {report.present_days}
                      </td>
                      <td className="px-6 py-4 font-bold text-rose-600 dark:text-rose-400">
                        {report.absent_days}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-orange-600 dark:text-orange-400 font-mono">
                        {report.total_days
                          ? Math.round((report.present_days / report.total_days) * 100)
                          : 0}
                        %
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

export default Reports;
