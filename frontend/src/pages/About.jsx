import { FiAward, FiCheckCircle, FiGlobe, FiShield, FiUsers } from "react-icons/fi";
import Branding from "../components/Branding";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const About = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">About Our Enterprise HRMS</span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Architected for Precision Workforce Management</h1>
          <p className="text-slate-300 max-w-3xl mx-auto text-base leading-relaxed">
            GeoTrack HRMS is an enterprise-grade SaaS platform designed to eliminate attendance fraud, streamline HR approval workflows, and deliver real-time auditability across distributed organizations.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-900 p-6 border border-slate-800 text-center">
            <FiShield className="mx-auto h-10 w-10 text-indigo-400 mb-3" />
            <h3 className="text-lg font-bold text-white">100% Geofence Accuracy</h3>
            <p className="text-xs text-slate-400 mt-2">GPS coordinates validated against permitted office & site radii.</p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 border border-slate-800 text-center">
            <FiUsers className="mx-auto h-10 w-10 text-purple-400 mb-3" />
            <h3 className="text-lg font-bold text-white">Single Admin Security</h3>
            <p className="text-xs text-slate-400 mt-2">Strict 2-role hierarchy with central executive verification control.</p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-6 border border-slate-800 text-center">
            <FiAward className="mx-auto h-10 w-10 text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-white">Automated Audit Trails</h3>
            <p className="text-xs text-slate-400 mt-2">Every verification action logged with timestamps and remarks.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
