import api from "./api";

export const workProofService = {
  uploadProof: async (formData) => {
    const response = await api.post("/work-proof/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getProofs: async (attendanceId) => {
    const response = await api.get(`/work-proof/${attendanceId}`);
    return response.data;
  },

  deleteProof: async (proofId) => {
    const response = await api.delete(`/work-proof/${proofId}`);
    return response.data;
  },
};