import axios from "axios";

const API_URL = "http://localhost:5000/api";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const handleError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    throw new Error(error.response?.data?.error || error.message);
  }
  throw new Error("An unknown error occurred");
};

export const getMaterials = async (classroomId: string) => {
  try {
    const response = await axios.get(`${API_URL}/materials`, {
      params: { classroomId },
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const uploadMaterial = async (data: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/materials`, data, {
      headers: {
        ...getAuthHeader(),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const downloadMaterial = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/materials/${id}/download`, {
      responseType: "blob",
      headers: getAuthHeader(),
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deleteMaterial = async (id: string) => {
  try {
    await axios.delete(`${API_URL}/materials/${id}`, {
      headers: getAuthHeader(),
    });
  } catch (error) {
    handleError(error);
  }
};
