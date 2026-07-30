import { FiMapPin } from "react-icons/fi";
import { useBranding } from "../context/BrandingContext";

const Branding = ({ size = "md", showSubtitle = true, dark = true }) => {
  const { company } = useBranding();

  const logoSizes = {
    sm: "h-7 w-7 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const titleSizes = {
    sm: "text-base font-bold",
    md: "text-lg font-bold",
    lg: "text-2xl font-extrabold",
  };

  return (
    <div className="flex items-center gap-3">
      {company?.company_logo ? (
        <img
          src={company.company_logo}
          alt={company.company_name || "Logo"}
          className={`${logoSizes[size]} object-contain rounded-xl border border-slate-800 shadow-md`}
        />
      ) : (
        <div
          style={{ backgroundColor: company?.theme_color || "#4f46e5" }}
          className={`${logoSizes[size]} flex items-center justify-center rounded-xl text-white font-extrabold shadow-md shadow-indigo-600/30`}
        >
          <FiMapPin className="h-5 w-5" />
        </div>
      )}

      <div>
        <div className={`${titleSizes[size]} ${dark ? "text-white" : "text-slate-900"} tracking-tight`}>
          {company?.company_name || "GeoTrack HRMS"}
        </div>
        {showSubtitle && (
          <div className="text-[11px] font-medium text-slate-400">
            Workforce Management System
          </div>
        )}
      </div>
    </div>
  );
};

export default Branding;
