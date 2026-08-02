import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiLock, FiMail, FiPhone, FiUser, FiUserPlus, FiUsers, FiX } from "react-icons/fi";
import EmployeeTable from "../../components/EmployeeTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import { adminService } from "../../services/attendanceService";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [newEmp, setNewEmp] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "Software Engineering",
    designation: "Software Engineer",
    password: "",
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await adminService.getEmployees();
      setEmployees(data);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleDelete = async (employeeId) => {
    setDeleteLoading(true);
    try {
      await adminService.deleteEmployee(employeeId);
      toast.success(`Employee ${employeeId} deleted successfully`);
      setEmployees((prev) => prev.filter((e) => e.employee_id !== employeeId));
    } catch (error) {
      toast.error(error.response?.data?.detail || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const created = await adminService.createEmployee(newEmp);
      toast.success(`Registered new employee ${created.full_name} (${created.employee_id})!`);
      setIsAddModalOpen(false);
      setNewEmp({
        full_name: "",
        email: "",
        phone: "",
        department: "Software Engineering",
        designation: "Software Engineer",
        password: "",
      });
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create employee");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <FiUsers className="text-indigo-600 dark:text-indigo-400" /> Employee Directory & Account Management
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage organization members, register new employees, view profile details, and delete accounts.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-indigo-700"
        >
          <FiUserPlus className="h-4 w-4" /> Register Employee
        </button>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <EmployeeTable
          employees={employees}
          onDelete={handleDelete}
          loading={deleteLoading}
          onAddEmployee={() => setIsAddModalOpen(true)}
        />
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative max-w-lg w-full rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 border border-slate-200 dark:border-slate-800 space-y-6 shadow-2xl my-8 text-slate-900 dark:text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <FiUserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Register New Employee</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Create employee profile and auto-generate Employee ID</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    required
                    value={newEmp.full_name}
                    onChange={(e) => setNewEmp({ ...newEmp, full_name: e.target.value })}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none font-medium"
                    placeholder="John Architect"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="email"
                    required
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none font-medium"
                    placeholder="john.architect@geotrack.com"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                      type="text"
                      required
                      value={newEmp.phone}
                      onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                      className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none font-medium"
                      placeholder="+1-555-0199"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">Initial Password</label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <input
                      type="password"
                      required
                      value={newEmp.password}
                      onChange={(e) => setNewEmp({ ...newEmp, password: e.target.value })}
                      className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none font-medium"
                      placeholder="password123"
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">Department</label>
                  <input
                    type="text"
                    required
                    value={newEmp.department}
                    onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none font-medium"
                    placeholder="Software Engineering"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-bold text-slate-700 dark:text-slate-300">Designation</label>
                  <input
                    type="text"
                    required
                    value={newEmp.designation}
                    onChange={(e) => setNewEmp({ ...newEmp, designation: e.target.value })}
                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:border-indigo-500 focus:outline-none font-medium"
                    placeholder="Senior Developer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="rounded-2xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 transition"
                >
                  {createLoading ? <LoadingSpinner size="sm" /> : "Create Employee Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
