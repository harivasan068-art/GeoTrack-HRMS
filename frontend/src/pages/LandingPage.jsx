import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiCalendar,
  FiCamera,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiGlobe,
  FiLock,
  FiMapPin,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    {
      icon: FiMapPin,
      title: "Real-Time GPS Location Validation",
      description:
        "Every check-in captures precise latitude, longitude, and reverse-geocoded physical customer addresses to eliminate attendance fraud.",
    },
    {
      icon: FiCamera,
      title: "Live Selfie Camera Proof",
      description:
        "Field staff and employees take live camera selfies during clock-in to verify identity on customer sites.",
    },
    {
      icon: FiShield,
      title: "Geofence Radius Boundaries",
      description:
        "Configure custom office and site radius perimeters in meters. Out-of-bounds check-ins trigger instant Admin review alerts.",
    },
    {
      icon: FiUsers,
      title: "Employee Directory & ID Badges",
      description:
        "Auto-generate digital identity credentials with QR codes for fast scanning and exportable printable ID badges.",
    },
    {
      icon: FiLock,
      title: "Immutable Audit Trail Logging",
      description:
        "Every approval, rejection, and setting update is stored securely in an audit log for compliance.",
    },
    {
      icon: FiAward,
      title: "Executive Reports & Analytics",
      description:
        "Interactive analytics graphs and CSV/Excel exports for department attendance rates and monthly summaries.",
    },
  ];

  const testimonials = [
    {
      quote:
        "GeoTrack HRMS reduced our remote team proxy attendance to zero. The live selfie proof and GPS maps give us total transparency across 20+ field sites.",
      author: "Sarah Jenkins",
      role: "VP of Human Resources",
      company: "Apex Tech Solutions",
    },
    {
      quote:
        "The automated geofence alerts and one-click Excel reports saved our HR operations team over 15 hours of manual verification every week.",
      author: "Marcus Vance",
      role: "Chief Operations Officer",
      company: "Vanguard Logistics Inc.",
    },
  ];

  const faqs = [
    {
      q: "How does GPS Geofencing work during employee check-in?",
      a: "When an employee clicks 'Mark Attendance', GeoTrack requests current browser location. It measures the exact distance in meters from your configured office or customer site location. If outside the allowed radius, it flags the request for Admin verification.",
    },
    {
      q: "Can employees upload pre-saved photos for selfie proof?",
      a: "No, GeoTrack activates live camera capture directly within the app viewfinder to ensure real-time photo authenticity.",
    },
    {
      q: "Is GeoTrack mobile-friendly for field workers?",
      a: "Yes! GeoTrack is built as a Progressive Web App (PWA) optimized for mobile smartphones, tablets, and desktop computers.",
    },
  ];

  const clients = [
    "Apex Global",
    "Nexus Enterprises",
    "Starlight Media",
    "Vanguard Logistics",
    "Zenith Healthcare",
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900 pt-20 pb-28 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 dark:bg-orange-950/50 px-4 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 mb-6 shadow-sm font-mono">
            <FiShield className="h-4 w-4" /> Enterprise Geofence & Attendance Platform
          </div>

          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl font-display">
            Enterprise Workforce Management with <br />
            <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">
              GPS Geofencing & Live Selfie Proof
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base sm:text-lg text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            Eliminate proxy attendance and streamline HR operations. Empower your enterprise with real-time location validation, camera selfie proof, interactive map inspection, and automated audit logging.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row font-sans">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-700 hover:scale-105"
            >
              Employee Attendance Portal
              <FiArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-7 py-4 text-sm font-bold text-slate-800 dark:text-slate-200 shadow-sm transition hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Admin Command Console
            </Link>
          </div>

          {/* Trusted Companies Bar */}
          <div className="mt-16 border-t border-slate-200 dark:border-slate-800 pt-10 font-sans">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-6 font-mono">
              Trusted by leading enterprise & multi-site operational teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-extrabold text-slate-500 dark:text-slate-400 font-display">
              {clients.map((c, i) => (
                <span key={i} className="hover:text-orange-600 transition">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Enterprise Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 font-sans">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono">Enterprise Core Capabilities</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white sm:text-4xl font-display">Built for High-Growth Organizations</h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm font-medium">
              Comprehensive HRMS modules engineered for security, precision, and ease of use.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="group rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 transition duration-300 hover:-translate-y-1 hover:border-orange-300 dark:hover:border-orange-500 shadow-sm hover:shadow-md"
              >
                <div className="mb-5 inline-flex rounded-2xl bg-orange-50 dark:bg-orange-950/50 p-3.5 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 shadow-sm">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition font-display">{f.title}</h3>
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-sans">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono">Client Reviews</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white font-display">What HR Leaders Say</h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {testimonials.map((t, idx) => (
              <div key={idx} className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-8 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <p className="text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed font-medium">"{t.quote}"</p>
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div className="font-extrabold text-slate-900 dark:text-white text-sm font-display">{t.author}</div>
                  <div className="text-xs font-bold text-orange-600 dark:text-orange-400 font-mono mt-0.5">{t.role} &bull; {t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 font-sans">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">Got Questions?</span>
            <h2 className="mt-2 text-3xl font-black text-slate-900 dark:text-white font-display">Frequently Asked Questions</h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left text-sm font-extrabold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 transition font-display"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <FiChevronUp className="h-5 w-5 text-orange-600 dark:text-orange-400" /> : <FiChevronDown className="h-5 w-5 text-slate-400" />}
                </button>
                {openFaq === idx && (
                  <div className="p-6 pt-0 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 leading-relaxed font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 py-16 px-4 sm:px-6 lg:px-8 text-white font-sans shadow-xl">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-black text-white font-display tracking-tight">Ready to Upgrade Your Enterprise HR Operations?</h2>
          <p className="mt-3 text-orange-100 text-sm font-medium">
            Experience real-time GPS geofence tracking, live camera selfie validation, and automated audit trails.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row font-sans">
            <Link to="/login" className="rounded-2xl bg-white px-8 py-3.5 text-xs font-extrabold text-orange-700 hover:bg-slate-50 transition shadow-lg tracking-wide">
              Employee Portal Login
            </Link>
            <Link to="/admin/login" className="rounded-2xl bg-slate-900 px-8 py-3.5 text-xs font-extrabold text-white hover:bg-slate-800 transition shadow-lg tracking-wide">
              Admin Portal Sign-In
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
