import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const PrivacyPolicy = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 text-sm">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white font-display">Privacy Policy</h1>
        <p className="text-xs text-orange-600 dark:text-orange-400 font-mono font-bold">Last updated: August 2, 2026</p>

        <div className="space-y-6 rounded-3xl bg-white dark:bg-slate-900 p-8 sm:p-10 border border-slate-200 dark:border-slate-800 leading-relaxed shadow-sm font-sans">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">1. Information We Collect</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 font-medium">GeoTrack HRMS collects geolocation coordinates (latitude, longitude), selfie photos, device fingerprint metadata, and work logs strictly for enterprise attendance verification purposes requested by your employer.</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">2. Geolocation & Geofencing Usage</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 font-medium">GPS data is accessed only when an employee explicitly triggers the 'Mark Attendance' or 'Upload Geotag Photo' action. We do not perform background continuous tracking when the browser is closed.</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">3. Data Security & Encryption</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 font-medium">All data and images are transmitted over encrypted TLS channels and stored in secure database schemas compliant with SOC-2 and ISO 27001 standards.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
