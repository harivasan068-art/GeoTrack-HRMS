import { FiPrinter, FiShield } from "react-icons/fi";
import { useBranding } from "../context/BrandingContext";
import { getImageUrl } from "../services/api";

const DigitalIdCard = ({ employee }) => {
  const { company } = useBranding();

  if (!employee) return null;

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=EMP:${employee.employee_id}|NAME:${encodeURIComponent(employee.full_name)}|DEPT:${encodeURIComponent(employee.department)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 font-sans">
      {/* Printable ID Card Container */}
      <div className="print-area mx-auto max-w-sm overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-xl text-slate-900 dark:text-slate-100">
        {/* Card Header Band */}
        <div
          style={{ backgroundColor: company?.theme_color || "#ea580c" }}
          className="p-5 text-center text-white relative overflow-hidden"
        >
          <div className="flex items-center justify-center gap-2">
            {company?.company_logo && (
              <img
                src={getImageUrl(company.company_logo)}
                alt="Logo"
                className="h-7 w-7 object-contain rounded"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <span className="font-extrabold text-lg tracking-wide font-display">{company?.company_name || "GeoTrack HRMS"}</span>
          </div>
          <div className="text-[10px] font-bold tracking-widest uppercase opacity-90 mt-0.5 font-mono">
            Official Employee Identity Card
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 text-center space-y-4">
          {/* Profile Photo */}
          <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-2xl border-4 border-slate-200 dark:border-slate-700 shadow-md bg-slate-100 dark:bg-slate-800">
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
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight font-display">{employee.full_name}</h2>
            <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5">{employee.designation}</p>
          </div>

          {/* Details Table */}
          <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Employee ID:</span>
              <span className="font-mono font-bold text-orange-600 dark:text-orange-400">{employee.employee_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Department:</span>
              <span className="font-bold text-slate-900 dark:text-slate-200">{employee.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Joining Date:</span>
              <span className="font-bold text-slate-900 dark:text-slate-200">{employee.joining_date || "2023-01-15"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-bold">Status:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                <FiShield /> Verified Active
              </span>
            </div>
          </div>

          {/* QR Code & Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-left">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Authorized Signature</div>
              <div className="font-serif italic text-xs text-orange-600 dark:text-orange-400 mt-1 font-bold">HR Command Console</div>
            </div>
            <img src={qrUrl} alt="QR Code" className="h-14 w-14 rounded-xl bg-white p-1 border border-slate-200 shadow-sm" />
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="text-center no-print">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-800 px-5 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-slate-700 shadow-sm font-sans"
        >
          <FiPrinter className="h-4 w-4 text-orange-600 dark:text-orange-400" /> Print / Save PDF ID Card
        </button>
      </div>
    </div>
  );
};

export default DigitalIdCard;
