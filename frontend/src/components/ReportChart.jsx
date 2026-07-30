const ReportChart = ({ reports }) => {
  if (!reports.length) {
    return (
      <div className="card text-center">
        <p className="text-slate-500">No report data available</p>
      </div>
    );
  }

  const maxPresent = Math.max(...reports.map((r) => r.present_days), 1);

  return (
    <div className="card">
      <h3 className="mb-6 text-lg font-semibold text-slate-900">Attendance Overview</h3>
      <div className="space-y-4">
        {reports.map((report) => {
          const percentage = Math.round((report.present_days / report.total_days) * 100);
          const barWidth = (report.present_days / maxPresent) * 100;

          return (
            <div key={report.employee_id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-slate-900">{report.full_name}</span>
                  <span className="ml-2 text-slate-500">{report.department}</span>
                </div>
                <span className="font-semibold text-primary-600">{percentage}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary-600 transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-slate-400">
                <span>Present: {report.present_days} days</span>
                <span>Absent: {report.absent_days} days</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReportChart;
