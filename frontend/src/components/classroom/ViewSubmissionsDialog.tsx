import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download, Check } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
}

interface FileInfo {
  name: string;
  type: string;
  size: number;
}

interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  submittedAt: string;
  gradedAt: string | null;
  grade: number | null;
  feedback: string | null;
  fileInfo: FileInfo;
  user: User;
  status: "SUBMITTED" | "GRADED" | "NOT_SUBMITTED" | "LATE";
}

interface SubmissionResponse {
  total: number;
  submissions: Submission[];
}

interface ViewSubmissionsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string | null;
  assignmentTitle: string;
  students: User[];
  getAssignmentSubmissions: (
    assignmentId: string
  ) => Promise<SubmissionResponse>;
  downloadSubmissionFile: (submissionId: string) => Promise<void>;
  gradeSubmission?: (
    submissionId: string,
    grade: number,
    feedback: string
  ) => Promise<void>;
  studentCount: number;
}

const ViewSubmissionsDialog = ({
  isOpen,
  onOpenChange,
  assignmentId,
  assignmentTitle,
  students = [],
  getAssignmentSubmissions,
  downloadSubmissionFile,
  gradeSubmission,
  studentCount,
}: ViewSubmissionsDialogProps) => {
  const { toast } = useToast();
  const [submissionData, setSubmissionData] = useState<SubmissionResponse>({
    total: 0,
    submissions: [],
  });
  const [gradingData, setGradingData] = useState<
    Record<string, { grade: string; feedback: string }>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [recentlyGraded, setRecentlyGraded] = useState<string | null>(null);

  const missingSubmissions = useMemo(() => {
    return students.filter(
      (student) =>
        !submissionData.submissions.some((sub) => sub.user.id === student.id)
    );
  }, [students, submissionData.submissions]);

  useEffect(() => {
    const loadSubmissions = async () => {
      if (!assignmentId || !isOpen) return;

      try {
        setIsLoading(true);
        const { total, submissions } = await getAssignmentSubmissions(
          assignmentId
        );

        if (!submissions || !Array.isArray(submissions)) {
          throw new Error("Invalid submissions data received");
        }

        setSubmissionData({ total, submissions });

        // Initialize grading data for both SUBMITTED and LATE statuses
        setGradingData(
          submissions.reduce((acc, sub) => {
            if (sub.status === "SUBMITTED" || sub.status === "LATE") {
              acc[sub.id] = { grade: "", feedback: "" };
            }
            return acc;
          }, {} as Record<string, { grade: string; feedback: string }>)
        );
      } catch (error) {
        console.error("Error loading submissions:", error);
        toast({
          title: "Error",
          description: "Failed to load submissions. Please try again.",
          variant: "destructive",
        });
        setSubmissionData({ total: 0, submissions: [] });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadSubmissions();
    } else {
      // Reset when dialog closes
      setSubmissionData({ total: 0, submissions: [] });
      setGradingData({});
      setRecentlyGraded(null);
    }
  }, [isOpen, assignmentId, getAssignmentSubmissions, toast]);

  const handleDownload = async (submissionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await downloadSubmissionFile(submissionId);
      toast({
        title: "Success",
        description: "File download started",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download file",
        variant: "destructive",
      });
    }
  };

  const handleGradeSubmit = async (submissionId: string) => {
    if (!gradeSubmission) return;

    try {
      const gradeData = gradingData[submissionId];
      if (!gradeData?.grade) {
        throw new Error("Please enter a grade");
      }

      const numericGrade = parseFloat(gradeData.grade);
      if (isNaN(numericGrade)) {
        throw new Error("Grade must be a number");
      }
      if (numericGrade < 0 || numericGrade > 100) {
        throw new Error("Grade must be between 0 and 100");
      }

      setIsGrading(true);
      await gradeSubmission(
        submissionId,
        numericGrade,
        gradeData.feedback || ""
      );

      setRecentlyGraded(submissionId);
      setTimeout(() => setRecentlyGraded(null), 2000);

      toast({
        title: "Success",
        description: "Grade submitted successfully",
      });

      // Refresh submissions after grading
      if (assignmentId) {
        const { submissions } = await getAssignmentSubmissions(assignmentId);
        setSubmissionData((prev) => ({ ...prev, submissions }));
        setGradingData((prev) => {
          const newData = { ...prev };
          delete newData[submissionId];
          return newData;
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit grade",
        variant: "destructive",
      });
    } finally {
      setIsGrading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  };

  const getStatusBadge = (submission: Submission) => {
    switch (submission.status) {
      case "GRADED":
        return (
          <Badge variant="secondary" className="text-green-600">
            Graded{submission.status === "LATE" ? "*" : ""}
          </Badge>
        );
      case "SUBMITTED":
        return (
          <Button
            size="sm"
            onClick={() => handleGradeSubmit(submission.id)}
            disabled={
              isGrading || !gradingData[submission.id]?.grade || isLoading
            }
          >
            {isGrading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                Grading...
              </div>
            ) : (
              "Click to Grade"
            )}
          </Button>
        );
      case "LATE":
        return (
          <Button
            size="sm"
            onClick={() => handleGradeSubmit(submission.id)}
            disabled={
              isGrading || !gradingData[submission.id]?.grade || isLoading
            }
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            {isGrading ? (
              <div className="flex items-center">
                <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-red-600 rounded-full" />
                Grading...
              </div>
            ) : (
              "Grade Late Submission*"
            )}
          </Button>
        );
      default:
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Submissions for {assignmentTitle}
            <Badge variant="outline">
              {submissionData.total}/{studentCount} submitted
            </Badge>
            {submissionData.submissions.some((s) => s.status === "LATE") && (
              <span className="text-xs text-red-500">* Late submission</span>
            )}
          </DialogTitle>
        </DialogHeader>

        {submissionData.submissions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">
              {isLoading
                ? "Loading..."
                : "No submissions found for this assignment"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Student</TableHead>
                    <TableHead className="min-w-[150px]">Submitted</TableHead>
                    <TableHead className="w-[120px]">Grade</TableHead>
                    <TableHead className="min-w-[200px]">Feedback</TableHead>
                    <TableHead className="min-w-[200px]">File</TableHead>
                    <TableHead className="w-[150px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissionData.submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="font-medium">
                          {submission.user?.name || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {submission.user?.email || ""}
                        </div>
                      </TableCell>
                      <TableCell>
                        {formatDate(submission.submittedAt)}
                        {submission.status === "LATE" && (
                          <span className="text-xs text-red-500 ml-1">
                            (Late)
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.grade !== null ? (
                          `${submission.grade}%`
                        ) : (
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Grade"
                            value={gradingData[submission.id]?.grade || ""}
                            onChange={(e) =>
                              setGradingData((prev) => ({
                                ...prev,
                                [submission.id]: {
                                  ...prev[submission.id],
                                  grade: e.target.value,
                                },
                              }))
                            }
                            className="w-20"
                            disabled={
                              isGrading ||
                              (submission.status !== "SUBMITTED" &&
                                submission.status !== "LATE")
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {submission.grade !== null ? (
                          <div className="text-sm">
                            {submission.feedback || "No feedback"}
                          </div>
                        ) : (
                          <Input
                            placeholder="Feedback"
                            value={gradingData[submission.id]?.feedback || ""}
                            onChange={(e) =>
                              setGradingData((prev) => ({
                                ...prev,
                                [submission.id]: {
                                  ...prev[submission.id],
                                  feedback: e.target.value,
                                },
                              }))
                            }
                            disabled={
                              isGrading ||
                              (submission.status !== "SUBMITTED" &&
                                submission.status !== "LATE")
                            }
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {submission.fileInfo ? (
                            <>
                              <FileText className="h-4 w-4 text-blue-500" />
                              <a
                                href="#"
                                onClick={(e) =>
                                  handleDownload(submission.id, e)
                                }
                                className="truncate max-w-[180px] text-blue-600 hover:underline"
                              >
                                {submission.fileInfo.name}
                              </a>
                              <span className="text-xs text-gray-500">
                                ({(submission.fileInfo.size / 1024).toFixed(1)}{" "}
                                KB)
                              </span>
                            </>
                          ) : (
                            "No file"
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(submission)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {missingSubmissions.length > 0 && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium mb-2">Missing Submissions:</h4>
                <div className="flex flex-wrap gap-2">
                  {missingSubmissions.map((student) => (
                    <Badge key={student.id} variant="destructive">
                      {student.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ViewSubmissionsDialog;
