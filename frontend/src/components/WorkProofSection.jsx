import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { FiImage, FiVideo, FiUploadCloud, FiTrash2, FiFileText, FiDownload, FiPlus } from "react-icons/fi";
import { workProofService } from "../services/workProofService";
import { getImageUrl } from "../services/api";
import LoadingSpinner from "./LoadingSpinner";

const WorkProofSection = ({ attendanceId, isReadOnly = false }) => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [mediaType, setMediaType] = useState("image");
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  const [showUploadForm, setShowUploadForm] = useState(!isReadOnly);

  const fetchProofs = async () => {
    try {
      setLoading(true);
      const data = await workProofService.getProofs(attendanceId);
      setProofs(data);
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
    }
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
          <FiImage className="text-orange-600 dark:text-orange-400" /> Today's Work Proofs ({proofs.length})
        </h4>
        {!isReadOnly && (
          <button
            type="button"
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 px-3 py-1.5 text-xs font-bold text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 hover:bg-orange-600 hover:text-white transition"
          >
            <FiPlus className="h-3.5 w-3.5" /> Add Work Proof
          </button>
        )}
      </div>

      {/* Upload Form */}
      {!isReadOnly && showUploadForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          {/* Media Type Toggle Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setMediaType("image"); setSelectedFile(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition border ${
                mediaType === "image"
                  ? "bg-orange-600 text-white border-orange-600 shadow"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
              }`}
            >
              <FiImage /> Poster / Site Image
            </button>
            <button
              type="button"
              onClick={() => { setMediaType("video"); setSelectedFile(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition border ${
                mediaType === "video"
                  ? "bg-orange-600 text-white border-orange-600 shadow"
                  : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800"
              }`}
            >
              <FiVideo /> Work Video
            </button>
          </div>

          {/* File Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select {mediaType === "image" ? "Image (JPG, PNG, WEBP max 10MB)" : "Video (MP4, MOV, WEBM max 100MB)"}
            </label>
            <input
              type="file"
              accept={mediaType === "image" ? "image/jpeg,image/png,image/webp" : "video/mp4,video/quicktime,video/webm"}
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-100 file:text-orange-700 dark:file:bg-orange-950 dark:file:text-orange-400 hover:file:bg-orange-200 cursor-pointer"
            />
          </div>

          {/* Description Input */}
          <div>
            <input
              type="text"
              placeholder="Description (e.g. Poster site 1, Work completion photo)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl bg-white dark:bg-slate-900 px-3.5 py-2 text-xs border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowUploadForm(false)}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-1.5 text-xs font-bold text-white shadow hover:bg-orange-700 disabled:opacity-50"
            >
              {uploading ? <LoadingSpinner size="sm" /> : <><FiUploadCloud /> Submit Work Proof</>}
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
            <div key={p.id} className="relative group rounded-2xl bg-slate-50 dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  {p.media_type === "video" ? <FiVideo /> : <FiImage />}
                  {p.media_type === "video" ? "Work Video" : "Work Image"}
                </span>
                <div className="flex items-center gap-2 text-slate-400">
                  <span>{formatTime(p.uploaded_at)}</span>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id)}
                      className="text-rose-500 hover:text-rose-700 p-1"
                      title="Delete proof"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {p.media_type === "video" ? (
                <video
                  src={getImageUrl(p.file_url)}
                  controls
                  className="h-36 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800 bg-black"
                />
              ) : (
                <img
                  src={getImageUrl(p.file_url)}
                  alt={p.description || "Work Proof"}
                  className="h-36 w-full object-cover rounded-xl border border-slate-200 dark:border-slate-800"
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
