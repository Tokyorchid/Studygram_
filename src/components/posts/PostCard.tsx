
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Calendar, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Post {
  id: string;
  title: string;
  subject: string;
  description: string;
  available_from: string;
  available_until: string;
  created_at: string;
  profiles: {
    username: string;
    full_name: string;
  };
}

interface PostCardProps {
  post: Post;
  viewMode: "list" | "board";
}

const PostCard = ({ post, viewMode }: PostCardProps) => {
  const getStatusColor = () => {
    const now = new Date();
    const startDate = new Date(post.available_from);
    const endDate = new Date(post.available_until);

    if (now < startDate) return "bg-blue-400/10 text-blue-300 border-blue-400/20";
    if (now > endDate) return "bg-red-400/10 text-red-300 border-red-400/20";
    return "bg-emerald-400/10 text-emerald-300 border-emerald-400/20";
  };

  const getStatus = () => {
    const now = new Date();
    const startDate = new Date(post.available_from);
    const endDate = new Date(post.available_until);

    if (now < startDate) return "Upcoming";
    if (now > endDate) return "Completed";
    return "In Progress";
  };

  if (viewMode === "list") {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/[0.05] p-5 flex items-center gap-4 transition-colors hover:bg-white/[0.04]"
      >
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-medium text-white/90">{post.title}</h3>
            <Badge variant="outline" className={`${getStatusColor()} text-xs px-2 py-0.5`}>
              {getStatus()}
            </Badge>
          </div>
          <p className="text-gray-400 text-sm mb-3">{post.subject}</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              {format(new Date(post.available_from), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              {format(new Date(post.available_from), "h:mm a")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-gray-400 bg-white/[0.03] px-3 py-1.5 rounded-lg">
            <Users className="w-4 h-4" />
            <span className="text-sm">3</span>
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden"
    >
      <div className="bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/[0.05] p-6 transition-colors hover:bg-white/[0.04]">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-3">
            <Badge variant="outline" className={`${getStatusColor()} text-xs px-2 py-0.5`}>
              {getStatus()}
            </Badge>
            <h3 className="text-xl font-medium text-white/90">
              {post.title}
            </h3>
            <span className="inline-block px-3 py-1 rounded-lg text-sm bg-purple-400/10 text-purple-300 border border-purple-400/20">
              {post.subject}
            </span>
          </div>
        </div>
        
        {post.description && (
          <p className="text-gray-400 mb-6 line-clamp-2 text-sm">
            {post.description}
          </p>
        )}
        
        <div className="space-y-3 text-sm border-t border-white/[0.05] pt-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(post.available_from), "MMMM d, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{format(new Date(post.available_from), "h:mm a")} - {format(new Date(post.available_until), "h:mm a")}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-4 h-4" />
            <span>3 participants</span>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-white/[0.05]">
          <p className="text-gray-400 text-sm">
            Posted by: <span className="text-purple-300">{post.profiles.full_name || post.profiles.username}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
