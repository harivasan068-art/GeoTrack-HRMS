import api from "./api";

export const attendanceService = {
  submitGeotagPhoto: async (formData) => {
    const response = await api.post("/api/attendance/geotag-upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  checkIn: async (data) => {
    const response = await api.post("/api/attendance/check-in", data);
    return response.data;
  },

  checkOut: async (data) => {
    const response = await api.post("/api/attendance/check-out", data);
    return response.data;
  },

  getTodayAttendance: async () => {
    const response = await api.get("/api/attendance/today");
    return response.data;
  },

  getHistory: async (params = {}) => {
    const response = await api.get("/api/attendance/history", { params });
    return response.data;
  },
};

export const adminService = {
  getCompanySettings: async () => {
    const response = await api.get("/api/admin/company");
    return response.data;
  },

  updateCompanySettings: async (data) => {
    const response = await api.put("/api/admin/company", data);
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const response = await api.get("/api/admin/audit-logs", { params });
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get("/api/admin/dashboard");
    return response.data;
  },

  getEmployees: async () => {
    const response = await api.get("/api/admin/employees");
    return response.data;
  },

  createEmployee: async (data) => {
    const response = await api.post("/api/admin/employees", data);
    return response.data;
  },

  updateEmployee: async (employeeId, data) => {
    const response = await api.put(`/api/admin/employees/${employeeId}`, data);
    return response.data;
  },

  deleteEmployee: async (employeeId) => {
    await api.delete(`/api/admin/employees/${employeeId}`);
  },

  getAttendanceSheet: async (params = {}) => {
    const response = await api.get("/api/admin/attendance-sheet", { params });
    return response.data;
  },

  verifyAttendance: async (attendanceId, payload) => {
    const response = await api.post(`/api/admin/verify-attendance/${attendanceId}`, payload);
    return response.data;
  },

  getAllAttendance: async (params = {}) => {
    const response = await api.get("/api/admin/attendance", { params });
    return response.data;
  },

  getReports: async (params = {}) => {
    const response = await api.get("/api/admin/reports", { params });
    return response.data;
  },
};
