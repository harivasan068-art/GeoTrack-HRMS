import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiBarChart2, FiTrendingUp } from "react-icons/fi";
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
    <div>
      <div className="mb-8">
        <h1 className="page-title">Attendance Reports</h1>
        <p className="page-subtitle">Analyze employee attendance data</p>
      </div>

      {summary && (
        <div className="mb-8 grid gap-6 sm:grid-cols-2">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-50 p-3 text-green-600">
                <FiTrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Weekly Present</p>
                <p className="text-2xl font-bold text-slate-900">
                  {summary.weekly_present}
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-50 p-3 text-blue-600">
                <FiBarChart2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Monthly Present</p>
                <p className="text-2xl font-bold text-slate-900">
                  {summary.monthly_present}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleFilter} className="card mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Start Date
          </label>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
            className="input-field"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            End Date
          </label>
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
            className="input-field"
          />
        </div>
        <button type="submit" className="btn-primary">
          Generate Report
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
            <div className="card mt-6">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">
                Department Stats (Today)
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(summary.department_stats).map(([dept, stats]) => (
                  <div key={dept} className="rounded-lg bg-slate-50 p-4">
                    <p className="font-medium text-slate-900">{dept}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {stats.present} / {stats.total} present
                    </p>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-primary-600"
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

          <div className="card mt-6 overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-slate-700">Employee</th>
                    <th className="px-6 py-3 font-semibold text-slate-700">Department</th>
                    <th className="px-6 py-3 font-semibold text-slate-700">Total Days</th>
                    <th className="px-6 py-3 font-semibold text-slate-700">Present</th>
                    <th className="px-6 py-3 font-semibold text-slate-700">Absent</th>
                    <th className="px-6 py-3 font-semibold text-slate-700">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {reports.map((report) => (
                    <tr key={report.employee_id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{report.full_name}</p>
                        <p className="text-xs text-slate-500">{report.employee_id}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{report.department}</td>
                      <td className="px-6 py-4 text-slate-600">{report.total_days}</td>
                      <td className="px-6 py-4 font-medium text-green-600">
                        {report.present_days}
                      </td>
                      <td className="px-6 py-4 font-medium text-red-600">
                        {report.absent_days}
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary-600">
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
