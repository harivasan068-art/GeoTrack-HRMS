import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBarChart2,
  FiCamera,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiCreditCard,
  FiGlobe,
  FiLock,
  FiMapPin,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import Branding from "../components/Branding";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const LandingPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const features = [
    {
      icon: FiMapPin,
      title: "GPS Geofencing Radius Check",
      description: "Automatic office & client site location validation. Warns employees when outside allowed distance boundaries while preserving submission tracking.",
    },
    {
      icon: FiCamera,
      title: "Live Camera Selfie Validation",
      description: "Zero proxy check-ins. Employees capture live selfies with instant retake options and real-time reverse geocoded site address embedding.",
    },
    {
      icon: FiShield,
      title: "Enterprise Approval Console",
      description: "Excel-style admin approval dashboard with interactive map view, Google Maps markers, remarks input, and one-click Present/Absent actions.",
    },
    {
      icon: FiCreditCard,
      title: "Digital Employee ID Cards",
      description: "Automated digital employee credentials with custom QR codes, department badges, and printable PDF output.",
    },
    {
      icon: FiLock,
      title: "Security & Audit Logs",
      description: "Full audit trail logging for every admin verification, employee profile update, and company branding adjustment.",
    },
    {
      icon: FiBarChart2,
      title: "Executive Reports & Analytics",
      description: "Daily, weekly, monthly, and department attendance analytics with Excel, PDF, and print export formats.",
    },
  ];

  const clients = [
    "Apex Global Tech",
    "Nexus Enterprises",
    "Kinetix Systems",
    "Vanguard Logistics",
    "Horizon Healthcare",
  ];

  const testimonials = [
    {
      quote: "GeoTrack HRMS transformed our multi-site workforce attendance. The live selfie verification and Excel approval console cut our monthly HR review time by 80%.",
      author: "Marcus Vance",
      role: "VP of People Operations",
      company: "Kinetix Global",
    },
    {
      quote: "The GPS geofencing warning and interactive map view give our management 100% confidence in field employee site verification.",
      author: "Elena Rostova",
      role: "Head of Operations",
      company: "Vanguard Logistics",
    },
  ];

  const faqs = [
    {
      q: "Can employees mark themselves as 'Present' directly?",
      a: "No. In accordance with enterprise HR guidelines, every employee submission enters 'Pending Approval'. Only authorized Admins can review the selfie & GPS location proof to grant 'Present' or 'Absent' status.",
    },
    {
      q: "What happens if an employee is outside the permitted geofence radius?",
      a: "The system displays a clear warning ('You are outside the permitted attendance area'). However, the employee is still allowed to submit their attendance as 'Outside Zone' for Admin review and approval.",
    },
    {
      q: "How does the dynamic white-label branding work?",
      a: "Admins can update the Company Name, Logo, Theme Color, Office Address, and Geofence Radius in Company Settings. The entire HRMS updates instantly across all portals.",
    },
    {
      q: "Is the Digital Employee ID Card printable?",
      a: "Yes! Every employee has a Digital ID Card with a custom QR code, department badge, and one-click PDF print button.",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-20 pb-28">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/3 right-10 h-72 w-72 rounded-full bg-purple-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20 mb-6">
            <FiShield className="h-4 w-4" /> Next-Generation Workforce & Attendance Platform
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Enterprise Workforce Management with <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              GPS Geofencing & Live Selfie Proof
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-300 sm:text-xl leading-relaxed">
            Eliminate proxy attendance and streamline HR operations. Empower your enterprise with real-time location validation, camera selfie proof, interactive map inspection, and automated audit logging.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:scale-105"
            >
              Employee Attendance Portal
              <FiArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/admin/login"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 px-6 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition hover:bg-slate-800"
            >
              Admin Command Console
            </Link>
          </div>

          {/* Trusted Companies Bar */}
          <div className="mt-16 border-t border-slate-800/80 pt-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-6">
              Trusted by leading enterprises & multi-site operational teams
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-bold text-slate-400">
              {clients.map((c, i) => (
                <span key={i} className="hover:text-slate-200 transition">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Key Enterprise Features Grid */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-900/40 border-y border-slate-800/80">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Enterprise Core Capabilities</span>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Built for High-Growth Organizations</h2>
            <p className="mt-3 text-slate-400 text-sm">
              Comprehensive HRMS modules engineered for security, precision, and ease of use.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, idx) => (
              <div
                key={idx}
                className="group rounded-2xl bg-slate-900 p-8 border border-slate-800/80 transition duration-300 hover:-translate-y-1 hover:border-slate-700 hover:shadow-2xl"
              >
                <div className="mb-5 inline-flex rounded-xl bg-indigo-500/10 p-3.5 text-indigo-400 shadow-md">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition">{f.title}</h3>
                <p className="mt-3 text-sm text-slate-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Client Reviews</span>
            <h2 className="mt-2 text-3xl font-bold text-white">What HR Leaders Say</h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {testimonials.map((t, idx) => (
              <div key={idx} className="rounded-2xl bg-slate-900 p-8 border border-slate-800 space-y-4">
                <p className="text-sm text-slate-300 italic leading-relaxed">"{t.quote}"</p>
                <div className="pt-4 border-t border-slate-800">
                  <div className="font-bold text-white text-sm">{t.author}</div>
                  <div className="text-xs text-indigo-400">{t.role} &bull; {t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="bg-slate-900/60 py-20 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Got Questions?</span>
            <h2 className="mt-2 text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="mt-10 space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:bg-slate-900 transition"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <FiChevronUp className="h-5 w-5 text-indigo-400" /> : <FiChevronDown className="h-5 w-5 text-slate-500" />}
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs text-slate-400 border-t border-slate-900 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Upgrade Your Enterprise HR Operations?</h2>
          <p className="mt-3 text-slate-300 text-sm">
            Experience real-time GPS geofence tracking, live camera selfie validation, and automated audit trails.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/login" className="rounded-xl bg-white px-7 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 transition shadow-lg">
              Employee Portal Login
            </Link>
            <Link to="/admin/login" className="rounded-xl bg-indigo-600 px-7 py-3 text-sm font-bold text-white hover:bg-indigo-500 transition shadow-lg">
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
