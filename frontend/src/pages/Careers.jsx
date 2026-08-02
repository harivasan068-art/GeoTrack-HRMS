import { FiBriefcase, FiMapPin } from "react-icons/fi";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

const Careers = () => {
  const jobs = [
    { title: "Senior Full Stack Engineer (FastAPI & React)", dept: "Engineering", loc: "San Francisco, CA / Remote" },
    { title: "Product Designer (SaaS UI/UX)", dept: "Design", loc: "Remote" },
    { title: "Enterprise Account Executive", dept: "Sales", loc: "New York, NY" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 font-mono">Join Our Team</span>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white sm:text-5xl font-display">Build the Future of HR Tech</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">We are looking for passionate engineers, designers, and innovators.</p>
        </div>

        <div className="space-y-4 font-sans">
          {jobs.map((j, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 gap-4 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white font-display">{j.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span className="text-orange-600 dark:text-orange-400 font-bold font-mono">{j.dept}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 font-medium"><FiMapPin className="text-orange-600" /> {j.loc}</span>
                </div>
              </div>
              <button className="rounded-2xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-orange-700 transition shadow-sm font-sans">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;
