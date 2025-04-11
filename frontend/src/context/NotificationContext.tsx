import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import {
  fetchNotifications as apiFetchNotifications,
  markNotificationsAsRead as apiMarkNotificationsAsRead,
  Notification,
} from "@/services/notificationApi";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: (userId: string) => Promise<void>;
  markAsRead: (
    userId: string,
    notificationIds: string[],
    type: "grade" | "announcement" | "assignment" | "material"
  ) => Promise<void>;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refreshNotifications = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const fetchNotifications = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiFetchNotifications(userId);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      setError("Failed to load notifications");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(
    async (
      userId: string,
      notificationIds: string[],
      type: "grade" | "announcement" | "assignment" | "material"
    ) => {
      try {
        await apiMarkNotificationsAsRead(userId, notificationIds, type);
        setNotifications((prev) =>
          prev.map((notification) =>
            notificationIds.includes(notification.id)
              ? { ...notification, isNew: false }
              : notification
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
      } catch (err) {
        console.error("Failed to mark notifications as read:", err);
      }
    },
    []
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        error,
        fetchNotifications,
        markAsRead,
        refreshNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
};
