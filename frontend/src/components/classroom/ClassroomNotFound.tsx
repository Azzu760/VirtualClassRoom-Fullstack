import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface ClassroomNotFoundProps {
  errorMessage?: string;
}

const ClassroomNotFound = ({ errorMessage }: ClassroomNotFoundProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Classroom Not Found
        </h1>
        {errorMessage && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {errorMessage}
          </p>
        )}
        <Button asChild>
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ClassroomNotFound;
