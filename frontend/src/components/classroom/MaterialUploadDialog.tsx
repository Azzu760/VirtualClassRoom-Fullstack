import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/components/ui/use-toast";
import { UploadCloud, Link2, File, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MaterialUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  classroomId: string;
  userId: string;
  onUpload: (formData: FormData) => Promise<void>;
  supportedFileTypes?: string[];
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

const MAX_FILE_SIZE_MB = 50; // 50MB max file size

const MaterialUploadDialog = ({
  isOpen,
  onClose,
  classroomId,
  userId,
  onUpload,
  supportedFileTypes = SUPPORTED_FILE_TYPES,
}: MaterialUploadDialogProps) => {
  const { toast } = useToast();
  const [type, setType] = useState<"file" | "link">("file");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Check file type
    if (!supportedFileTypes.includes(selectedFile.type)) {
      setFileError(
        `Unsupported file type. Supported formats: ${supportedFileTypes
          .map((t) => t.split("/").pop())
          .filter(Boolean)
          .join(", ")}`
      );
      setFile(null);
      return;
    }

    // Check file size
    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFileError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit`);
      setFile(null);
      return;
    }

    setFileError("");
    setFile(selectedFile);
    if (!title) {
      setTitle(selectedFile.name.split(".").slice(0, -1).join("."));
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileError("");
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a title for the material",
      });
      return;
    }

    if (type === "file" && !file) {
      setFileError("Please select a file to upload");
      return;
    }

    if (type === "link" && !url) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid URL",
      });
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("type", type);
      formData.append("classroomId", classroomId);
      formData.append("userId", userId);

      if (type === "file" && file) {
        formData.append("file", file);
      } else if (type === "link") {
        formData.append("url", url.trim());
      }

      await onUpload(formData);
      toast({
        title: "Success",
        description: "Material uploaded successfully",
      });
      onClose();
      resetForm();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload material",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setType("file");
    setFile(null);
    setTitle("");
    setDescription("");
    setUrl("");
    setFileError("");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {type === "file" ? "Upload File" : "Add Link"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter material title"
              required
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
              rows={3}
            />
          </div>

          {/* Type Selector */}
          <div className="space-y-2">
            <Label>Material Type *</Label>
            <RadioGroup
              value={type}
              onValueChange={(value: "file" | "link") => {
                setType(value);
                setFileError("");
              }}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="file"
                  id="file"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="file"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary",
                    type === "file" && "border-primary"
                  )}
                >
                  <File className="mb-2 h-6 w-6" />
                  File Upload
                </Label>
              </div>
              <div>
                <RadioGroupItem
                  value="link"
                  id="link"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="link"
                  className={cn(
                    "flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary",
                    type === "link" && "border-primary"
                  )}
                >
                  <Link2 className="mb-2 h-6 w-6" />
                  Web Link
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* File Upload Area */}
          {type === "file" ? (
            <div className="space-y-2">
              <Label>File *</Label>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                {file ? (
                  <div className="flex w-full items-center justify-between rounded-md bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                    <div className="mt-4 flex text-sm text-gray-600">
                      <Label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80"
                      >
                        <span>Upload a file</span>
                        <Input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          onChange={handleFileChange}
                          className="sr-only"
                          accept={supportedFileTypes.join(",")}
                        />
                      </Label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {`Supports: ${supportedFileTypes
                        .map((t) => t.split("/").pop())
                        .filter(Boolean)
                        .join(", ")} (Max ${MAX_FILE_SIZE_MB}MB)`}
                    </p>
                  </>
                )}
              </div>
              {fileError && <p className="text-sm text-red-500">{fileError}</p>}
            </div>
          ) : (
            /* URL Input */
            <div className="space-y-2">
              <Label htmlFor="url">URL *</Label>
              <Input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onClose();
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isLoading ||
              !title.trim() ||
              (type === "file" && !file) ||
              (type === "link" && !url.trim())
            }
          >
            {isLoading ? (
              <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : (
              "Upload Material"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MaterialUploadDialog;
