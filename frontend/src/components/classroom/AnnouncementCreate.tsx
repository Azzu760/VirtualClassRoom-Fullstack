import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";

interface AnnouncementCreateProps {
  onCreate: (title: string, content: string) => Promise<void>;
}

const AnnouncementCreate = ({ onCreate }: AnnouncementCreateProps) => {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both title and content",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(title, content);
      setTitle("");
      setContent("");
      setIsExpanded(false);
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
    >
      <div className="flex items-start space-x-4">
        <Avatar>
          <AvatarFallback>TC</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          {!isExpanded ? (
            <div
              className="border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setIsExpanded(true)}
            >
              <p className="text-gray-500 dark:text-gray-400">
                Announce something to your class...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-base"
              />
              <Textarea
                placeholder="What would you like to announce?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                className="text-base"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setTitle("");
                    setContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AnnouncementCreate;
