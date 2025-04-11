import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  getClassrooms,
  getClassroomById,
  getAnnouncementsByClassroomId,
  createClassroom as createClassroomApi,
  createAnnouncement as createAnnouncementApi,
  joinClassroom as joinClassroomApi,
  archiveClassroom as archiveClassroomApi,
  getEnrolledClassroomByUserId as getEnrolledClassroomByUserIdApi,
  getAssignmentsByClassroomId as getAssignmentsByClassroomIdApi,
  getClassroomsByTeacherId as getClassroomsByTeacherIdApi,
  getStudentsByClassroomId as getStudentsByClassroomIdApi,
  fetchUpcomingDeadlineAssignments as apifetchUpcomingDeadlineAssignments,
  fetchUpcomingAssignmentsByUserId as apifetchUpcomingAssignmentsByUserId,
} from "@/services/api";
import { useToast } from "@/components/ui/use-toast";

interface Classroom {
  id: string;
  name: string;
  code: string;
  subject?: string;
  createdAt: string;
  updatedAt: string;
  teacherId: string;
  teacherName: string;
  status?: "active" | "archived";
  students?: string[];
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  datePosted: string;
  classroomId: string;
  userId: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  classroomId: string;
  classroomName: string;
  userId: string;
}

interface Grade {
  id: string;
  score: number;
  feedback?: string;
  assignmentId: string;
  userId: string;
}

interface User {
  id: string;
  role: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
}

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface DataContextType {
  classrooms: Classroom[];
  loading: boolean;
  error: Error | null;
  refreshClassrooms: () => Promise<void>;
  getClassroom: (id: string) => Promise<Classroom | undefined>;
  getAnnouncements: (classroomId: string) => Promise<Announcement[]>;
  getAssignmentsByClassroomId: (classroomId: string) => Promise<Assignment[]>;
  getUpcomingDeadlineAssignments: (
    classroomId: string
  ) => Promise<Assignment[]>;
  getUpcomingAssignmentByUserId: (userId: string) => Promise<Assignment[]>;
  getStudentsByClassroomId: (
    classroomId: string
  ) => Promise<{ teacher: Teacher; students: Student[] }>;
  getClassroomsByTeacherId: (teacherId: string) => Promise<Classroom[]>;
  getEnrolledClassroomByUserId: (userId: string) => Promise<Classroom[]>;
  createClassroom: (classroomData: Omit<Classroom, "id">) => Promise<void>;
  createAnnouncement: (
    classroomId: string,
    announcementData: Omit<Announcement, "id" | "datePosted">
  ) => Promise<void>;
  joinClassroom: (code: string, userId: string) => Promise<void>;
  archiveClassroom: (
    classroomId: string,
    userId: string,
    userRole: string
  ) => Promise<Classroom>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({
  children,
  user = { id: "", role: "" },
}: {
  children: ReactNode;
  user?: User;
}) => {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const data = await getClassrooms();
      setClassrooms(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(new Error(errorMessage));
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const refreshClassrooms = async () => {
    await fetchClassrooms();
  };

  const getClassroom = async (id: string) => {
    try {
      return await getClassroomById(id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return undefined;
    }
  };

  const getAnnouncements = async (classroomId: string) => {
    try {
      return await getAnnouncementsByClassroomId(classroomId);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    }
  };

  const getAssignmentsByClassroomId = async (classroomId: string) => {
    try {
      return await getAssignmentsByClassroomIdApi(classroomId);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    }
  };

  const getUpcomingDeadlineAssignments = async (classroomId: string) => {
    try {
      const data = await apifetchUpcomingDeadlineAssignments(classroomId);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    }
  };

  const getUpcomingAssignmentByUserId = async (userId: string) => {
    try {
      const data = await apifetchUpcomingAssignmentsByUserId(userId);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    }
  };

  const getClassroomsByTeacherId = async (teacherId: string) => {
    try {
      const data = await getClassroomsByTeacherIdApi(teacherId);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    }
  };

  const createClassroom = async (classroomData: Omit<Classroom, "id">) => {
    try {
      const newClassroom = await createClassroomApi(classroomData);
      await refreshClassrooms();
      toast({
        title: "Success",
        description: "Classroom created successfully!",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const createAnnouncement = async (
    classroomId: string,
    announcementData: Omit<Announcement, "id" | "datePosted">
  ) => {
    try {
      const newAnnouncement = await createAnnouncementApi(
        classroomId,
        announcementData
      );
      toast({
        title: "Success",
        description: "Announcement created successfully!",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const joinClassroom = async (code: string, userId: string) => {
    try {
      const classroom = await joinClassroomApi(code, userId);
      await refreshClassrooms();
      toast({
        title: "Success",
        description: "You have successfully joined the classroom.",
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const archiveClassroom = async (
    classroomId: string,
    userId: string,
    userRole: string
  ) => {
    try {
      const updatedClassroom = await archiveClassroomApi(
        classroomId,
        userId,
        userRole
      );

      setClassrooms((prev) =>
        prev.map((c) =>
          c.id === classroomId ? { ...c, status: updatedClassroom.status } : c
        )
      );

      toast({
        title: "Success",
        description:
          updatedClassroom.status === "archived"
            ? "Classroom has been archived."
            : "Classroom has been unarchived.",
      });

      return updatedClassroom;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const getEnrolledClassroomByUserId = async (userId: string) => {
    try {
      const data = await getEnrolledClassroomByUserIdApi(userId);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    }
  };

  const getStudentsByClassroomId = async (classroomId: string) => {
    try {
      const data = await getStudentsByClassroomIdApi(classroomId);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message;
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return [];
    }
  };

  const value = {
    classrooms,
    loading,
    error,
    refreshClassrooms,
    getClassroom,
    getAnnouncements,
    getAssignmentsByClassroomId,
    getUpcomingDeadlineAssignments,
    getUpcomingAssignmentByUserId,
    getStudentsByClassroomId,
    getClassroomsByTeacherId,
    getEnrolledClassroomByUserId,
    createClassroom,
    createAnnouncement,
    joinClassroom,
    archiveClassroom,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
