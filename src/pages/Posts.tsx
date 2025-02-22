
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
    <div className="min-h-screen bg-[#0A0A0B] p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto">
        {/* Subtle background blobs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        {/* Header Section */}
        <div className="mb-12 relative">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <h1 className="text-4xl font-bold text-white/90">
              Study Sessions
            </h1>
            <p className="text-gray-400 text-lg">
              Find and join study sessions that match your interests
            </p>
          </motion.div>
        </div>

        {/* Controls Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10 bg-white/[0.02] backdrop-blur-xl p-6 rounded-2xl border border-white/[0.05]"
        >
          {/* Left Section */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="Search study sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/[0.03] border-white/[0.05] text-white w-full h-11 text-base placeholder:text-gray-500"
              />
            </div>
            <Button 
              variant="outline" 
              className="border-white/[0.05] bg-white/[0.03] text-gray-300 hover:bg-white/[0.05] hover:text-white"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center bg-white/[0.03] rounded-lg p-1">
              <Button
                variant={viewMode === "board" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("board")}
                className={`px-4 ${viewMode === "board" ? "bg-white/10" : "hover:bg-white/[0.05]"}`}
              >
                <Layout className="w-4 h-4 mr-2" />
                Board
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={`px-4 ${viewMode === "list" ? "bg-white/10" : "hover:bg-white/[0.05]"}`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                List
              </Button>
            </div>
            <Button
              onClick={() => setShowCreatePost(!showCreatePost)}
              className="bg-white/[0.05] hover:bg-white/[0.08] text-white border border-white/[0.05]"
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
            className="mb-10"
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
