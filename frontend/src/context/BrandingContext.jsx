import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const BrandingContext = createContext(null);

export const BrandingProvider = ({ children }) => {
  const [company, setCompany] = useState({
    company_name: "GeoTrack HRMS",
    company_logo: null,
    theme_color: "#4f46e5",
    phone: "+1-800-555-0199",
    email: "contact@geotrackhrms.com",
    address: "100 Tech Park Way, Suite 400, San Francisco, CA",
    website: "https://geotrackhrms.com",
    office_latitude: 37.7749,
    office_longitude: -122.4194,
    geofence_radius_meters: 100.0,
  });

  const [loading, setLoading] = useState(true);

  const fetchBranding = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const res = await axios.get(`${apiUrl}/api/admin/company`);
      if (res.data) {
        setCompany(res.data);
      }
    } catch (e) {
      console.warn("Using default branding settings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const updateBrandingState = (newSettings) => {
    setCompany((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <BrandingContext.Provider value={{ company, loading, refreshBranding: fetchBranding, updateBrandingState }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }
  return context;
};
