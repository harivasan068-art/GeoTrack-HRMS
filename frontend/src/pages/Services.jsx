import { FiBarChart2, FiCamera, FiCreditCard, FiLock, FiMapPin, FiUsers } from "react-icons/fi";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Services = () => {
  const modules = [
    { icon: FiMapPin, title: "GPS Geofencing Radius Verification", desc: "Set office lat/lon and radius in meters. Auto-flags entries outside permitted zones." },
    { icon: FiCamera, title: "Live Camera Selfie Check-In", desc: "Live selfie capture with retake option and reverse geocoded address embedding." },
    { icon: FiUsers, title: "Enterprise Approval Console", desc: "Excel-style grid for admins to inspect selfies, maps, and grant Present/Absent status." },
    { icon: FiCreditCard, title: "Digital Employee ID Card", desc: "Printable digital ID cards with custom QR code and department badge." },
    { icon: FiLock, title: "Audit Trail Logging", desc: "Logs all admin actions (approvals, rejections, settings updates) with timestamps." },
    { icon: FiBarChart2, title: "Executive Exportable Reports", desc: "Generate daily, weekly, and monthly attendance reports in Excel, PDF, and print." },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono">Core HRMS Product Modules</span>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white sm:text-5xl font-display">Enterprise Platform Services</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm font-medium">
            Everything your organization needs for automated, tamper-proof workforce attendance management.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 font-sans">
          {modules.map((m, i) => (
            <div key={i} className="rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm hover:shadow-md transition">
              <div className="inline-flex rounded-2xl bg-orange-50 dark:bg-orange-950/50 p-3.5 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 shadow-sm">
                <m.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">{m.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
