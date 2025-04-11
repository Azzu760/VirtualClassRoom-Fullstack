import { motion } from "framer-motion";
import { FileText, PlusCircle, Upload, Download, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import ViewSubmissionsDialog from "./ViewSubmissionsDialog";
import { useAssignments } from "@/context/AssignmentContext";
import { useData } from "@/context/DataContext";
import type { Classroom } from "@/types";

interface ClassworkTabProps {
  isTeacher: boolean;
  classroomId: string;
  userId: string;
  students?: {
    id: string;
    name: string;
    email: string;
  }[];
  classroom: Classroom;
}

const ClassworkTab = ({
  isTeacher,
  classroomId,
  userId,
  students = [],
  classroom,
}: ClassworkTabProps) => {
  const { toast } = useToast();
  const {
    assignments = [],
    studentAssignments = [],
    submissions = [],
    loading,
    createAssignment,
    submitAssignment,
    downloadAssignmentFile,
    downloadSubmissionFile,
    getAssignmentSubmissions,
    getStudentAssignments,
    getClassroomAssignments,
    gradeSubmission,
  } = useAssignments();

  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    dueDate: "",
    attachment: null as File | null,
  });
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [selectedAssignmentTitle, setSelectedAssignmentTitle] = useState("");
  const [isSubmissionsDialogOpen, setIsSubmissionsDialogOpen] = useState(false);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(true);
  const { getStudentsByClassroomId } = useData();
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [submissionTotals, setSubmissionTotals] = useState<
    Record<string, number>
  >({});

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

  // Load assignments based on user role
  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setIsLoadingAssignments(true);
        if (isTeacher) {
          await getClassroomAssignments(classroomId);
        } else {
          await getStudentAssignments(classroomId, userId);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load assignments",
          variant: "destructive",
        });
      } finally {
        setIsLoadingAssignments(false);
      }
    };

    loadAssignments();
  }, [
    classroomId,
    userId,
    isTeacher,
    getClassroomAssignments,
    getStudentAssignments,
    toast,
  ]);

  // Fetch submission totals when assignments load (for teachers)
  useEffect(() => {
    if (!isTeacher) return;

    const fetchSubmissionTotals = async () => {
      if (assignments.length === 0) return;

      try {
        const totals: Record<string, number> = {};

        await Promise.all(
          assignments.map(async (assignment) => {
            const { total } = await getAssignmentSubmissions(assignment.id);
            totals[assignment.id] = total;
          })
        );

        setSubmissionTotals(totals);
      } catch (error) {
        console.error("Error fetching submission totals:", error);
        const localTotals = assignments.reduce((acc, assignment) => {
          acc[assignment.id] = submissions.filter(
            (s) => s.assignmentId === assignment.id
          ).length;
          return acc;
        }, {} as Record<string, number>);
        setSubmissionTotals(localTotals);
      }
    };

    fetchSubmissionTotals();
  }, [isTeacher, assignments, getAssignmentSubmissions, submissions]);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getSubmissionStatus = (assignmentId: string) => {
    return {
      submitted: submissionTotals[assignmentId] || 0,
      total: studentCount || 0,
      missing: students
        .filter(
          (s) =>
            !submissions.some(
              (sub) => sub.assignmentId === assignmentId && sub.userId === s.id
            )
        )
        .map((s) => s.name),
    };
  };

  const handleCreateAssignment = async () => {
    try {
      if (!newAssignment.title.trim()) throw new Error("Title is required");
      if (!newAssignment.dueDate) throw new Error("Due date is required");

      await createAssignment(
        classroomId,
        {
          title: newAssignment.title,
          description: newAssignment.description,
          dueDate: newAssignment.dueDate,
          status: "published",
        },
        newAssignment.attachment
      );

      setNewAssignment({
        title: "",
        description: "",
        dueDate: "",
        attachment: null,
      });
      toast({
        title: "Success",
        description: "Assignment created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create assignment",
        variant: "destructive",
      });
    }
  };

  const handleSubmitAssignment = async (assignmentId: string) => {
    if (!submissionFile) {
      toast({ title: "No file selected", variant: "destructive" });
      return;
    }

    try {
      await submitAssignment(assignmentId, submissionFile, userId);
      toast({ title: "Submitted successfully" });
      setSubmissionFile(null);
    } catch (error) {
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleViewSubmissions = (assignmentId: string) => {
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (assignment) {
      setSelectedAssignmentTitle(assignment.title);
    }
    setSelectedAssignmentId(assignmentId);
    setIsSubmissionsDialogOpen(true);
  };

  if (isLoadingAssignments) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Use studentAssignments for students, assignments for teachers
  const displayAssignments = isTeacher ? assignments : studentAssignments;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Assignments</h2>
        {isTeacher && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title*</Label>
                  <Input
                    value={newAssignment.title}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        title: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={newAssignment.description}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Due Date*</Label>
                  <Input
                    type="date"
                    value={newAssignment.dueDate}
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        dueDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Attachment (Optional)</Label>
                  <Input
                    type="file"
                    onChange={(e) =>
                      setNewAssignment({
                        ...newAssignment,
                        attachment: e.target.files?.[0] || null,
                      })
                    }
                    accept=".pdf,.doc,.docx,.txt"
                  />
                  {newAssignment.attachment && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {newAssignment.attachment.name} (
                      {(newAssignment.attachment.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
                <Button
                  onClick={handleCreateAssignment}
                  disabled={
                    loading || !newAssignment.title || !newAssignment.dueDate
                  }
                >
                  {loading ? "Creating..." : "Create Assignment"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {displayAssignments.length > 0 ? (
          displayAssignments.map((assignment) => {
            const status = getSubmissionStatus(assignment.id);
            const isSubmitted = isTeacher ? false : assignment.isSubmitted;
            const submission = isTeacher ? null : assignment.submission;
            const grade = isTeacher
              ? null
              : assignment.grade || submission?.grade;

            return (
              <div
                key={assignment.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-start">
                  <div className="h-10 w-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full mr-4">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{assignment.title}</h3>
                      <div className="flex flex-col items-end">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Created: {formatDate(assignment.createdAt)}
                        </p>
                        <p
                          className={`text-sm ${
                            new Date(assignment.dueDate) < new Date()
                              ? "text-red-600 dark:text-red-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          Due: {formatDate(assignment.dueDate)}
                        </p>
                      </div>
                    </div>

                    {assignment.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {assignment.description}
                      </p>
                    )}

                    {isTeacher
                      ? assignment.fileName && (
                          <div className="mt-2">
                            <Button
                              variant="link"
                              className="text-blue-600 dark:text-blue-400 p-0 h-auto"
                              onClick={() =>
                                downloadAssignmentFile(assignment.id)
                              }
                            >
                              <Download className="h-4 w-4 mr-1" />
                              {assignment.fileName}
                            </Button>
                          </div>
                        )
                      : assignment.fileInfo?.name && (
                          <div className="mt-2">
                            <Button
                              variant="link"
                              className="text-blue-600 dark:text-blue-400 p-0 h-auto"
                              onClick={() =>
                                downloadAssignmentFile(assignment.id)
                              }
                            >
                              <Download className="h-4 w-4 mr-1" />
                              {assignment.fileInfo.name}
                            </Button>
                          </div>
                        )}

                    {!isTeacher ? (
                      <div className="mt-3 space-y-2">
                        {isSubmitted ? (
                          <>
                            <div className="flex items-center space-x-4">
                              <Badge variant="secondary">
                                <Check className="h-4 w-4 mr-1" />
                                Submitted
                              </Badge>
                              {submission?.fileInfo?.name && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    if (submission?.id) {
                                      downloadSubmissionFile(submission.id);
                                    }
                                  }}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  View Submission
                                </Button>
                              )}
                            </div>
                            {grade !== null && grade !== undefined && (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium">Grade:</span>
                                <Badge variant="default">{grade}%</Badge>
                                {submission?.feedback && (
                                  <span className="text-sm text-gray-600 dark:text-gray-300">
                                    Feedback: {submission.feedback}
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Upload className="h-4 w-4 mr-2" />
                                Submit Assignment
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Submit Assignment</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Upload your work*</Label>
                                  <Input
                                    type="file"
                                    onChange={(e) =>
                                      setSubmissionFile(
                                        e.target.files?.[0] || null
                                      )
                                    }
                                    accept=".pdf,.doc,.docx,.txt"
                                    required
                                  />
                                </div>
                                <Button
                                  onClick={() =>
                                    handleSubmitAssignment(assignment.id)
                                  }
                                  disabled={!submissionFile || loading}
                                >
                                  {loading ? "Submitting..." : "Submit"}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSubmissions(assignment.id)}
                          >
                            View Submissions ({status.submitted}/{status.total})
                          </Button>
                          <Badge
                            variant={
                              status.submitted === status.total
                                ? "default"
                                : "destructive"
                            }
                          >
                            {status.submitted === status.total
                              ? "All submitted"
                              : `${status.total - status.submitted} missing`}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No assignments yet
            </p>
            {isTeacher && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Create your first assignment
              </p>
            )}
          </div>
        )}
      </div>

      {isTeacher && (
        <ViewSubmissionsDialog
          isOpen={isSubmissionsDialogOpen}
          onOpenChange={setIsSubmissionsDialogOpen}
          assignmentId={selectedAssignmentId}
          assignmentTitle={selectedAssignmentTitle}
          students={students}
          getAssignmentSubmissions={getAssignmentSubmissions}
          downloadSubmissionFile={downloadSubmissionFile}
          studentCount={studentCount}
          gradeSubmission={gradeSubmission}
        />
      )}
    </motion.div>
  );
};

export default ClassworkTab;
