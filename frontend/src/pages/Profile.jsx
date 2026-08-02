import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FiCamera, FiCheckCircle, FiCreditCard, FiEdit, FiMail, FiPhone, FiSave, FiUser } from "react-icons/fi";
import DigitalIdCard from "../components/DigitalIdCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import { getImageUrl } from "../services/api";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState("idcard"); // 'idcard' | 'details' | 'edit'

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

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          <FiUser className="text-indigo-600 dark:text-indigo-400" /> Employee Profile & Identity Card
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          View official enterprise credentials, generate printable Digital ID card, and edit profile details.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-500 dark:text-slate-400">
        <button
          onClick={() => setActiveTab("idcard")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === "idcard"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
              : "border-transparent hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <FiCreditCard /> Digital Employee ID Card
        </button>

        <button
          onClick={() => setActiveTab("details")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === "details"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
              : "border-transparent hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <FiUser /> Profile Details
        </button>

        <button
          onClick={() => setActiveTab("edit")}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === "edit"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 font-extrabold"
              : "border-transparent hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          <FiEdit /> Edit Profile & Photo
        </button>
      </div>

      {/* Tab 1: Digital ID Card */}
      {activeTab === "idcard" && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Official Identity Credential</span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">Digital Employee ID Card</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Contains unique QR code for verified on-site field scanning and PDF export.</p>
          </div>

          <DigitalIdCard employee={user} />
        </div>
      )}

      {/* Tab 2: Profile Details */}
      {activeTab === "details" && (
        <div className="rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <img
                src={getImageUrl(user?.photo) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
                alt={user?.full_name}
                className="h-24 w-24 object-cover rounded-2xl border-2 border-indigo-500 shadow-sm"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
                }}
              />
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{user?.full_name}</h2>
                <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{user?.designation} &bull; {user?.department}</div>
                <div className="font-mono text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Employee ID: {user?.employee_id}</div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("edit")}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <FiEdit /> Edit Profile
            </button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 text-xs">
            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1 font-bold"><FiMail /> Email Address</span>
              <div className="font-bold text-slate-900 dark:text-slate-200">{user?.email}</div>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1 font-bold"><FiPhone /> Phone Number</span>
              <div className="font-bold text-slate-900 dark:text-slate-200">{user?.phone || "+1-555-0199"}</div>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1 font-bold"><FiUser /> Department</span>
              <div className="font-bold text-slate-900 dark:text-slate-200">{user?.department}</div>
            </div>

            <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1 font-bold"><FiUser /> Role Hierarchy</span>
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">{user?.role || "Employee"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Edit Profile & Photo */}
      {activeTab === "edit" && (
        <form onSubmit={handleSaveProfile} className="rounded-3xl bg-white dark:bg-slate-900 p-8 border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <FiEdit className="text-indigo-600 dark:text-indigo-400" /> Edit Employee Profile & Upload Photo
          </h2>

          {/* Profile Photo Uploader */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <img
              src={getImageUrl(photoPreview) || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"}
              alt="Profile Preview"
              className="h-24 w-24 object-cover rounded-2xl border-2 border-indigo-500 shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80";
              }}
            />

            <div className="space-y-2 text-center sm:text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Upload New Profile Picture</div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Upload a professional headshot for your Digital ID Card & HR records.</p>
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-700 transition">
                {uploadingPhoto ? <LoadingSpinner size="sm" /> : <><FiCamera /> Choose Photo File</>}
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Designation / Title</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-indigo-500 focus:outline-none font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition"
          >
            {saving ? <LoadingSpinner size="sm" /> : <><FiSave /> Save Profile Changes</>}
          </button>
        </form>
      )}
    </div>
  );
};

export default Profile;
