import { Link } from "react-router-dom";
import Branding from "./Branding";

const Footer = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 mb-8">
          <div>
            <Branding size="sm" />
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Enterprise Workforce Management Platform with GPS Geofence Attendance, Live Selfie Validation, Digital ID Cards & Audit Trails.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Platform Solutions</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/features" className="hover:text-indigo-400">GPS Geofencing</Link></li>
              <li><Link to="/features" className="hover:text-indigo-400">Live Selfie Verification</Link></li>
              <li><Link to="/features" className="hover:text-indigo-400">Digital Employee ID Cards</Link></li>
              <li><Link to="/services" className="hover:text-indigo-400">Enterprise Reports & Analytics</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Company & Support</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-indigo-400">About Platform</Link></li>
              <li><Link to="/careers" className="hover:text-indigo-400">Careers</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Legal & Compliance</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/privacy" className="hover:text-indigo-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-indigo-400">Terms of Service</Link></li>
              <li><span className="text-slate-500">ISO 27001 & SOC-2 Compliant</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Enterprise HRMS. All rights reserved.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <Link to="/privacy" className="hover:text-slate-400">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-400">Terms</Link>
            <Link to="/contact" className="hover:text-slate-400">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
