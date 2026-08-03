import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { FiImage, FiVideo, FiUploadCloud, FiTrash2, FiFileText, FiDownload, FiPlus, FiX } from "react-icons/fi";
import { workProofService } from "../services/workProofService";
import { getImageUrl } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

const WorkProofSection = ({ attendanceId, isReadOnly = false }) => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [description, setDescription] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(!isReadOnly);

  const fetchProofs = async () => {
    try {
      setLoading(true);
      const data = await workProofService.getProofs(attendanceId);
      setProofs(data || []);
    } catch (e) {
      console.error("Failed to load work proofs:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (attendanceId) {
      fetchProofs();
    }
  }, [attendanceId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveSelected = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select an image or video file to upload.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("attendance_id", attendanceId);
      formData.append("file", selectedFile);
      if (description.trim()) {
        formData.append("description", description.trim());
      }

      await workProofService.uploadProof(formData);
      toast.success("Work proof uploaded successfully!");
      setSelectedFile(null);
      setFilePreview(null);
      setDescription("");
      setShowUploadForm(false);
      fetchProofs();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to upload work proof");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (proofId) => {
    if (!window.confirm("Are you sure you want to delete this work proof?")) return;
    try {
      await workProofService.deleteProof(proofId);
      toast.success("Work proof deleted successfully.");
      setProofs(proofs.filter((p) => p.id !== proofId));
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to delete work proof");
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2 font-display">
          <FiImage className="text-orange-600 dark:text-orange-400" /> Work Completion Proofs ({proofs.length})
        </h4>
        {!isReadOnly && (
          <button
            type="button"
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-orange-500/10 px-3.5 py-2 min-h-[40px] text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-500/20 hover:bg-orange-600 hover:text-white transition active:scale-95"
          >
            <FiPlus className="h-4 w-4" /> Add Work Proof
          </button>
        )}
      </div>

      {/* Upload Form Sheet */}
      {!isReadOnly && showUploadForm && (
        <form onSubmit={handleSubmit} className="rounded-3xl bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          {/* Media Type Toggle Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setMediaType("image"); setSelectedFile(null); setFilePreview(null); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-extrabold min-h-[44px] transition-all border ${
                mediaType === "image"
                  ? "bg-orange-600 text-white border-orange-600 shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
              }`}
            >
              <FiImage className="h-4 w-4" /> Poster / Site Photo
            </button>
            <button
              type="button"
              onClick={() => { setMediaType("video"); setSelectedFile(null); setFilePreview(null); }}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-extrabold min-h-[44px] transition-all border ${
                mediaType === "video"
                  ? "bg-orange-600 text-white border-orange-600 shadow-md"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
              }`}
            >
              <FiVideo className="h-4 w-4" /> Work Video
            </button>
          </div>

          {/* File Picker & Remove Option */}
          <div>
            <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 uppercase font-mono tracking-wider">
              Select {mediaType === "image" ? "Image File (JPG, PNG, WEBP max 10MB)" : "Video File (MP4, MOV, WEBM max 100MB)"}
            </label>

            {!selectedFile ? (
              <input
                type="file"
                accept={mediaType === "image" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/quicktime,video/webm"}
                onChange={handleFileChange}
                className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-600 dark:file:text-orange-400 hover:file:bg-orange-500/20 cursor-pointer"
              />
            ) : (
              <div className="relative rounded-2xl bg-white dark:bg-slate-900 p-3 border border-orange-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  {mediaType === "image" && filePreview ? (
                    <img src={filePreview} alt="Preview" className="h-12 w-12 object-cover rounded-xl border shrink-0" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center shrink-0">
                      <FiVideo className="h-6 w-6" />
                    </div>
                  )}
                  <div className="truncate">
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveSelected}
                  className="rounded-xl p-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 hover:bg-rose-600 hover:text-white transition"
                  title="Remove selected file before upload"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Description Input */}
          <div>
            <input
              type="text"
              placeholder="Description (e.g. Poster site 1, Completed branding installation)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-2xl bg-white dark:bg-slate-900 px-4 py-3 min-h-[48px] text-xs sm:text-sm border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500 font-medium"
            />
          </div>

          {/* Submit Action Row */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => { setShowUploadForm(false); handleRemoveSelected(); }}
              className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3 min-h-[44px] text-xs font-extrabold text-white shadow hover:from-orange-500 hover:to-amber-500 disabled:opacity-50"
            >
              {uploading ? <LoadingSpinner size="sm" /> : <><FiUploadCloud className="h-4 w-4" /> Upload Proof</>}
            </button>
          </div>
        </form>
      )}

      {/* Proofs List Grid */}
      {loading ? (
        <div className="text-center py-4"><LoadingSpinner size="sm" /></div>
      ) : proofs.length === 0 ? (
        <p className="text-xs text-slate-400 italic">No additional work proofs uploaded for this attendance.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {proofs.map((p) => (
            <div key={p.id} className="relative rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  {p.media_type === "video" ? <FiVideo /> : <FiImage />}
                  {p.media_type === "video" ? "Work Video" : "Work Image"}
                </span>
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="font-mono">{formatTime(p.uploaded_at)}</span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="text-rose-500 hover:text-rose-700 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950"
                      title="Delete proof"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {p.media_type === "video" ? (
                <video
                  src={getImageUrl(p.file_url)}
                  controls
                  className="h-40 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800 bg-black"
                />
              ) : (
                <img
                  src={getImageUrl(p.file_url)}
                  alt={p.description || "Work Proof"}
                  className="h-40 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80";
                  }}
                />
              )}

              {p.description && (
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate flex items-center gap-1">
                  <FiFileText className="text-slate-400 shrink-0" /> {p.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkProofSection;
