import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AnimatedTransition from "@/components/AnimatedTransition";
import ClassroomHeader from "@/components/classroom/ClassroomHeader";
import ClassroomBanner from "@/components/classroom/ClassroomBanner";
import StreamTab from "@/components/classroom/StreamTab";
import ClassworkTab from "@/components/classroom/ClassworkTab";
import PeopleTab from "@/components/classroom/PeopleTab";
import MaterialsTab from "@/components/classroom/MaterialsTab";
import ClassroomNotFound from "@/components/classroom/ClassroomNotFound";
import { useData } from "@/context/DataContext";
import type { Classroom, Announcement } from "@/types/index";
import DownloadGradeReport from "@/components/DownloadGradeReport";

const Classroom = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState("stream");
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getClassroom, getAnnouncements } = useData();

  // Get user data from localStorage instead of useAuth
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id;
  const userRole = user?.role;

  const isTeacher = userRole === "teacher";

  useEffect(() => {
    const fetchClassroomData = async () => {
      if (!id) {
        setError("Classroom ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const classroomData = await getClassroom(id);
        if (!classroomData) {
          setError("Classroom not found");
          return;
        }
        setClassroom(classroomData);

        const announcementsData = await getAnnouncements(id);
        setAnnouncements(announcementsData);
      } catch (err: any) {
        setError(err.message || "Failed to fetch classroom data");
      } finally {
        setLoading(false);
      }
    };

    fetchClassroomData();
  }, [id, getClassroom, getAnnouncements]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return <ClassroomNotFound errorMessage={error} />;
  }

  if (!classroom) {
    return <ClassroomNotFound errorMessage="Classroom not found" />;
  }

  return (
    <AnimatedTransition className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ClassroomHeader classroom={classroom} />
      <main className="pt-16 pb-16">
        <div className="max-w-7xl mx-auto">
          <ClassroomBanner classroom={classroom} />
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-8"
            >
              <div className="flex justify-between items-center">
                <TabsList className="grid grid-cols-4 md:w-auto md:inline-flex">
                  <TabsTrigger value="stream">Stream</TabsTrigger>
                  <TabsTrigger value="classwork">Classwork</TabsTrigger>
                  <TabsTrigger value="people">People</TabsTrigger>
                  <TabsTrigger value="materials">Materials</TabsTrigger>
                </TabsList>

                <div className="ml-4">
                  <DownloadGradeReport classroomId={id} isTeacher={isTeacher} />
                </div>
              </div>

              {/* Tabs Content */}
              <TabsContent value="stream" className="mt-6">
                <StreamTab
                  classroomId={id}
                  classroomCode={classroom.code}
                  announcements={announcements}
                  isTeacher={isTeacher}
                  userId={userId}
                  teacherName={classroom.teacherName}
                />
              </TabsContent>
              <TabsContent value="classwork" className="mt-6">
                <ClassworkTab
                  isTeacher={isTeacher}
                  classroomId={id}
                  userId={userId}
                  classroom={classroom}
                />
              </TabsContent>
              <TabsContent value="people" className="mt-6">
                <PeopleTab
                  isTeacher={isTeacher}
                  classroomId={id}
                  userId={userId}
                />
              </TabsContent>
              <TabsContent value="materials" className="mt-6">
                <MaterialsTab
                  isTeacher={isTeacher}
                  classroomId={id}
                  userId={userId}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </AnimatedTransition>
  );
};

export default Classroom;
