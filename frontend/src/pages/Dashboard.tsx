import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnimatedTransition from "@/components/AnimatedTransition";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LogOut,
  PlusCircle,
  Search,
  Code,
  Calendar as CalendarIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import ClassroomCard from "@/components/ClassroomCard";
import { useToast } from "@/components/ui/use-toast";
import { useData } from "@/context/DataContext";
import generateRandomCode from "@/utils/generateRandomCode";
import { useAuth } from "@/context/AuthContext";
import { Classroom, UpcomingAssignment } from "@/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useNotifications } from "@/context/NotificationContext";

// Filter functions for classrooms
const filterTeacherClassrooms = (
  classrooms: Classroom[],
  searchQuery: string,
  userId: string
) => {
  const searchTerm = searchQuery.toLowerCase();
  return classrooms.filter((classroom) => {
    const matchesSearch =
      classroom.name.toLowerCase().includes(searchTerm) ||
      classroom.subject?.toLowerCase().includes(searchTerm) ||
      classroom.code.toLowerCase().includes(searchTerm);
    return (
      matchesSearch &&
      classroom.status === "active" &&
      classroom.teacherId === userId
    );
  });
};

const filterStudentClassrooms = (
  enrolledClassrooms: Classroom[],
  searchQuery: string
) => {
  const searchTerm = searchQuery.toLowerCase();
  return enrolledClassrooms.filter((classroom) => {
    const matchesSearch =
      classroom.name.toLowerCase().includes(searchTerm) ||
      classroom.subject?.toLowerCase().includes(searchTerm) ||
      classroom.code.toLowerCase().includes(searchTerm);
    return matchesSearch && classroom.status === "active";
  });
};

const filterArchivedTeacherClassrooms = (
  classrooms: Classroom[],
  userId: string
) => {
  return classrooms.filter(
    (classroom) =>
      classroom.status === "archived" && classroom.teacherId === userId
  );
};

const filterArchivedStudentClassrooms = (enrolledClassrooms: Classroom[]) => {
  return enrolledClassrooms.filter(
    (classroom) => classroom.status === "archived"
  );
};

const Dashboard = () => {
  // State management
  const [newClassroomName, setNewClassroomName] = useState("");
  const [newClassroomSubject, setNewClassroomSubject] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [joinClassroomCode, setJoinClassroomCode] = useState("");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    new Date()
  );
  const [enrolledClassrooms, setEnrolledClassrooms] = useState<Classroom[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<
    UpcomingAssignment[]
  >([]);
  const [showAllAssignments, setShowAllAssignments] = useState(false);

  // Hooks
  const { toast } = useToast();
  const {
    classrooms,
    createClassroom,
    joinClassroom,
    archiveClassroom,
    loading,
    getEnrolledClassroomByUserId,
    getUpcomingAssignmentByUserId,
  } = useData();
  const { logout } = useAuth();
  const { notifications, unreadCount, fetchNotifications, markAsRead } =
    useNotifications();
  const navigate = useNavigate();

  // User data
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  // Filtered classrooms
  const activeClassrooms = isTeacher
    ? filterTeacherClassrooms(classrooms, searchQuery, user?.id)
    : isStudent
    ? filterStudentClassrooms(enrolledClassrooms, searchQuery)
    : [];

  const archivedClassrooms = isTeacher
    ? filterArchivedTeacherClassrooms(classrooms, user?.id)
    : isStudent
    ? filterArchivedStudentClassrooms(enrolledClassrooms)
    : [];

  // Data fetching effects
  useEffect(() => {
    if (isStudent && user?.id) {
      const fetchEnrolledClassrooms = async () => {
        const data = await getEnrolledClassroomByUserId(user.id);
        setEnrolledClassrooms(data);
      };
      fetchEnrolledClassrooms();
    }
  }, [isStudent, user?.id, getEnrolledClassroomByUserId]);

  useEffect(() => {
    const fetchUpcomingAssignments = async () => {
      if (user?.id) {
        try {
          const response = await getUpcomingAssignmentByUserId(user.id);
          if (response.success) {
            setUpcomingAssignments(response.data || []);
          }
        } catch (error) {
          console.error("Failed to fetch upcoming assignments:", error);
        }
      }
    };
    fetchUpcomingAssignments();
  }, [user?.id, getUpcomingAssignmentByUserId]);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
    }
  }, [user?.id, fetchNotifications]);

  // Handlers
  const handleCreateClassroom = async () => {
    if (!newClassroomName || !newClassroomSubject) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const classroomCode = generateRandomCode();
      await createClassroom({
        name: newClassroomName,
        subject: newClassroomSubject,
        teacherId: user.id,
        code: classroomCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "active",
      });

      toast({
        title: "Success",
        description: `${newClassroomName} has been created successfully with code: ${classroomCode}`,
      });

      setNewClassroomName("");
      setNewClassroomSubject("");
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create classroom",
        variant: "destructive",
      });
    }
  };

  const handleJoinClassroom = async () => {
    if (!joinClassroomCode) {
      toast({
        title: "Error",
        description: "Please enter a class code",
        variant: "destructive",
      });
      return;
    }

    try {
      await joinClassroom(joinClassroomCode, user.id);
      toast({
        title: "Success",
        description: "You have successfully joined the classroom.",
      });
      setJoinClassroomCode("");

      if (isStudent) {
        const data = await getEnrolledClassroomByUserId(user.id);
        setEnrolledClassrooms(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to join classroom",
        variant: "destructive",
      });
    }
  };

  const handleArchiveClassroom = async (classroomId: string) => {
    try {
      const updatedClassroom = await archiveClassroom(
        classroomId,
        user.id,
        user.role
      );

      if (isStudent) {
        setEnrolledClassrooms((prev) =>
          prev.map((c) =>
            c.id === classroomId ? { ...c, status: updatedClassroom.status } : c
          )
        );
      }

      toast({
        title: "Success",
        description: "Classroom has been archived.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to archive classroom",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      setIsLoggingOut(true);
      try {
        await logout();
        localStorage.removeItem("user");
        toast({
          title: "Logged Out",
          description: "You have been successfully logged out.",
        });
        navigate("/login");
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to log out",
          variant: "destructive",
        });
      } finally {
        setIsLoggingOut(false);
      }
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <AnimatedTransition className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center">
                  <span className="text-xl font-semibold text-primary">
                    ClassroomHive
                  </span>
                </Link>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search classrooms..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <CalendarIcon className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={calendarDate}
                    onSelect={setCalendarDate}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>

              {user?.id && user?.role !== "teacher" && (
                <NotificationDropdown
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markAsRead={markAsRead}
                  currentUserId={user.id}
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

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between mb-8">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-bold text-gray-900 dark:text-white mt-4 md:mt-0"
            >
              My Classrooms
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex space-x-4"
            >
              {isTeacher && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create Classroom
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create a new classroom</DialogTitle>
                      <DialogDescription>
                        Fill in the details below to create your new virtual
                        classroom.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Classroom Name
                        </label>
                        <Input
                          id="name"
                          value={newClassroomName}
                          onChange={(e) => setNewClassroomName(e.target.value)}
                          placeholder="e.g. Introduction to Biology"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="subject"
                          className="text-sm font-medium"
                        >
                          Subject
                        </label>
                        <Input
                          id="subject"
                          value={newClassroomSubject}
                          onChange={(e) =>
                            setNewClassroomSubject(e.target.value)
                          }
                          placeholder="e.g. Biology"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleCreateClassroom}>
                        Create Classroom
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {isStudent && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Code className="h-4 w-4 mr-2" />
                      Join with Code
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Join a classroom</DialogTitle>
                      <DialogDescription>
                        Enter the class code provided by your teacher.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="code" className="text-sm font-medium">
                          Class Code
                        </label>
                        <Input
                          id="code"
                          value={joinClassroomCode}
                          onChange={(e) => setJoinClassroomCode(e.target.value)}
                          placeholder="e.g. ABC123"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleJoinClassroom}>
                        Join Classroom
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Tabs
              defaultValue={isTeacher ? "teaching" : "enrolled"}
              className="mb-8"
            >
              <TabsList>
                {isTeacher && (
                  <TabsTrigger value="teaching">Teaching</TabsTrigger>
                )}
                {isStudent && (
                  <TabsTrigger value="enrolled">Enrolled</TabsTrigger>
                )}
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>

              {isTeacher && (
                <TabsContent value="teaching" className="mt-6">
                  {activeClassrooms.length === 0 ? (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No classrooms found
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {searchQuery
                          ? "Try a different search term."
                          : "Create your first classroom to get started."}
                      </p>
                      {!searchQuery && (
                        <Button onClick={() => setIsDialogOpen(true)}>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Create Classroom
                        </Button>
                      )}
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {activeClassrooms.map((classroom, index) => (
                        <ClassroomCard
                          key={classroom.id}
                          classroom={classroom}
                          index={index}
                          onArchive={handleArchiveClassroom}
                          userRole={user.role}
                        />
                      ))}
                    </motion.div>
                  )}
                </TabsContent>
              )}

              {isStudent && (
                <TabsContent value="enrolled" className="mt-6">
                  {activeClassrooms.length === 0 ? (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Not enrolled in any classrooms
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Join a classroom using a class code from your teacher.
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline">
                            <Code className="h-4 w-4 mr-2" />
                            Join with Code
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Join a classroom</DialogTitle>
                            <DialogDescription>
                              Enter the class code provided by your teacher.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label
                                htmlFor="code"
                                className="text-sm font-medium"
                              >
                                Class Code
                              </label>
                              <Input
                                id="code"
                                value={joinClassroomCode}
                                onChange={(e) =>
                                  setJoinClassroomCode(e.target.value)
                                }
                                placeholder="e.g. ABC123"
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleJoinClassroom}>
                              Join Classroom
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  ) : (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                      {activeClassrooms.map((classroom, index) => (
                        <ClassroomCard
                          key={classroom.id}
                          classroom={classroom}
                          index={index}
                          onArchive={handleArchiveClassroom}
                          userRole={user.role}
                        />
                      ))}
                    </motion.div>
                  )}
                </TabsContent>
              )}

              <TabsContent value="archived" className="mt-6">
                {archivedClassrooms.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No archived classrooms
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Archived classrooms will appear here.
                    </p>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {archivedClassrooms.map((classroom, index) => (
                      <ClassroomCard
                        key={classroom.id}
                        classroom={classroom}
                        index={index}
                        onArchive={handleArchiveClassroom}
                        userRole={user.role}
                      />
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white dark:bg-gray-800 shadow rounded-xl p-6 mt-8"
          >
            <h2 className="text-xl font-semibold mb-4">Upcoming Deadlines</h2>
            {upcomingAssignments.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">
                  No upcoming assignments
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAssignments
                  .sort(
                    (a, b) =>
                      new Date(a.dueDate).getTime() -
                      new Date(b.dueDate).getTime()
                  )
                  .slice(0, showAllAssignments ? upcomingAssignments.length : 3)
                  .map((assignment) => {
                    const dueDate = new Date(assignment.dueDate);
                    const now = new Date();
                    const timeDiff = dueDate.getTime() - now.getTime();
                    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                    let statusText = "";
                    let statusColor = "";

                    if (daysDiff <= 0) {
                      statusText = "Due Today";
                      statusColor = "text-red-600 dark:text-red-400";
                    } else if (daysDiff === 1) {
                      statusText = "Due Tomorrow";
                      statusColor = "text-red-600 dark:text-red-400";
                    } else if (daysDiff <= 3) {
                      statusText = `Due in ${daysDiff} days`;
                      statusColor = "text-amber-600 dark:text-amber-400";
                    } else {
                      statusText = `Due in ${daysDiff} days`;
                      statusColor = "text-green-600 dark:text-green-400";
                    }

                    return (
                      <div
                        key={`${assignment.classroomName}-${assignment.assignmentTitle}`}
                        className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900"
                      >
                        <div>
                          <h3 className="font-medium">
                            {assignment.assignmentTitle}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {assignment.classroomName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${statusColor}`}>
                            {statusText}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {dueDate.toLocaleDateString()} at{" "}
                            {dueDate.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
            {upcomingAssignments.length > 3 && (
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setShowAllAssignments(!showAllAssignments)}
                >
                  {showAllAssignments ? "Show Less" : "View All Assignments"}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </AnimatedTransition>
  );
};

export default Dashboard;
