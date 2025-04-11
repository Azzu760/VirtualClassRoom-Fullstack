import type { Classroom } from "@/types/index";
import { getCoverImage } from "@/utils/coverImage";

interface ClassroomBannerProps {
  classroom: Classroom;
}

const ClassroomBanner = ({ classroom }: ClassroomBannerProps) => {
  const coverImage = getCoverImage(classroom.subject);

  return (
    <div
      className="h-40 bg-gradient-to-r from-blue-500 to-blue-600 relative overflow-hidden"
      style={{
        backgroundImage: `url(${coverImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="absolute inset-0 flex items-end">
        <div className="p-6 text-white">
          <h1 className="text-2xl font-bold">{classroom.name}</h1>
          <p className="text-lg">{classroom.subject || ""}</p>
          <p className="text-sm text-white">
            Instructor: {classroom.teacherName}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClassroomBanner;
