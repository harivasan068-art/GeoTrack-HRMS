import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import InstallPwaBanner from "./components/InstallPwaBanner";
import OfflineScreen from "./components/OfflineScreen";
import ProtectedRoute from "./components/ProtectedRoute";
import PwaSplashScreen from "./components/PwaSplashScreen";
import { BrandingProvider } from "./context/BrandingContext";
import { AuthProvider } from "./hooks/useAuth";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";
import MainLayout from "./layouts/MainLayout";

// Public SaaS Pages
import About from "./pages/About";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import LandingPage from "./pages/LandingPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Services from "./pages/Services";
import Terms from "./pages/Terms";

// Auth & Employee Pages
import Attendance from "./pages/Attendance";
import AttendanceHistory from "./pages/AttendanceHistory";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

// Admin Enterprise Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLogin from "./pages/admin/AdminLogin";
import AuditLogs from "./pages/admin/AuditLogs";
import CompanySettings from "./pages/admin/CompanySettings";
import Employees from "./pages/admin/Employees";
import GeotagVerificationSheet from "./pages/admin/GeotagVerificationSheet";
import Reports from "./pages/admin/Reports";

const AdminProtectedRoute = ({ children }) => (
  <ProtectedRoute adminOnly>{children}</ProtectedRoute>
);

const EmployeeProtectedRoute = ({ children }) => (
  <ProtectedRoute adminOnly={false}>{children}</ProtectedRoute>
);

function App() {
  return (
    <BrandingProvider>
      <AuthProvider>
        <OfflineScreen>
          <PwaSplashScreen>
            <BrowserRouter>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    borderRadius: "12px",
                    background: "#0f172a",
                    color: "#fff",
                    fontSize: "13px",
                    border: "1px solid #1e293b",
                  },
                  success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
                  error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
                }}
              />

              <InstallPwaBanner />

              <Routes>
                {/* Public Platform Webpages */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/features" element={<Features />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<Terms />} />

                {/* Auth Portals */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                {/* Employee Portal */}
                <Route
                  element={
                    <EmployeeProtectedRoute>
                      <MainLayout />
                    </EmployeeProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/attendance/history" element={<AttendanceHistory />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Admin Enterprise Portal */}
                <Route
                  element={
                    <AdminProtectedRoute>
                      <AdminLayout />
                    </AdminProtectedRoute>
                  }
                >
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/verifications" element={<GeotagVerificationSheet />} />
                  <Route path="/admin/employees" element={<Employees />} />
                  <Route path="/admin/reports" element={<Reports />} />
                  <Route path="/admin/audit-logs" element={<AuditLogs />} />
                  <Route path="/admin/settings" element={<CompanySettings />} />
                </Route>

                <Route path="/404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </PwaSplashScreen>
        </OfflineScreen>
      </AuthProvider>
    </BrandingProvider>
  );
}

export default App;
