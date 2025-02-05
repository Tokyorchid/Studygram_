import { format } from "date-fns";

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
    <div className="bg-white/50 backdrop-blur-sm p-6 rounded-xl hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold">{post.title}</h3>
          <p className="text-primary">{post.subject}</p>
        </div>
        <span className="text-sm text-gray-400">
          {format(new Date(post.created_at), "PPp")}
        </span>
      </div>
      {post.description && (
        <p className="text-gray-600 mb-4">{post.description}</p>
      )}
      <div className="space-y-2 text-sm text-gray-500">
        <p>From: {format(new Date(post.available_from), "PPp")}</p>
        <p>Until: {format(new Date(post.available_until), "PPp")}</p>
        <p className="text-primary">
          Posted by: {post.profiles.full_name || post.profiles.username}
        </p>
      </div>
    </div>
  );
};

export default PostCard;