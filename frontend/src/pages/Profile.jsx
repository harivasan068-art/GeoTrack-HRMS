import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  FiCamera,
  FiCheckCircle,
  FiCreditCard,
  FiEdit,
  FiMail,
  FiPhone,
  FiSave,
  FiUser,
  FiLogOut,
  FiBriefcase,
  FiHash,
} from "react-icons/fi";
import DigitalIdCard from "../components/DigitalIdCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import { getImageUrl } from "../services/api";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'idcard' | 'edit'

  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    department: user?.department || "",
    designation: user?.designation || "",
  });

  const [photoPreview, setPhotoPreview] = useState(user?.photo || "");

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        phone: user.phone || "",
        department: user.department || "",
        designation: user.designation || "",
      });
      setPhotoPreview(user.photo || "");
    }
  }, [user]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const data = new FormData();
      data.append("photo", file);
      const updatedUser = await authService.uploadProfilePhoto(data);
      updateUser(updatedUser);
      setPhotoPreview(updatedUser.photo);
      toast.success("Profile photo updated successfully!");
    } catch {
      toast.error("Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await authService.updateProfile(formData);
      updateUser(updatedUser);
      toast.success("Profile updated successfully!");
      setActiveTab("details");
    } catch {
      toast.error("Failed to update profile details");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 font-sans pb-16">
      {/* Title Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
          <FiUser className="text-orange-600 dark:text-orange-400" /> Profile & Identity
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Manage employee profile, update photo, and access Digital ID card.
        </p>
      </div>

      {/* Top Hero Profile Avatar Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left"
      >
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Avatar with Camera Overlay */}
          <div className="relative group shrink-0">
            <img
              src={getImageUrl(photoPreview) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
              alt={user?.full_name}
              className="h-24 w-24 sm:h-28 sm:w-28 object-cover rounded-full border-4 border-orange-500 shadow-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
              }}
            />
            <label
              className="absolute bottom-0 right-0 rounded-full bg-orange-600 p-2.5 text-white shadow-lg cursor-pointer hover:bg-orange-500 transition min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Change Profile Photo"
            >
              {uploadingPhoto ? <LoadingSpinner size="sm" /> : <FiCamera className="h-4 w-4" />}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploadingPhoto}
              />
            </label>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white font-display">
              {user?.full_name}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-orange-600 dark:text-orange-400 mt-0.5">
              {user?.designation || "Staff"} &bull; {user?.department || "General"}
            </p>
            <div className="inline-block font-mono text-xs text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl mt-2">
              Employee ID: {user?.employee_id}
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveTab("edit")}
          className="inline-flex items-center gap-2 rounded-2xl bg-orange-500/10 px-5 py-3 min-h-[48px] text-xs font-extrabold text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:bg-orange-600 hover:text-white transition active:scale-95 shrink-0"
        >
          <FiEdit className="h-4 w-4" /> Edit Profile
        </button>
      </motion.div>

      {/* Tabs Row (Touch Target 48px) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-extrabold text-slate-500 dark:text-slate-400 overflow-x-auto">
        <button
          onClick={() => setActiveTab("details")}
          className={`py-3.5 px-5 flex items-center gap-2 border-b-2 transition whitespace-nowrap min-h-[48px] ${
            activeTab === "details"
              ? "border-orange-600 text-orange-600 dark:text-orange-400 font-extrabold"
              : "border-transparent hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FiUser className="h-4 w-4" /> Details
        </button>

        <button
          onClick={() => setActiveTab("idcard")}
          className={`py-3.5 px-5 flex items-center gap-2 border-b-2 transition whitespace-nowrap min-h-[48px] ${
            activeTab === "idcard"
              ? "border-orange-600 text-orange-600 dark:text-orange-400 font-extrabold"
              : "border-transparent hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FiCreditCard className="h-4 w-4" /> Digital ID Card
        </button>

        <button
          onClick={() => setActiveTab("edit")}
          className={`py-3.5 px-5 flex items-center gap-2 border-b-2 transition whitespace-nowrap min-h-[48px] ${
            activeTab === "edit"
              ? "border-orange-600 text-orange-600 dark:text-orange-400 font-extrabold"
              : "border-transparent hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <FiEdit className="h-4 w-4" /> Edit Form
        </button>
      </div>

      {/* Tab 1: Profile Details */}
      {activeTab === "details" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Full Name</span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">{user?.full_name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white truncate">{user?.email}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">{user?.phone || "--"}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Department & Designation</span>
              <p className="font-extrabold text-sm text-slate-900 dark:text-white">{user?.designation} &bull; {user?.department}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 px-5 py-3.5 min-h-[48px] text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white transition"
            >
              <FiLogOut className="h-5 w-5" /> Logout of Account
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Digital ID Card */}
      {activeTab === "idcard" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm"
        >
          <DigitalIdCard employee={user} />
        </motion.div>
      )}

      {/* Tab 3: Edit Profile */}
      {activeTab === "edit" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
                Full Name
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:border-orange-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
                  Designation
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-3 min-h-[48px] text-xs sm:text-sm text-slate-900 dark:text-white font-medium focus:border-orange-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 py-3.5 min-h-[48px] text-xs sm:text-sm font-extrabold text-white shadow-md hover:from-orange-500 hover:to-amber-500 transition disabled:opacity-60 font-sans tracking-wide mt-2"
            >
              {saving ? <LoadingSpinner size="sm" /> : <><FiSave className="h-5 w-5" /> Save Profile Details</>}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  );
};

export default Profile;
