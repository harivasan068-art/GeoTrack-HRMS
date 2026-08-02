import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiCheckCircle, FiGlobe, FiMapPin, FiSave, FiSettings, FiShield, FiUpload } from "react-icons/fi";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useBranding } from "../../context/BrandingContext";
import { adminService } from "../../services/attendanceService";
import { getImageUrl } from "../../services/api";

const CompanySettings = () => {
  const { company, updateBrandingState } = useBranding();
  const [saving, setSaving] = useState(false);
  const [logoPreviewError, setLogoPreviewError] = useState(false);

  const [formData, setFormData] = useState({
    company_name: company?.company_name || "GeoTrack HRMS",
    company_logo: company?.company_logo || "",
    theme_color: company?.theme_color || "#ea580c",
    phone: company?.phone || "+1-800-555-0199",
    email: company?.email || "contact@geotrackhrms.com",
    address: company?.address || "100 Tech Park Way, Suite 400, San Francisco, CA",
    website: company?.website || "https://geotrackhrms.com",
    office_latitude: company?.office_latitude || 37.7749,
    office_longitude: company?.office_longitude || -122.4194,
    geofence_radius_meters: company?.geofence_radius_meters || 100.0,
  });

  useEffect(() => {
    if (company) {
      setFormData({
        company_name: company.company_name,
        company_logo: company.company_logo || "",
        theme_color: company.theme_color || "#ea580c",
        phone: company.phone || "+1-800-555-0199",
        email: company.email || "contact@geotrackhrms.com",
        address: company.address || "100 Tech Park Way, Suite 400, San Francisco, CA",
        website: company.website || "https://geotrackhrms.com",
        office_latitude: company.office_latitude || 37.7749,
        office_longitude: company.office_longitude || -122.4194,
        geofence_radius_meters: company.geofence_radius_meters || 100.0,
      });
    }
  }, [company]);

  const compressLogoImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 300;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round(height * (maxDim / width));
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round(width * (maxDim / height));
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminService.updateCompanySettings(formData);
      updateBrandingState(updated);
      toast.success("Company branding & Geofence settings updated successfully!");
    } catch (e) {
      const msg = e.response?.data?.detail || "Failed to update company settings";
      toast.error(typeof msg === "string" ? msg : "Failed to update company settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FiSettings className="text-orange-600 dark:text-orange-400" /> White-Label Company Branding & Geofencing
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
          Changing Company Name, Logo, Theme Color, or Office Geofence Radius will automatically update the entire HRMS.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm font-sans">
        {/* Branding Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 font-display">
            1. Company Identity & Branding
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Company Name</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Theme Primary Color (Hex)</label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="color"
                  value={formData.theme_color}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  className="h-10 w-12 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.theme_color}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Company Logo (Upload File, Direct Image Link, or Presets)</label>
            
            {/* Live Logo Preview Box */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 shadow-sm">
                {formData.company_logo && !logoPreviewError ? (
                  <img
                    src={getImageUrl(formData.company_logo)}
                    alt="Logo Preview"
                    className="h-full w-full object-contain"
                    onError={() => setLogoPreviewError(true)}
                  />
                ) : (
                  <div
                    style={{ backgroundColor: formData.theme_color || "#ea580c" }}
                    className="h-full w-full flex items-center justify-center text-white font-bold"
                  >
                    <FiMapPin className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2 w-full font-sans">
                <input
                  type="text"
                  placeholder="https://example.com/logo.png or data:image/..."
                  value={formData.company_logo}
                  onChange={(e) => {
                    setLogoPreviewError(false);
                    setFormData({ ...formData, company_logo: e.target.value });
                  }}
                  className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 focus:outline-none font-medium"
                />

                <div className="flex flex-wrap items-center gap-2">
                  {/* Local Image File Upload Button */}
                  <label className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 px-3 py-1.5 text-[11px] font-bold text-orange-700 dark:text-orange-300 hover:bg-orange-600 hover:text-white transition cursor-pointer font-sans">
                    <FiUpload className="h-3.5 w-3.5" /> Upload Image File
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressedDataUrl = await compressLogoImage(file);
                            setLogoPreviewError(false);
                            setFormData({ ...formData, company_logo: compressedDataUrl });
                            toast.success("Logo file selected & optimized!");
                          } catch {
                            toast.error("Failed to process image file");
                          }
                        }
                      }}
                    />
                  </label>

                  {/* Preset Logos */}
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreviewError(false);
                      setFormData({
                        ...formData,
                        company_logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
                      });
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition shadow-sm"
                  >
                    Preset 1
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreviewError(false);
                      setFormData({
                        ...formData,
                        company_logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&auto=format&fit=crop&q=80",
                      });
                    }}
                    className="inline-flex items-center gap-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition shadow-sm"
                  >
                    Preset 2
                  </button>

                  {formData.company_logo && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreviewError(false);
                        setFormData({ ...formData, company_logo: "" });
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition"
                    >
                      Reset Default Icon
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Webpage HTML URL Warning */}
            {formData.company_logo && (formData.company_logo.includes(".htm") || formData.company_logo.includes(".html")) && (
              <div className="flex items-center gap-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-300">
                <FiAlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  The URL entered ends in <code>.htm</code> (web page). Please upload an image file (`.png`, `.jpg`, `.svg`) or click <strong>Upload Image File</strong> above.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 font-display">
            2. Contact & Headquarters Address
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Corporate Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Office Physical Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium"
            />
          </div>
        </div>

        {/* Geofencing Parameters Section */}
        <div className="space-y-4 font-sans">
          <h2 className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2 font-display">
            3. Office Geofence Radius Parameters
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Office Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.office_latitude}
                onChange={(e) => setFormData({ ...formData, office_latitude: parseFloat(e.target.value) })}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Office Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.office_longitude}
                onChange={(e) => setFormData({ ...formData, office_longitude: parseFloat(e.target.value) })}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Allowed Radius (Meters)</label>
              <input
                type="number"
                required
                value={formData.geofence_radius_meters}
                onChange={(e) => setFormData({ ...formData, geofence_radius_meters: parseFloat(e.target.value) })}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white font-mono font-bold focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 px-6 py-3.5 text-xs font-bold text-white shadow-md hover:bg-orange-700 transition font-sans"
        >
          {saving ? <LoadingSpinner size="sm" /> : <><FiSave /> Save White-Label Settings & Geofence</>}
        </button>
      </form>
    </div>
  );
};

export default CompanySettings;
