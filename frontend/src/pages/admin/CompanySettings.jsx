import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCheckCircle, FiGlobe, FiMapPin, FiSave, FiSettings, FiShield } from "react-icons/fi";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useBranding } from "../../context/BrandingContext";
import { adminService } from "../../services/attendanceService";

const CompanySettings = () => {
  const { company, updateBrandingState, refreshBranding } = useBranding();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    company_name: company?.company_name || "GeoTrack HRMS",
    company_logo: company?.company_logo || "",
    theme_color: company?.theme_color || "#4f46e5",
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
        theme_color: company.theme_color || "#4f46e5",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminService.updateCompanySettings(formData);
      updateBrandingState(updated);
      toast.success("Company branding & Geofence settings updated successfully!");
    } catch (e) {
      toast.error("Failed to update company settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <FiSettings className="text-indigo-400" /> White-Label Company Branding & Geofencing
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Changing Company Name, Logo, Theme Color, or Office Geofence Radius will automatically update the entire HRMS.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-900 p-8 border border-slate-800 space-y-8 shadow-2xl">
        {/* Branding Section */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
            1. Company Identity & Branding
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">Company Name</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Theme Primary Color (Hex)</label>
              <div className="mt-1.5 flex items-center gap-3">
                <input
                  type="color"
                  value={formData.theme_color}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  className="h-10 w-12 rounded-lg bg-slate-950 border border-slate-800 p-1 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.theme_color}
                  onChange={(e) => setFormData({ ...formData, theme_color: e.target.value })}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white font-mono"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Company Logo URL (Optional Image Link)</label>
            <input
              type="text"
              placeholder="https://example.com/logo.png"
              value={formData.company_logo}
              onChange={(e) => setFormData({ ...formData, company_logo: e.target.value })}
              className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-purple-400 border-b border-slate-800 pb-2">
            2. Contact & Headquarters Address
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-300">Corporate Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300">Office Physical Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Geofencing Parameters Section */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-emerald-400 border-b border-slate-800 pb-2">
            3. Office Geofence Radius Parameters
          </h2>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-medium text-slate-300">Office Latitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.office_latitude}
                onChange={(e) => setFormData({ ...formData, office_latitude: parseFloat(e.target.value) })}
                className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Office Longitude</label>
              <input
                type="number"
                step="any"
                required
                value={formData.office_longitude}
                onChange={(e) => setFormData({ ...formData, office_longitude: parseFloat(e.target.value) })}
                className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Allowed Radius (Meters)</label>
              <input
                type="number"
                required
                value={formData.geofence_radius_meters}
                onChange={(e) => setFormData({ ...formData, geofence_radius_meters: parseFloat(e.target.value) })}
                className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.01] transition"
        >
          {saving ? <LoadingSpinner size="sm" /> : <><FiSave /> Save White-Label Settings & Geofence</>}
        </button>
      </form>
    </div>
  );
};

export default CompanySettings;
