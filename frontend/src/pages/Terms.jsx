import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Terms = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 text-sm">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white font-display">Terms of Service</h1>
        <p className="text-xs text-orange-600 dark:text-orange-400 font-mono font-bold">Last updated: August 2, 2026</p>

        <div className="space-y-6 rounded-3xl bg-white dark:bg-slate-900 p-8 sm:p-10 border border-slate-200 dark:border-slate-800 leading-relaxed shadow-sm font-sans">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">1. Platform Usage & Verification Rules</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 font-medium">GeoTrack HRMS is an enterprise workforce attendance application. Attendance submissions enter &apos;Pending Approval&apos; status and must be verified by the employer&apos;s designated Admin.</p>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">2. Prohibited Conduct</h3>
            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5 font-medium">Users must not attempt GPS spoofing, photo manipulation, or unauthorized API tampering. Any detected fraud is logged in the system Audit Log.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
