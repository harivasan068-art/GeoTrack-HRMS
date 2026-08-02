import { Link } from "react-router-dom";
import Branding from "./Branding";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 text-sm font-sans transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 mb-8">
          <div>
            <Branding size="sm" />
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Enterprise Workforce Management Platform with GPS Geofence Attendance, Live Selfie Validation, Digital ID Cards & Audit Trails.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 font-mono">Platform Solutions</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/features" className="hover:text-orange-600 dark:hover:text-orange-400 transition">GPS Geofencing</Link></li>
              <li><Link to="/features" className="hover:text-orange-600 dark:hover:text-orange-400 transition">Live Selfie Verification</Link></li>
              <li><Link to="/features" className="hover:text-orange-600 dark:hover:text-orange-400 transition">Digital Employee ID Cards</Link></li>
              <li><Link to="/services" className="hover:text-orange-600 dark:hover:text-orange-400 transition">Enterprise Reports & Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 font-mono">Company & Support</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/about" className="hover:text-orange-600 dark:hover:text-orange-400 transition">About Platform</Link></li>
              <li><Link to="/careers" className="hover:text-orange-600 dark:hover:text-orange-400 transition">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-orange-600 dark:hover:text-orange-400 transition">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3 font-mono">Legal & Compliance</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/privacy" className="hover:text-orange-600 dark:hover:text-orange-400 transition">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-orange-600 dark:hover:text-orange-400 transition">Terms of Service</Link></li>
              <li><span className="text-slate-400 dark:text-slate-500 font-mono">ISO 27001 & SOC-2 Compliant</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium">
          <p>&copy; {new Date().getFullYear()} GeoTrack HRMS Platform. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0 font-sans">
            <Link to="/privacy" className="hover:text-slate-600 dark:hover:text-slate-300">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-600 dark:hover:text-slate-300">Terms</Link>
            <Link to="/contact" className="hover:text-slate-600 dark:hover:text-slate-300">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
