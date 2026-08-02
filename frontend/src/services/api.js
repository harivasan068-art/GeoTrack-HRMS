import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not configured");
}

export const getImageUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  // Filter out invalid or empty Base64 data URIs
  if (trimmed.startsWith("data:")) {
    const parts = trimmed.split(",");
    if (parts.length < 2 || !parts[1] || parts[1].trim().length < 30) {
      return null;
    }
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("blob:")) {
    return trimmed;
  }
  const rootUrl = API_BASE_URL ? API_BASE_URL.replace(/\/api\/?$/, "") : "";
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${rootUrl}${cleanPath}`;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
