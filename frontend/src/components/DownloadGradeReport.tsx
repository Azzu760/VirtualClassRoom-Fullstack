import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const DownloadGradeReport = ({ classroomId, isTeacher }) => {
  if (!isTeacher) return null;

  const handleDownload = async () => {
    try {
      const response = await axios.get(`${API_URL}/reports/${classroomId}`, {
        responseType: "blob",
      });

      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.setAttribute("download", `grade-report-${classroomId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  return (
    <Button onClick={handleDownload}>
      <Download className="h-4 w-4 mr-2" />
      Download Grade Report
    </Button>
  );
};

export default DownloadGradeReport;
