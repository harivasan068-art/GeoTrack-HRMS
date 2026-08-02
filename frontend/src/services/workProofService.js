import api from "./api";

export const workProofService = {
  uploadProof: async (formData) => {
    const response = await api.post("/api/work-proof/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getProofs: async (attendanceId) => {
    const response = await api.get(`/api/work-proof/${attendanceId}`);
    return response.data;
  },

  deleteProof: async (proofId) => {
    const response = await api.delete(`/api/work-proof/${proofId}`);
    return response.data;
  },
};
