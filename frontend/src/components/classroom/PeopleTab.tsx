import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { useData } from "@/context/DataContext";
import { useAuth } from "@/context/AuthContext";
import { Classroom } from "@/types";
import { useEffect, useState } from "react";

interface PeopleTabProps {
  classroom: Classroom;
  classroomId: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

const PeopleTab = ({ classroomId }: PeopleTabProps) => {
  const { toast } = useToast();
  const { getStudentsByClassroomId } = useData();
  const { user } = useAuth();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const isTeacher = user?.role === "teacher";

  // Fetch teacher and students when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch teacher and students for the classroom
        const { teacher, students } = await getStudentsByClassroomId(
          classroomId
        );
        setTeacher(teacher);
        setStudents(students);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classroomId, getStudentsByClassroomId, toast]);

  const handleViewAllStudents = () => {
    toast({
      title: "View All Students",
      description: "View all students feature will be available soon.",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
    >
      {/* Teacher Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Teacher</h2>
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarFallback>
              {teacher?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{teacher?.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {teacher?.email || "teacher@example.com"}
            </p>
          </div>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Students Section */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Students</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {students.length} students
          </p>
        </div>

        <div className="space-y-4">
          {students.map((student) => (
            <div key={student.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>
                    {student.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {student.email}
                  </p>
                </div>
              </div>
              {isTeacher && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast({
                      title: "Remove Student",
                      description: `Remove ${student.name} feature will be available soon.`,
                    });
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}
        </div>

        {students.length > 5 && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={handleViewAllStudents}
          >
            View all {students.length} students
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default PeopleTab;
