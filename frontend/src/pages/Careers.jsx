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
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <Navbar />

      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Join Our Team</span>
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">Build the Future of HR Tech</h1>
          <p className="text-slate-400 text-sm">We are looking for passionate engineers, designers, and innovators.</p>
        </div>

        <div className="space-y-4">
          {jobs.map((j, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-slate-900 p-6 border border-slate-800 gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">{j.title}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="text-indigo-400 font-semibold">{j.dept}</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1"><FiMapPin /> {j.loc}</span>
                </div>
              </div>
              <button className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition border border-slate-700">
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
