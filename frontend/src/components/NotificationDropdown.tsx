import { Bell, FileText, Megaphone, ClipboardList, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/types";
import { Separator } from "./ui/separator";
import { useNotifications } from "@/context/NotificationContext";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "grade":
      return <FileText className="h-4 w-4 mr-2" />;
    case "announcement":
      return <Megaphone className="h-4 w-4 mr-2" />;
    case "assignment":
      return <ClipboardList className="h-4 w-4 mr-2" />;
    case "material":
      return <Book className="h-4 w-4 mr-2" />;
    default:
      return <Bell className="h-4 w-4 mr-2" />;
  }
};

interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  currentUserId: string | null;
}

export const NotificationDropdown = ({
  notifications,
  unreadCount,
  currentUserId,
}: NotificationDropdownProps) => {
  const { markAsRead } = useNotifications();

  const handleNotificationClick = async (notification: Notification) => {
    if (!currentUserId) return;

    try {
      await markAsRead(currentUserId, [notification.id], notification.type);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-80 max-h-96 overflow-y-auto"
        align="end"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div key={notification.id}>
              <DropdownMenuItem
                onClick={() => handleNotificationClick(notification)}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                onSelect={(e) => e.preventDefault()}
              >
                <div className="flex justify-between w-full items-center">
                  <div className="flex items-center">
                    {getNotificationIcon(notification.type)}
                    <span className="font-medium capitalize">
                      {notification.type}
                    </span>
                    {notification.isNew && (
                      <Badge variant="secondary" className="ml-2">
                        New
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(notification.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="text-sm pl-6 w-full">
                  {notification.type === "grade" && (
                    <>
                      <span className="font-medium">
                        {notification.score}% in {notification.assignment}
                      </span>
                      {notification.feedback && (
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {notification.feedback}
                        </p>
                      )}
                    </>
                  )}

                  {notification.type === "announcement" && (
                    <>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {notification.content}
                      </p>
                    </>
                  )}

                  {notification.type === "assignment" && (
                    <>
                      <p className="font-medium">
                        New assignment: {notification.title}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Due:{" "}
                        {new Date(notification.dueDate || "").toLocaleString()}
                      </p>
                    </>
                  )}

                  {notification.type === "material" && (
                    <>
                      <p className="font-medium">
                        New material: {notification.title}
                      </p>
                      {notification.description && (
                        <p className="text-gray-600 dark:text-gray-300 mt-1">
                          {notification.description}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </DropdownMenuItem>
              <Separator className="last:hidden" />
            </div>
          ))
        ) : (
          <DropdownMenuItem
            className="justify-center py-4 text-gray-500 dark:text-gray-400"
            disabled
          >
            No new notifications
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
