import { FiClock, FiLogIn, FiLogOut, FiMapPin } from "react-icons/fi";

const AttendanceCard = ({ attendance, onCheckIn, onCheckOut, loading }) => {
  const formatTime = (dateStr) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isCheckedIn = attendance?.check_in;
  const isCheckedOut = attendance?.check_out;

  return (
    <div className="card">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Today&apos;s Attendance</h3>
          <p className="text-sm text-slate-500">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isCheckedOut
              ? "bg-green-100 text-green-700"
              : isCheckedIn
              ? "bg-yellow-100 text-yellow-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {isCheckedOut ? "Completed" : isCheckedIn ? "Checked In" : "Not Checked In"}
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-green-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-green-600">
            <FiLogIn className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Check In</span>
          </div>
          <p className="text-2xl font-bold text-green-700">
            {formatTime(attendance?.check_in)}
          </p>
        </div>
        <div className="rounded-lg bg-red-50 p-4">
          <div className="mb-2 flex items-center gap-2 text-red-600">
            <FiLogOut className="h-4 w-4" />
            <span className="text-xs font-medium uppercase">Check Out</span>
          </div>
          <p className="text-2xl font-bold text-red-700">
            {formatTime(attendance?.check_out)}
          </p>
        </div>
      </div>

      {attendance?.location_name && (
        <div className="mb-6 flex items-start gap-2 rounded-lg bg-slate-50 p-3">
          <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary-600" />
          <p className="text-sm text-slate-600">{attendance.location_name}</p>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCheckIn}
          disabled={loading || isCheckedIn}
          className="btn-primary flex-1"
        >
          <FiLogIn className="h-4 w-4" />
          Check In
        </button>
        <button
          onClick={onCheckOut}
          disabled={loading || !isCheckedIn || isCheckedOut}
          className="btn-danger flex-1"
        >
          <FiLogOut className="h-4 w-4" />
          Check Out
        </button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
        <FiClock className="h-3 w-3" />
        GPS location is required for check-in and check-out
      </div>
    </div>
  );
};

export default AttendanceCard;
