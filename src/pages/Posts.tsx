import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PostCard from "@/components/posts/PostCard";
import CreatePostForm from "@/components/posts/CreatePostForm";

const Posts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreatePost, setShowCreatePost] = useState(false);

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
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Study Sessions</h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/50 backdrop-blur-sm border-none"
            />
          </div>
          <Button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="w-full md:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            {showCreatePost ? "Cancel" : "Create Post"}
          </Button>
        </div>

        {showCreatePost && (
          <CreatePostForm 
            onSuccess={() => {
              setShowCreatePost(false);
              refetch();
            }}
            onCancel={() => setShowCreatePost(false)}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts?.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Posts;