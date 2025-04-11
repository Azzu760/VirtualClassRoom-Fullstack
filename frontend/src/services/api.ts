import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Define TypeScript interfaces
interface Classroom {
  id: string;
  name: string;
  code: string;
  subject?: string;
  students?: number;
  status?: "active" | "archived";
  teacherId?: string;
  teacherName?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  datePosted: string;
  classroomId: string;
  userId: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  classroomId: string;
  userId: string;
}

export interface Grade {
  id: string;
  score: number;
  feedback?: string;
  assignmentId: string;
  userId: string;
}

// Define the type for a student
export interface Student {
  id: string;
  name: string;
  email: string;
}

// Define the type for a teacher
export interface Teacher {
  id: string;
  name: string;
  email: string;
}

// Define the response type
export interface ClassroomStudentsResponse {
  teacher: Teacher;
  students: Student[];
}

// Fetch all classrooms
export const getClassrooms = async (): Promise<Classroom[]> => {
  try {
    const response = await axios.get<Classroom[]>(`${API_BASE_URL}/classrooms`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to fetch classrooms:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to fetch classrooms"
    );
  }
};

// Fetch a specific classroom by ID
export const getClassroomById = async (id: string): Promise<Classroom> => {
  try {
    const response = await axios.get<Classroom>(
      `${API_BASE_URL}/classrooms/${id}`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to fetch classroom:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.error || "Failed to fetch classroom");
  }
};

// Fetch announcements for a classroom
export const getAnnouncementsByClassroomId = async (
  classroomId: string
): Promise<Announcement[]> => {
  if (!classroomId) {
    console.error("Classroom ID is missing");
    throw new Error("Classroom ID is required");
  }

  try {
    const response = await axios.get<Announcement[]>(
      `${API_BASE_URL}/classrooms/${classroomId}/announcements`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to fetch announcements:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to fetch announcements"
    );
  }
};

// Fetch assignments for a classroom
export const getAssignmentsByClassroomId = async (
  classroomId: string
): Promise<Assignment[]> => {
  try {
    const response = await axios.get<Assignment[]>(
      `${API_BASE_URL}/classrooms/${classroomId}/assignments`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to fetch assignments:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to fetch assignments"
    );
  }
};

// Fetch classrooms created by a specific teacher
export const getClassroomsByTeacherId = async (
  teacherId: string
): Promise<Classroom[]> => {
  try {
    const response = await axios.get<Classroom[]>(
      `${API_BASE_URL}/classrooms/teacher/${teacherId}`
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to fetch classrooms by teacher:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to fetch classrooms by teacher"
    );
  }
};

// Create a new classroom
export const createClassroom = async (
  classroomData: Omit<Classroom, "id">
): Promise<Classroom> => {
  try {
    const response = await axios.post<Classroom>(
      `${API_BASE_URL}/classrooms`,
      classroomData
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to create classroom:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to create classroom"
    );
  }
};

// Create a new announcement
export const createAnnouncement = async (
  classroomId: string,
  announcementData: Omit<Announcement, "id" | "datePosted">
): Promise<Announcement> => {
  try {
    const response = await axios.post<Announcement>(
      `${API_BASE_URL}/classrooms/${classroomId}/announcements`,
      announcementData
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to create announcement:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to create announcement"
    );
  }
};

// Join a classroom using a code
export const joinClassroom = async (
  code: string,
  userId: string
): Promise<Classroom> => {
  try {
    const response = await axios.post<Classroom>(
      `${API_BASE_URL}/classrooms/join`,
      { code, userId }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to join classroom:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.error || "Failed to join classroom");
  }
};

// Archive or unarchive a classroom
export const archiveClassroom = async (
  classroomId: string,
  userId: string,
  userRole: string
): Promise<Classroom> => {
  try {
    const response = await axios.patch<Classroom>(
      `${API_BASE_URL}/classrooms/${classroomId}/archive`,
      { userId, userRole }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Failed to archive classroom:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to archive classroom"
    );
  }
};

// Fetch classrooms where the user is enrolled
export const getEnrolledClassroomByUserId = async (
  userId: string
): Promise<Classroom[]> => {
  try {
    const response = await axios.get<{ success: boolean; data: Classroom[] }>(
      `${API_BASE_URL}/classrooms/enrolled/${userId}`
    );

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error("Failed to fetch enrolled classrooms");
    }
  } catch (error: any) {
    console.error(
      "Failed to fetch enrolled classrooms:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to fetch enrolled classrooms"
    );
  }
};

// Fetch students by classroom ID
export const getStudentsByClassroomId = async (
  classroomId: string
): Promise<ClassroomStudentsResponse> => {
  try {
    const response = await axios.get<{
      success: boolean;
      data: ClassroomStudentsResponse;
    }>(`${API_BASE_URL}/classrooms/${classroomId}/students`);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        "Failed to fetch students: API returned unsuccessful response"
      );
    }
  } catch (error: any) {
    console.error(
      "Failed to fetch students:",
      error.response?.data || error.message
    );
    throw new Error(error.response?.data?.error || "Failed to fetch students");
  }
};

export const fetchUpcomingDeadlineAssignments = async (classroomId: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/classrooms/${classroomId}/upcoming-assignments`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching upcoming assignments:", error);
    throw error;
  }
};

export const fetchUpcomingAssignmentsByUserId = async (userId: string) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/classrooms/${userId}/deadline-assignments`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching assignments:", error);
    throw error;
  }
};
