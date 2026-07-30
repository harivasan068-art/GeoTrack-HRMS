import { FiCheckCircle, FiCrosshair, FiMap, FiSmartphone, FiUserCheck, FiZap } from "react-icons/fi";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Features = () => {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Feature Matrix</span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Feature Comparison & Capabilities</h1>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4">
              <FiCrosshair className="h-6 w-6 text-indigo-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white">Geofencing & Distance Radius</h3>
                <p className="text-xs text-slate-400 mt-1">Configurable radius (e.g. 100m, 500m). Submissions outside radius display prominent warning badges for Admin decision.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiUserCheck className="h-6 w-6 text-emerald-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white">Single Admin Verification Protocol</h3>
                <p className="text-xs text-slate-400 mt-1">Employee can NEVER mark themselves Present directly. Only authorized Admin grants Present / Absent status after inspecting selfie & GPS coordinates.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiMap className="h-6 w-6 text-purple-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white">Interactive Map Modal</h3>
                <p className="text-xs text-slate-400 mt-1">Embedded map preview with marker and direct Google Maps navigation button for fast location verification.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <FiSmartphone className="h-6 w-6 text-amber-400 shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-white">Device & Browser Fingerprinting</h3>
                <p className="text-xs text-slate-400 mt-1">Automatically logs client browser, device type, and IP address with every attendance submission.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
