import { motion } from "framer-motion";
import { Users, ArrowRight, Archive, ArchiveRestore } from "lucide-react";
import { Link } from "react-router-dom";
import { colors } from "@/utils/colors";

interface Classroom {
  id: string;
  name: string;
  code: string;
  subject?: string;
  description?: string;
  students?: number;
  status?: "active" | "archived";
  color?: string;
  teacherId?: string;
  teacherName?: string;
}

interface ClassroomCardProps {
  classroom: Classroom;
  index: number;
  onArchive?: (classroomId: string) => void;
  userRole?: "teacher" | "student";
}

const ClassroomCard = ({
  classroom,
  index,
  onArchive,
  userRole,
}: ClassroomCardProps) => {
  const dynamicColor = colors[index % colors.length];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
      },
    },
  };

  const handleArchive = () => {
    if (onArchive) {
      onArchive(classroom.id);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
    >
      <div className={`absolute inset-0 opacity-20 ${dynamicColor}`}></div>
      <div className="relative p-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {classroom.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {classroom.subject}
            </p>
            {userRole === "student" && classroom.teacherName && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Teacher: {classroom.teacherName}
              </p>
            )}
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
            {classroom.code}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4">
          {classroom.description}
        </p>

        <div className="flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Users className="h-4 w-4 mr-1" />
            <span>{classroom.students || 0} students</span>
          </div>

          <div className="flex items-center gap-2">
            {(userRole === "teacher" || userRole === "student") &&
              onArchive && (
                <button
                  onClick={handleArchive}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label={
                    classroom.status === "archived"
                      ? "Unarchive Classroom"
                      : "Archive Classroom"
                  }
                  title={
                    classroom.status === "archived"
                      ? "Unarchive Classroom"
                      : "Archive Classroom"
                  }
                >
                  {classroom.status === "archived" ? (
                    <ArchiveRestore className="h-4 w-4" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                </button>
              )}

            <Link
              to={`/classroom/${classroom.id}`}
              className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              aria-label={`Enter ${classroom.name}`}
            >
              <span>Enter</span>
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
    </motion.div>
  );
};

export default ClassroomCard;
