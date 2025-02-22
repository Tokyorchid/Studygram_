
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Calendar, Layout } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/posts/PostCard";
import CreatePostForm from "@/components/posts/CreatePostForm";
import { motion } from "framer-motion";

const Posts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "board">("board");

  const { data: posts, refetch } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles:user_id(username, full_name)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const filteredPosts = posts?.filter(
    (post) =>
      post.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Study Sessions Board
            </h1>
            <p className="text-gray-400">
              Organize and join study sessions that match your interests
            </p>
          </motion.div>
        </div>

        {/* Controls Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 bg-gray-900/50 backdrop-blur-xl p-4 rounded-xl border border-gray-800"
        >
          {/* Left Section */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search study sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white w-full"
              />
            </div>
            <Button variant="outline" className="border-gray-700 text-gray-300">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center bg-gray-800/50 rounded-lg p-1">
              <Button
                variant={viewMode === "board" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("board")}
                className="px-3"
              >
                <Layout className="w-4 h-4 mr-2" />
                Board
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-3"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
            </div>
            <Button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="bg-purple-500 hover:bg-purple-600 text-white ml-auto md:ml-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </div>
        </motion.div>

        {showCreatePost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <CreatePostForm 
              onSuccess={() => {
                setShowCreatePost(false);
                refetch();
              }}
              onCancel={() => setShowCreatePost(false)}
            />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`grid gap-6 ${
            viewMode === "board" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          }`}
        >
          {filteredPosts?.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              viewMode={viewMode}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Posts;
