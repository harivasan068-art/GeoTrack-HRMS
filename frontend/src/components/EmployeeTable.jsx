import { FiMail, FiPhone, FiTrash2, FiUser } from "react-icons/fi";

const EmployeeTable = ({ employees, onDelete, loading }) => {
  if (!employees.length) {
    return (
      <div className="card text-center">
        <p className="text-slate-500">No employees found</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 font-semibold text-slate-700">Employee</th>
              <th className="px-6 py-3 font-semibold text-slate-700">ID</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Department</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Designation</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Contact</th>
              <th className="px-6 py-3 font-semibold text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {employees.map((employee) => (
              <tr key={employee.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                      <FiUser className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-slate-900">{employee.full_name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{employee.employee_id}</td>
                <td className="px-6 py-4 text-slate-600">{employee.department}</td>
                <td className="px-6 py-4 text-slate-600">{employee.designation}</td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-slate-600">
                      <FiMail className="h-3 w-3" />
                      <span className="text-xs">{employee.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <FiPhone className="h-3 w-3" />
                      <span className="text-xs">{employee.phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {employee.designation.toLowerCase() !== "admin" && (
                    <button
                      onClick={() => onDelete(employee.employee_id)}
                      disabled={loading}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      title="Delete employee"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeTable;
