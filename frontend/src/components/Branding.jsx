import { useEffect, useState } from "react";
import { FiMapPin } from "react-icons/fi";
import { useBranding } from "../context/BrandingContext";
import { getImageUrl } from "../services/api";

const Branding = ({ size = "md", showSubtitle = true, dark = true }) => {
  const { company } = useBranding();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [company?.company_logo]);

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

  const logoUrl = getImageUrl(company?.company_logo);

  return (
    <div className="flex items-center gap-3">
      {company?.company_logo && !imageError ? (
        <img
          src={logoUrl}
          alt={company?.company_name || "Logo"}
          className={`${logoSizes[size]} object-contain rounded-xl border ${dark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"} shadow-sm`}
          onError={() => setImageError(true)}
        />
      ) : (
        <div
          style={{ backgroundColor: company?.theme_color || "#4f46e5" }}
          className={`${logoSizes[size]} flex items-center justify-center rounded-xl text-white font-extrabold shadow-md shadow-indigo-600/30 shrink-0`}
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

