import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const userData = await authService.getMe();
          setUser((prev) => ({ ...prev, ...userData }));
          localStorage.setItem("user", JSON.stringify({ ...user, ...userData }));
        } catch (error) {
          console.error("Auth verification failed:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    const { access_token, role, employee_id, full_name } = response;

    localStorage.setItem("token", access_token);
    setToken(access_token);

    const userObj = {
      employee_id,
      email,
      full_name,
      role: role || (response.designation?.toLowerCase() === "admin" ? "admin" : "employee"),
    };

    localStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);

    try {
      const fullProfile = await authService.getMe();
      const mergedUser = { ...userObj, ...fullProfile, role: role || userObj.role };
      setUser(mergedUser);
      localStorage.setItem("user", JSON.stringify(mergedUser));
    } catch (e) {
      console.warn("Could not fetch full user profile on login", e);
    }

    return response;
  };

  const updateUser = (userData) => {
    setUser((prev) => {
      const updated = { ...prev, ...userData };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
    }
  };

  const register = async (data) => {
    return await authService.register(data);
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === "admin" || user?.designation?.toLowerCase() === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        register,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
