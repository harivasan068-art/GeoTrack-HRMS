import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Terms = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6 text-sm text-slate-300">
        <h1 className="text-3xl font-extrabold text-white">Terms of Service</h1>
        <p className="text-xs text-slate-500">Last updated: July 30, 2026</p>

        <div className="space-y-4 rounded-2xl bg-slate-900 p-8 border border-slate-800 leading-relaxed">
          <h3 className="text-lg font-bold text-white">1. Platform Usage & Verification Rules</h3>
          <p>GeoTrack HRMS is an enterprise workforce attendance application. Attendance submissions enter 'Pending Approval' status and must be verified by the employer's designated Admin.</p>

          <h3 className="text-lg font-bold text-white">2. Prohibited Conduct</h3>
          <p>Users must not attempt GPS spoofing, photo manipulation, or unauthorized API tampering. Any detected fraud is logged in the system Audit Log.</p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
