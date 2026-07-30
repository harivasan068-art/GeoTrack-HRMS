import api from "./api";

export const authService = {
  register: async (data) => {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/api/auth/profile", data);
    return response.data;
  },

  uploadProfilePhoto: async (formData) => {
    const response = await api.post("/api/auth/upload-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/api/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  },
};
