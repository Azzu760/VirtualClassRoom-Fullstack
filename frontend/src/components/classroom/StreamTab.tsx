import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import AnnouncementCreate from "./AnnouncementCreate";
import AnnouncementItem from "./AnnouncementItem";
import { useData } from "@/context/DataContext";
import { useState, useEffect } from "react";
import type { Announcement } from "@/types";

interface StreamTabProps {
  classroomId: string;
  classroomCode: string;
  announcements: Announcement[];
  isTeacher: boolean;
  userId?: string;
  teacherName: string;
}

interface Assignment {
  title: string;
  dueDate: string;
}

const StreamTab = ({
  classroomId,
  classroomCode,
  announcements,
  isTeacher,
  userId,
  teacherName,
}: StreamTabProps) => {
  const { toast } = useToast();
  const { createAnnouncement, getUpcomingDeadlineAssignments } = useData();
  const [announcementsList, setAnnouncementsList] = useState<Announcement[]>(
    []
  );
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>(
    []
  );
  const [visibleCount, setVisibleCount] = useState(2);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  useEffect(() => {
    const sortedAnnouncements = [...announcements].sort(
      (a, b) =>
        new Date(b.datePosted).getTime() - new Date(a.datePosted).getTime()
    );
    setAnnouncementsList(sortedAnnouncements);
  }, [announcements]);

  useEffect(() => {
    const fetchUpcomingAssignments = async () => {
      try {
        setIsLoadingUpcoming(true);
        const response = await getUpcomingDeadlineAssignments(classroomId);
        if (response.success) {
          const sortedAssignments = response.data.sort(
            (a, b) =>
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          );
          setUpcomingAssignments(sortedAssignments);
        }
      } catch (error) {
        console.error("Failed to fetch upcoming assignments:", error);
        toast({
          title: "Error",
          description: "Failed to load upcoming assignments",
          variant: "destructive",
        });
      } finally {
        setIsLoadingUpcoming(false);
      }
    };

    fetchUpcomingAssignments();
  }, [classroomId, getUpcomingDeadlineAssignments, toast]);

  const handleCreateAnnouncement = async (title: string, content: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User not authenticated",
        variant: "destructive",
      });
      return;
    }

    try {
      const announcementData = {
        title,
        content,
        userId,
        classroomId,
        datePosted: new Date().toISOString(),
      };

      const newAnnouncement = await createAnnouncement(
        classroomId,
        announcementData
      );

      if (newAnnouncement) {
        setAnnouncementsList((prev) => [newAnnouncement, ...prev]);
        toast({
          title: "Success",
          description: "Announcement created",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create announcement",
        variant: "destructive",
      });
    }
  };

  const handleShowMore = () => {
    setIsLoadingMore(true);
    setVisibleCount((prev) => prev + 2);
    setIsLoadingMore(false);
  };

  const handleViewAll = () => {
    setShowAllUpcoming(!showAllUpcoming);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getBorderColor = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const timeDiff = due.getTime() - now.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);

    if (daysDiff < 1) return "border-red-500"; // Less than 1 day - urgent (red)
    if (daysDiff < 3) return "border-orange-500"; // 1-3 days - warning (orange)
    return "border-blue-500"; // More than 3 days - normal (blue)
  };

  const visibleAnnouncements = announcementsList.slice(0, visibleCount);
  const visibleUpcomingAssignments = showAllUpcoming
    ? upcomingAssignments
    : upcomingAssignments.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2 space-y-4">
        {isTeacher && (
          <AnnouncementCreate onCreate={handleCreateAnnouncement} />
        )}

        <div className="space-y-4">
          {visibleAnnouncements.length > 0 ? (
            <>
              {visibleAnnouncements.map((announcement, index) => (
                <AnnouncementItem
                  key={announcement.id}
                  announcement={announcement}
                  index={index}
                  classroomId={classroomId}
                  teacherName={teacherName}
                />
              ))}

              {announcementsList.length > visibleCount && (
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShowMore}
                    disabled={isLoadingMore}
                  >
                    {isLoadingMore ? "Loading..." : "Show More"}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                No announcements
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
        >
          <h2 className="text-base font-semibold mb-3 flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-blue-500" />
            Upcoming
          </h2>
          <div className="space-y-2">
            {isLoadingUpcoming ? (
              <div className="flex justify-center py-2">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500" />
              </div>
            ) : upcomingAssignments.length > 0 ? (
              visibleUpcomingAssignments.map((assignment, index) => (
                <div
                  key={`${assignment.title}-${index}`}
                  className={`border-l-2 ${getBorderColor(
                    assignment.dueDate
                  )} pl-2 py-1`}
                >
                  <p className="text-xs font-medium">{assignment.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Due: {formatDate(assignment.dueDate)}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400 py-1">
                No upcoming assignments
              </p>
            )}
          </div>
          {upcomingAssignments.length > 3 && (
            <Button
              variant="link"
              className="mt-1 px-0 text-xs"
              size="sm"
              onClick={handleViewAll}
            >
              {showAllUpcoming ? "Show less" : "View all"}
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
        >
          <h2 className="text-base font-semibold mb-3">Class code</h2>
          <div className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-400 rounded-md">
            <p className="font-mono text-sm">{classroomCode}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(classroomCode);
                toast({
                  title: "Copied!",
                  description: "Class code copied",
                });
              }}
            >
              Copy
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StreamTab;
