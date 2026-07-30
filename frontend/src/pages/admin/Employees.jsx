import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import EmployeeTable from "../../components/EmployeeTable";
import LoadingSpinner from "../../components/LoadingSpinner";
import { adminService } from "../../services/attendanceService";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    setDeleteLoading(true);
    try {
      await adminService.deleteEmployee(employeeId);
      toast.success("Employee deleted successfully");
      fetchEmployees();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Delete failed");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="page-title">Employees</h1>
        <p className="page-subtitle">Manage all registered employees</p>
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
        />
      )}
    </div>
  );
};

export default Employees;
