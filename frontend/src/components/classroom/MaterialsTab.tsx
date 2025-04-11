import { motion } from "framer-motion";
import { PlusCircle, Download, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useMaterials } from "@/context/MaterialContext";
import { useEffect, useState } from "react";
import MaterialUploadDialog from "./MaterialUploadDialog";
import { Skeleton } from "@/components/ui/skeleton";

interface MaterialsTabProps {
  isTeacher: boolean;
  classroomId: string;
  userId: string;
}

const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
];

const MaterialsTab = ({
  isTeacher,
  classroomId,
  userId,
}: MaterialsTabProps) => {
  const { toast } = useToast();
  const {
    materials,
    loading,
    error,
    fetchMaterials,
    addMaterial,
    removeMaterial,
    downloadMaterial,
  } = useMaterials();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        await fetchMaterials(classroomId);
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Failed to load materials",
          description: error?.message || "Please try again later",
        });
      }
    };

    if (classroomId) {
      loadMaterials();
    }
  }, [classroomId, fetchMaterials, toast]);

  const handleDownload = async (material: any) => {
    try {
      if (material.type === "link" && material.url) {
        window.open(material.url, "_blank", "noopener,noreferrer");
        return;
      }

      if (
        material.fileType &&
        !SUPPORTED_FILE_TYPES.includes(material.fileType)
      ) {
        throw new Error("Unsupported file type");
      }

      const blob = await downloadMaterial(material.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", material.fileName || material.title);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download started",
        description: `${material.title} is being downloaded`,
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Download failed",
        description:
          err instanceof Error ? err.message : "Failed to download file",
      });
    }
  };

  const handleDelete = async (materialId: string) => {
    try {
      await removeMaterial(materialId);
      toast({
        title: "Success",
        description: "Material deleted successfully",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description:
          err instanceof Error ? err.message : "Failed to delete material",
      });
    }
  };

  const handleAddMaterial = async (formData: FormData) => {
    try {
      await addMaterial(formData);
      toast({
        title: "Success",
        description: "Material added successfully",
      });
      setIsUploadDialogOpen(false);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Upload failed",
        description:
          err instanceof Error ? err.message : "Failed to add material",
      });
    }
  };

  const getFileTypeColor = (fileType?: string) => {
    if (!fileType)
      return "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300";

    if (fileType.includes("pdf"))
      return "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300";
    if (fileType.includes("word"))
      return "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300";
    if (fileType.includes("presentation") || fileType.includes("powerpoint"))
      return "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300";
    if (fileType.includes("excel"))
      return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300";
    if (fileType.includes("zip"))
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300";

    return "bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300";
  };

  const getFileTypeName = (fileType?: string) => {
    if (!fileType) return "File";
    if (fileType.includes("pdf")) return "PDF";
    if (fileType.includes("word")) return "Word";
    if (fileType.includes("presentation") || fileType.includes("powerpoint"))
      return "PowerPoint";
    if (fileType.includes("excel")) return "Excel";
    if (fileType.includes("zip")) return "ZIP";
    return "File";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>Failed to load materials</p>
        {isTeacher && (
          <Button className="mt-4" onClick={() => fetchMaterials(classroomId)}>
            Retry
          </Button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Class Materials</h2>
        {isTeacher && (
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Material
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {materials?.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {isTeacher ? (
              <>
                <p>No materials available yet.</p>
                <Button
                  className="mt-4"
                  onClick={() => setIsUploadDialogOpen(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Your First Material
                </Button>
              </>
            ) : (
              "No materials available yet."
            )}
          </div>
        ) : (
          materials?.map((material) => (
            <div
              key={material.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`h-10 w-10 flex items-center justify-center rounded ${getFileTypeColor(
                    material.fileType
                  )}`}
                >
                  {getFileTypeName(material.fileType)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{material.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {material.type === "link" ? (
                      <>
                        Link • Added{" "}
                        {new Date(material.createdAt).toLocaleDateString()}
                      </>
                    ) : (
                      <>
                        {getFileTypeName(material.fileType)} •{" "}
                        {formatFileSize(material.fileSize)} • Added{" "}
                        {new Date(material.createdAt).toLocaleDateString()}
                      </>
                    )}
                  </p>
                  {material.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {material.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(material)}
                  >
                    {material.type === "link" ? (
                      <>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                  {isTeacher && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(material.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <MaterialUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        classroomId={classroomId}
        userId={userId}
        onUpload={handleAddMaterial}
        supportedFileTypes={SUPPORTED_FILE_TYPES}
      />
    </motion.div>
  );
};

export default MaterialsTab;
