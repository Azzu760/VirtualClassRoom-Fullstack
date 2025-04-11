import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export interface Notification {
  type: "grade" | "announcement" | "assignment" | "material";
  id: string;
  course: string;
  title: string;
  description?: string;
  content?: string;
  score?: number;
  feedback?: string;
  dueDate?: string;
  timestamp: string;
  isNew: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  count: number;
  unreadCount: number;
  notifications: Notification[];
}

export const fetchNotifications = async (
  userId: string
): Promise<NotificationsResponse> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications`, {
      params: { userId },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markNotificationsAsRead = async (
  userId: string,
  notificationIds: string[],
  type: "grade" | "announcement" | "assignment" | "material"
): Promise<void> => {
  try {
    console.log(userId, notificationIds, type);
    await axios.post(
      `${API_BASE_URL}/notifications/read`,
      { notificationIds, type },
      {
        params: { userId },
        withCredentials: true,
      }
    );
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    throw error;
  }
};
