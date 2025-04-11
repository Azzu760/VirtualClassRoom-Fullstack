export interface Classroom {
  id: string;
  name: string;
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  teacherId: string;
  teacher: {
    id: string;
    name: string;
    email: string;
  };
  subject?: string;
  students?: number;
  status: "active" | "archived";
  color?: string;
  coverImage?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  datePosted: string;
  classroomId: string;
  userId: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "draft" | "published" | "archived";
  classroomId: string;
  userId: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt?: string;
  classroom?: {
    name: string;
    teacher: {
      name: string;
    };
  };
  submissions?: Submission[];
}

export interface AssignmentWithSubmissions {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
  students: Array<{
    id: string;
    name: string;
    email: string;
    submission: {
      status: string;
      submittedAt: string | null;
      grade: number | null;
      feedback: string | null;
    };
  }>;
}

// types.ts
export interface Submission {
  id: string;
  assignmentId: string;
  userId: string;
  submittedAt: string;
  gradedAt: string | null;
  grade: number | null;
  feedback: string | null;
  fileInfo: {
    name: string;
    type: string;
    size: number;
  };
  user: {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    assignmentTitle?: string;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface SubmissionDetail {
  id: string;
  status: "NOT_SUBMITTED" | "SUBMITTED" | "LATE" | "GRADED";
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  assignment: {
    title: string;
    description: string;
    dueDate: string;
    points: number;
    classroomName: string;
  };
  student: {
    name: string;
    email: string;
  };
}

export interface Grade {
  id: string;
  score: number;
  feedback?: string;
  assignmentId: string;
  userId: string;
  createdAt: string;
  assignment?: {
    title: string;
    classroom?: {
      name: string;
    };
  };
  user?: {
    name: string;
  };
}

// Input types for creating/updating
export interface AssignmentInput {
  title: string;
  description: string;
  dueDate: string;
  classroomId: string;
  status?: "draft" | "published" | "archived";
  file?: File | null;
}

export interface SubmissionInput {
  assignmentId: string;
  file: File;
}

export interface GradeInput {
  score: number;
  feedback?: string;
}

export interface UpcomingAssignment {
  classroomName: string;
  asssignmentTitle: string;
  dueDate: string;
}

export interface Notification {
  type: "grade" | "announcement" | "assignment" | "material";
  id: string;
  course: string;
  title: string;
  description?: string;
  content?: string;
  score?: number;
  feedback?: string;
  dueDate?: string;
  assignment?: string;
  timestamp: string;
  isNew: boolean;
}
