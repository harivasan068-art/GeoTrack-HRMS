import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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

  const handleLogoFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      toast.loading("Processing logo image...");
      const base64Data = await compressLogoImage(file);
      setFormData((prev) => ({ ...prev, company_logo: base64Data }));
      setLogoPreviewError(false);
      toast.dismiss();
      toast.success("Logo file selected & compressed!");
    } catch {
      toast.dismiss();
      toast.error("Failed to process logo file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminService.updateCompanySettings(formData);
      updateBrandingState(updated);
      toast.success("Company settings updated successfully!");
    } catch (e) {
      const msg = e.response?.data?.detail || "Failed to update company settings";
      toast.error(typeof msg === "string" ? msg : "Failed to update company settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans pb-24">
      {/* Title Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
          <FiSettings className="text-orange-600 dark:text-orange-400" /> Company Settings & Geofencing
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Configure organization branding, office location coordinates, and geofence parameters.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* CARD 1: Company Identity */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <h2 className="text-xs sm:text-sm font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider font-mono border-b border-slate-100 dark:border-slate-800 pb-2">
            1. Company Identity & Branding
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1.5">
                Company Name
              </label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white focus:border-orange-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1.5">
                Theme Color
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.theme_color}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  className="h-12 w-16 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={formData.theme_color}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white font-mono font-bold"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider">
              Company Logo Uploader
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 shadow-sm">
                {formData.company_logo && !logoPreviewError ? (
                  <img
                    src={getImageUrl(formData.company_logo)}
                    alt="Logo"
                    className="h-full w-full object-contain p-1"
                    onError={() => setLogoPreviewError(true)}
                  />
                ) : (
                  <FiShield className="h-8 w-8 text-orange-600" />
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Upload New Logo File
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleLogoFileUpload}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-600 dark:file:text-orange-400 hover:file:bg-orange-500/20 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* CARD 2: Contact & Website */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <h2 className="text-xs sm:text-sm font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider font-mono border-b border-slate-100 dark:border-slate-800 pb-2">
            2. Contact & Address Details
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1.5">
                Official Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1.5">
                Official Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1.5">
              HQ Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:border-orange-500 focus:outline-none"
            />
          </div>
        </motion.div>

        {/* CARD 3: Geofencing Location Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-white dark:bg-slate-900 p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4"
        >
          <h2 className="text-xs sm:text-sm font-extrabold text-orange-600 dark:text-orange-400 uppercase tracking-wider font-mono border-b border-slate-100 dark:border-slate-800 pb-2">
            3. Office Geofence Coordinates & Radius
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1.5">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.office_latitude}
                onChange={(e) => setFormData({ ...formData, office_latitude: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white font-mono font-bold focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1.5">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.office_longitude}
                onChange={(e) => setFormData({ ...formData, office_longitude: parseFloat(e.target.value) || 0 })}
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white font-mono font-bold focus:border-orange-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase font-mono tracking-wider mb-1.5">
                Geofence Radius (Meters)
              </label>
              <input
                type="number"
                step="any"
                value={formData.geofence_radius_meters}
                onChange={(e) => setFormData({ ...formData, geofence_radius_meters: parseFloat(e.target.value) || 100 })}
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3.5 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white font-mono font-bold focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Large Submit Button */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 py-4 min-h-[52px] text-xs sm:text-sm font-extrabold text-white shadow-xl shadow-orange-600/30 hover:from-orange-500 hover:to-amber-500 transition disabled:opacity-60 font-sans tracking-wide"
        >
          {saving ? <LoadingSpinner size="sm" /> : <><FiSave className="h-5 w-5" /> Save Company Settings & Geofence</>}
        </motion.button>
      </form>
    </div>
  );
};

export default CompanySettings;
