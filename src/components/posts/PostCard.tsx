
import { format } from "date-fns";
import { motion } from "framer-motion";

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
}

const PostCard = ({ post }: PostCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative overflow-hidden"
    >
      <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 rounded-xl border border-white/10 shadow-lg hover:shadow-xl transition-all">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-50" />
        <div className="relative p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                {post.title}
              </h3>
              <span className="inline-block px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-300 mt-2">
                {post.subject}
              </span>
            </div>
            <span className="text-sm text-gray-400">
              {format(new Date(post.created_at), "PPp")}
            </span>
          </div>
          
          {post.description && (
            <p className="text-gray-300 mb-4 leading-relaxed">
              {post.description}
            </p>
          )}
          
          <div className="space-y-2 text-sm">
            <p className="text-gray-400 flex items-center">
              <span className="w-24">From:</span>
              <span className="text-gray-300">{format(new Date(post.available_from), "PPp")}</span>
            </p>
            <p className="text-gray-400 flex items-center">
              <span className="w-24">Until:</span>
              <span className="text-gray-300">{format(new Date(post.available_until), "PPp")}</span>
            </p>
            <p className="text-purple-400 mt-4 pt-4 border-t border-white/10">
              Posted by: {post.profiles.full_name || post.profiles.username}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;
