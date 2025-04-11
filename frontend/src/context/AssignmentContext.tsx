import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from "react";
import type {
  Assignment,
  Submission,
  AssignmentInput,
  Grade,
  SubmissionDetail,
} from "@/types";
import {
  createAssignment as apiCreateAssignment,
  getClassroomAssignments as apiGetClassroomAssignments,
  submitAssignment as apiSubmitAssignment,
  getAssignmentSubmissions as apiGetAssignmentSubmissions,
  downloadAssignmentFile as apiDownloadAssignmentFile,
  downloadSubmissionFile as apiDownloadSubmissionFile,
  gradeSubmission as apiGradeSubmission,
  fetchSubmissionDetails as apiFetchSubmissionDetails,
  fetchStudentAssignments as apiFetchStudentAssignments,
} from "../services/assignmentApi";

interface AssignmentContextType {
  assignments: Assignment[];
  studentAssignments: Assignment[];
  submissions: Submission[];
  createAssignment: (
    classroomId: string,
    assignmentData: AssignmentInput,
    file?: File | null
  ) => Promise<Assignment>;
  submitAssignment: (
    assignmentId: string,
    file: File,
    userId: string
  ) => Promise<Submission>;
  getClassroomAssignments: (classroomId: string) => Promise<void>;
  getStudentAssignments: (classroomId: string, userId: string) => Promise<void>;
  getAssignmentSubmissions: (assignmentId: string) => Promise<void>;
  downloadAssignmentFile: (assignmentId: string) => Promise<void>;
  downloadSubmissionFile: (submissionId: string) => Promise<void>;
  fetchSubmissionDetails: (
    assignmentId: string,
    userId: string
  ) => Promise<SubmissionDetail>;
  getSubmissionDownloadUrl: (submissionId: string) => Promise<string>;
  gradeSubmission: (
    submissionId: string,
    grade: number,
    feedback?: string
  ) => Promise<Grade>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

interface SubmissionResponse {
  total: number;
  submissions: Submission[];
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(
  undefined
);

export const AssignmentProvider = ({ children }: { children: ReactNode }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [studentAssignments, setStudentAssignments] = useState<Assignment[]>(
    []
  );
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const createAssignment = async (
    classroomId: string,
    assignmentData: AssignmentInput,
    file?: File | null
  ): Promise<Assignment> => {
    try {
      setLoading(true);
      clearError();

      const newAssignment = await apiCreateAssignment(
        classroomId,
        assignmentData,
        file
      );

      setAssignments((prev) => [newAssignment, ...prev]);
      return newAssignment;
    } catch (error: any) {
      let errorMessage = error.message;

      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        if (
          error.response.data.code === "VALIDATION_ERROR" &&
          error.response.data.details
        ) {
          errorMessage = Object.values(error.response.data.details).join(", ");
        }
      }

      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getClassroomAssignments = useCallback(async (classroomId: string) => {
    try {
      setLoading(true);
      clearError();
      const data = await apiGetClassroomAssignments(classroomId);
      setAssignments(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch assignments"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const getStudentAssignments = useCallback(
    async (classroomId: string, userId: string) => {
      try {
        setLoading(true);
        clearError();
        const data = await apiFetchStudentAssignments(classroomId, userId);
        setStudentAssignments(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch student assignments"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const submitAssignment = async (
    assignmentId: string,
    file: File,
    userId: string
  ): Promise<Submission> => {
    try {
      setLoading(true);
      clearError();

      const submission = await apiSubmitAssignment(assignmentId, file, userId);
      setSubmissions((prev) => [...prev, submission]);

      // Update the student assignments state if needed
      setStudentAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId ? { ...a, isSubmitted: true, submission } : a
        )
      );

      return submission;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit assignment";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentSubmissions = async (
    assignmentId: string
  ): Promise<SubmissionResponse> => {
    try {
      const response = await apiGetAssignmentSubmissions(assignmentId);

      // Transform the API response
      const submissions = response.submissions.map((sub: any) => ({
        id: sub.id,
        assignmentId: sub.assignmentId || assignmentId,
        userId: sub.user.id,
        status: sub.status || "NOT_SUBMITTED",
        submittedAt: sub.submittedAt,
        gradedAt: sub.gradedAt,
        grade: sub.grade,
        feedback: sub.feedback,
        fileInfo: {
          name: sub.fileInfo.name,
          type: sub.fileInfo.type,
          size: sub.fileInfo.size,
        },
        user: {
          id: sub.user.id,
          name: sub.user.name,
          email: sub.user.email,
        },
      }));

      return {
        total: response.total || submissions.length,
        submissions,
      };
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      throw error;
    }
  };

  const downloadAssignmentFile = async (assignmentId: string) => {
    try {
      setLoading(true);
      clearError();
      await apiDownloadAssignmentFile(assignmentId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to download file";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const downloadSubmissionFile = async (submissionId: string) => {
    try {
      setLoading(true);
      clearError();
      await apiDownloadSubmissionFile(submissionId);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to download file";

      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissionDetails = async (
    assignmentId: string,
    userId: string
  ): Promise<SubmissionDetail> => {
    try {
      setLoading(true);
      clearError();
      const submission = await apiFetchSubmissionDetails(assignmentId, userId);
      return submission;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to fetch submission details";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const gradeSubmission = async (
    submissionId: string,
    score: number,
    feedback?: string
  ): Promise<Grade> => {
    try {
      setLoading(true);
      clearError();

      const gradedSubmission = await apiGradeSubmission(
        submissionId,
        score,
        feedback
      );

      // Update the submission in state with the new grade
      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === submissionId ? { ...sub, grade: score, feedback } : sub
        )
      );

      // Also update the student assignments state if needed
      setStudentAssignments((prev) =>
        prev.map((a) => {
          if (a.submission?.id === submissionId) {
            return {
              ...a,
              submission: {
                ...a.submission,
                grade: score,
                feedback,
                status: "GRADED",
              },
              isGraded: true,
            };
          }
          return a;
        })
      );

      return gradedSubmission;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to grade submission";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AssignmentContext.Provider
      value={{
        assignments,
        studentAssignments,
        submissions,
        createAssignment,
        submitAssignment,
        getClassroomAssignments,
        getStudentAssignments,
        getAssignmentSubmissions,
        downloadAssignmentFile,
        downloadSubmissionFile,
        fetchSubmissionDetails,
        gradeSubmission,
        loading,
        error,
        clearError,
      }}
    >
      {children}
    </AssignmentContext.Provider>
  );
};

export const useAssignments = (): AssignmentContextType => {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error("useAssignments must be used within an AssignmentProvider");
  }
  return context;
};
