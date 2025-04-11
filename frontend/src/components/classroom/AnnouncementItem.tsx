import { format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface Attachment {
  name: string;
  type: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  datePosted: string;
  attachments?: Attachment[];
}

interface AnnouncementItemProps {
  announcement: Announcement;
  index: number;
  classroomId: string;
  teacherName: string;
}

const AnnouncementItem = ({
  announcement,
  index,
  classroomId,
  teacherName,
}: AnnouncementItemProps) => {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Download",
      description: "Download feature coming soon",
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/classroom/${classroomId}/announcement/${announcement.id}`
    );
    toast({
      title: "Copied!",
      description: "Announcement link copied to clipboard",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.05 * index }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700"
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-xs">
              {teacherName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium">{teacherName}</h3>
              <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded-full">
                Teacher
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {format(
                new Date(announcement.datePosted),
                "MMM d, yyyy • h:mm a"
              )}
            </p>
          </div>
        </div>

        <h2 className="text-base font-semibold mb-1.5">{announcement.title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-3">
          {announcement.content}
        </p>

        {announcement.attachments && announcement.attachments.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium mb-1.5">Attachments:</p>
            <div className="space-y-1.5">
              {announcement.attachments.map((attachment, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900"
                >
                  <div className="h-8 w-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded text-xs">
                    {attachment.type === "pdf"
                      ? "PDF"
                      : attachment.type === "zip"
                      ? "ZIP"
                      : "FILE"}
                  </div>
                  <div className="flex-1 min-w-0 truncate">
                    {attachment.name}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="h-6 px-2"
                  >
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AnnouncementItem;
