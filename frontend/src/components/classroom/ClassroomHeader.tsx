import { Link } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useData } from "@/context/DataContext";
import { useEffect, useState } from "react";
import { Classroom } from "@/types";
import { useNotifications } from "@/context/NotificationContext";
import { NotificationDropdown } from "@/components/NotificationDropdown";

interface ClassroomHeaderProps {
  classroom: Classroom;
}

const ClassroomHeader = ({ classroom }: ClassroomHeaderProps) => {
  const { toast } = useToast();
  const { getStudentsByClassroomId } = useData();
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const { notifications, unreadCount, fetchNotifications, markAsRead } =
    useNotifications();

  // Retrieve user data from localStorage
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const { students } = await getStudentsByClassroomId(classroom.id);
        setStudentCount(students.length);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch students",
          variant: "destructive",
        });
      }
    };

    fetchStudents();
  }, [classroom.id, getStudentsByClassroomId, toast]);

  // Fetch notifications when component mounts or user changes
  useEffect(() => {
    if (user?.id && user?.role !== "teacher") {
      // Only fetch if not teacher
      fetchNotifications(user.id);
    }
  }, [user?.id, user?.role, fetchNotifications]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm fixed w-full z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-500 hover:text-gray-700 mr-6"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                {classroom.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {classroom.subject} • {classroom.code}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              {studentCount !== null
                ? `${studentCount} Students`
                : "Loading..."}
            </Button>

            {user?.role !== "teacher" && (
              <NotificationDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                markAsRead={markAsRead}
                currentUserId={user?.id || null}
              />
            )}

            <div className="flex items-center space-x-2 ml-2">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClassroomHeader;
