import { FiAward, FiCheckCircle, FiGlobe, FiShield, FiUsers } from "react-icons/fi";
import Branding from "../components/Branding";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const About = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono">About Our Enterprise HRMS</span>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white sm:text-5xl font-display">Architected for Precision Workforce Management</h1>
          <p className="text-slate-600 dark:text-slate-300 max-w-3xl mx-auto text-base leading-relaxed font-medium">
            GeoTrack HRMS is an enterprise-grade SaaS platform designed to eliminate attendance fraud, streamline HR approval workflows, and deliver real-time auditability across distributed organizations.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3 font-sans">
          <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <FiShield className="mx-auto h-10 w-10 text-orange-600 dark:text-orange-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">100% Geofence Accuracy</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">GPS coordinates validated against permitted office & site radii.</p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <FiUsers className="mx-auto h-10 w-10 text-amber-600 dark:text-amber-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Single Admin Security</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Strict 2-role hierarchy with central executive verification control.</p>
          </div>

          <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
            <FiAward className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">Automated Audit Trails</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">Every verification action logged with timestamps and remarks.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
