import { FiPrinter, FiShield } from "react-icons/fi";
import { useBranding } from "../context/BrandingContext";

const DigitalIdCard = ({ employee }) => {
  const { company } = useBranding();

  if (!employee) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EMP:${employee.employee_id}|NAME:${encodeURIComponent(employee.full_name)}|DEPT:${encodeURIComponent(employee.department)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Printable ID Card Container */}
      <div className="print-area mx-auto max-w-sm overflow-hidden rounded-3xl bg-slate-900 border-2 border-slate-700 shadow-2xl text-slate-100 font-sans">
        {/* Card Header Header Band */}
        <div
          style={{ backgroundColor: company?.theme_color || "#4f46e5" }}
          className="p-5 text-center text-white relative overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2">
            {company?.company_logo && (
              <img src={company.company_logo} alt="Logo" className="h-7 w-7 object-contain rounded" />
            )}
            <span className="font-extrabold text-lg tracking-wide">{company?.company_name || "GeoTrack HRMS"}</span>
          </div>
          <div className="text-[10px] font-medium tracking-widest uppercase opacity-80 mt-0.5">
            Official Employee Identity Card
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 text-center space-y-4">
          {/* Profile Photo */}
          <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-2xl border-4 border-slate-700 shadow-lg bg-slate-800">
            <img
              src={getImageUrl(employee.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
              alt={employee.full_name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
              }}
            />
          </div>

          {/* Name & Designation */}
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">{employee.full_name}</h2>
            <p className="text-xs font-semibold text-indigo-400 mt-0.5">{employee.designation}</p>
          </div>

          {/* Details Table */}
          <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-left text-xs space-y-1.5 font-sans">
            <div className="flex justify-between">
              <span className="text-slate-400">Employee ID:</span>
              <span className="font-mono font-bold text-indigo-300">{employee.employee_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Department:</span>
              <span className="font-medium text-slate-200">{employee.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Joining Date:</span>
              <span className="font-medium text-slate-200">{employee.joining_date || "2023-01-15"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <FiShield /> Verified Active
              </span>
            </div>
          </div>

          {/* QR Code & Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-left">
            <div>
              <div className="text-[10px] text-slate-400">Authorized Signature</div>
              <div className="font-serif italic text-xs text-indigo-300 mt-1">HR Command Console</div>
            </div>
            <img src={qrUrl} alt="QR Code" className="h-14 w-14 rounded-lg bg-white p-1 shadow" />
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="text-center no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition border border-slate-700"
        >
          <FiPrinter className="h-4 w-4 text-indigo-400" /> Print / Save PDF ID Card
        </button>
      </div>
    </div>
  );
};

export default DigitalIdCard;
