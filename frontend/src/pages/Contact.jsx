import { useState } from "react";
import { FiCheckCircle, FiMail, FiMapPin, FiPhone, FiSend } from "react-icons/fi";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Contact = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Get in Touch</span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Contact Our Platform Team</h1>
          <p className="text-slate-400 text-sm">Need a custom enterprise setup or have questions? Send us a message.</p>
        </div>

        {sent ? (
          <div className="rounded-2xl bg-emerald-500/10 p-8 text-center border border-emerald-500/30">
            <FiCheckCircle className="mx-auto h-12 w-12 text-emerald-400" />
            <h3 className="mt-3 text-lg font-bold text-white">Message Sent Successfully!</h3>
            <p className="text-xs text-slate-300 mt-1">Our HRMS enterprise team will reach out within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-900 p-8 border border-slate-800 space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-slate-300">Your Full Name</label>
                <input required type="text" placeholder="John Smith" className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300">Corporate Email</label>
                <input required type="email" placeholder="john@company.com" className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Subject / Inquiry</label>
              <input required type="text" placeholder="Enterprise HRMS Deployment" className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300">Message</label>
              <textarea required rows={4} placeholder="Describe your team size and requirements..." className="mt-1.5 w-full rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none" />
            </div>

            <button type="submit" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 transition">
              <FiSend /> Send Message
            </button>
          </form>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
