import api from "./api";

export const employeeService = {
  getProfile: async () => {
    const response = await api.get("/employees/profile");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/employees/profile", data);
    return response.data;
  },

  getEmployeeById: async (employeeId) => {
    const response = await api.get(`/employees/${employeeId}`);
    return response.data;
  },
};