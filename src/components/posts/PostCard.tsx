
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

    if (now < startDate) return "bg-blue-500/20 text-blue-300";
    if (now > endDate) return "bg-red-500/20 text-red-300";
    return "bg-green-500/20 text-green-300";
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
        whileHover={{ x: 8 }}
        className="backdrop-blur-xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-800/50 p-4 flex items-center gap-4"
      >
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-white">{post.title}</h3>
            <Badge variant="outline" className={getStatusColor()}>
              {getStatus()}
            </Badge>
          </div>
          <p className="text-gray-400 text-sm mb-2">{post.subject}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(post.available_from), "MMM d, yyyy")}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {format(new Date(post.available_from), "h:mm a")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-gray-400">
            <Users className="w-4 h-4" />
            <span className="text-sm">3</span>
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="relative overflow-hidden"
    >
      <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/50 to-gray-800/30 rounded-xl border border-gray-800/50 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <Badge variant="outline" className={getStatusColor()}>
              {getStatus()}
            </Badge>
            <h3 className="text-xl font-bold text-white mt-2">
              {post.title}
            </h3>
            <span className="inline-block px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300 mt-2">
              {post.subject}
            </span>
          </div>
        </div>
        
        {post.description && (
          <p className="text-gray-400 mb-4 line-clamp-2">
            {post.description}
          </p>
        )}
        
        <div className="space-y-2 text-sm border-t border-gray-800/50 pt-4">
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
        
        <div className="mt-4 pt-4 border-t border-gray-800/50">
          <p className="text-purple-400 text-sm">
            Posted by: {post.profiles.full_name || post.profiles.username}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
