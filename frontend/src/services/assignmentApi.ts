import axios from "axios";
import type { Assignment, Submission, Grade, SubmissionDetail } from "@/types";

const API_URL = "http://localhost:5000/api";

// Unified file download handler
const handleFileDownload = (data: Blob, fileName: string): void => {
  const url = window.URL.createObjectURL(data);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 100);
};

// Extract filename from headers with fallback
const getFileNameFromHeaders = (headers: any, defaultName: string): string => {
  const contentDisposition = headers["content-disposition"];
  let fileName =
    contentDisposition?.match(/filename="?(.+)"?/)?.[1] || defaultName;

  // Add extension if missing
  if (!fileName.includes(".")) {
    const contentType = headers["content-type"]?.toLowerCase();
    if (contentType?.includes("pdf")) fileName += ".pdf";
    else if (contentType?.includes("msword")) fileName += ".doc";
    else if (contentType?.includes("wordprocessingml")) fileName += ".docx";
  }

  return fileName;
};

// Axios instance with common config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage =
      error.response?.data?.error || error.message || "Request failed";
    console.error("API Error:", errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Assignment-related functions
export const createAssignment = async (
  classroomId: string,
  assignmentData: {
    title: string;
    description?: string;
    dueDate: string;
    status?: "draft" | "published" | "archived";
  },
  file?: File | null
): Promise<Assignment> => {
  const formData = new FormData();
  formData.append("title", assignmentData.title.trim());
  formData.append("description", assignmentData.description?.trim() || "");
  formData.append("dueDate", new Date(assignmentData.dueDate).toISOString());
  formData.append("classroomId", classroomId);
  formData.append("status", assignmentData.status || "published");

  if (file) {
    formData.append("file", file);
  }

  const config = {
    headers: {
      "Content-Type": file ? "multipart/form-data" : "application/json",
    },
  };

  // Convert FormData to plain object if no file is present
  const payload = file
    ? formData
    : {
        title: assignmentData.title.trim(),
        description: assignmentData.description?.trim(),
        dueDate: new Date(assignmentData.dueDate).toISOString(),
        classroomId,
        status: assignmentData.status || "published",
      };

  const { data } = await apiClient.post("/assignments", payload, config);
  return data;
};

export const getClassroomAssignments = async (
  classroomId: string
): Promise<Assignment[]> => {
  const { data } = await apiClient.get(
    `/assignments/${classroomId}/assignments`
  );
  return data;
};

export const downloadAssignmentFile = async (
  assignmentId: string
): Promise<void> => {
  if (!assignmentId) {
    throw new Error("Assignment ID is required");
  }

  const response = await apiClient.get(`/assignments/${assignmentId}/file`, {
    responseType: "blob",
  });

  const fileName = getFileNameFromHeaders(
    response.headers,
    `assignment-${assignmentId}`
  );
  handleFileDownload(response.data, fileName);
};

// Submission-related functions
export const submitAssignment = async (
  assignmentId: string,
  file: File,
  userId: string
): Promise<Submission> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);

  const { data } = await apiClient.post(
    `/assignments/${assignmentId}/submissions`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
};

export const getAssignmentSubmissions = async (
  assignmentId: string
): Promise<Submission[]> => {
  try {
    const { data } = await apiClient.get(
      `/assignments/${assignmentId}/submissions`
    );
    return data;
  } catch (err) {
    console.error("Error fetching submissions:", err); // Debug log
    throw err;
  }
};

export const fetchSubmissionDetails = async (
  assignmentId: string,
  userId: string
): Promise<SubmissionDetail> => {
  try {
    const { data } = await apiClient.get(
      `/assignments/${assignmentId}/submission`,
      { params: { userId } }
    );
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch submission details"
    );
  }
};

export const downloadSubmissionFile = async (
  submissionId: string
): Promise<void> => {
  try {
    const response = await apiClient.get(
      `/assignments/${submissionId}/file/download`,
      {
        responseType: "blob",
      }
    );

    if (response.status === 404) {
      throw new Error("Submission not found");
    }

    const fileName = getFileNameFromHeaders(
      response.headers,
      `submission-${submissionId}`
    );
    handleFileDownload(response.data, fileName);
  } catch (err) {
    console.error("File download error:", err);
    throw err;
  }
};

export const gradeSubmission = async (
  submissionId: string,
  score: number,
  feedback?: string
): Promise<Grade> => {
  const { data } = await apiClient.put(`/assignments/${submissionId}/grade`, {
    score,
    feedback,
  });
  return data;
};

export const fetchStudentAssignments = async (
  classroomId: string,
  userId: string
) => {
  try {
    const response = await axios.get(
      `${API_URL}/assignments/${classroomId}/students/${userId}/assignments`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching student assignments:", error);
    throw error;
  }
};
