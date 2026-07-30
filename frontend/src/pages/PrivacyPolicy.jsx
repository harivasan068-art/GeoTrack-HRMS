import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const PrivacyPolicy = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 text-sm text-slate-300">
        <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-xs text-slate-500">Last updated: July 30, 2026</p>

        <div className="space-y-4 rounded-2xl bg-slate-900 p-8 border border-slate-800 leading-relaxed">
          <h3 className="text-lg font-bold text-white">1. Information We Collect</h3>
          <p>GeoTrack HRMS collects geolocation coordinates (latitude, longitude), selfie photos, device fingerprint metadata, and work logs strictly for enterprise attendance verification purposes requested by your employer.</p>

          <h3 className="text-lg font-bold text-white">2. Geolocation & Geofencing Usage</h3>
          <p>GPS data is accessed only when an employee explicitly triggers the 'Mark Attendance' or 'Upload Geotag Photo' action. We do not perform background continuous tracking when the browser is closed.</p>

          <h3 className="text-lg font-bold text-white">3. Data Security & Encryption</h3>
          <p>All data and images are transmitted over encrypted TLS channels and stored in secure database schemas compliant with SOC-2 and ISO 27001 standards.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
