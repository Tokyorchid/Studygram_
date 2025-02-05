import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Plus, Search } from "lucide-react";

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

const Posts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPost, setNewPost] = useState({
    title: "",
    subject: "",
    description: "",
    available_from: "",
    available_until: "",
  });

  const { data: posts, refetch } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select(`*, profiles:user_id(username, full_name)`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Post[];
    },
  });

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to create a post");

      const { error } = await supabase.from("posts").insert({
        ...newPost,
        user_id: user.id,
      });

      if (error) throw error;

      toast({
        title: "Post created! ✨",
        description: "Your study session has been posted",
      });
      setShowCreatePost(false);
      setNewPost({
        title: "",
        subject: "",
        description: "",
        available_from: "",
        available_until: "",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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
          <ThemeSelector />
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
          <form
            onSubmit={handleCreatePost}
            className="space-y-4 bg-white/50 backdrop-blur-sm p-6 rounded-xl mb-8"
          >
            <Input
              placeholder="Title"
              value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              required
              className="border-none bg-white/50"
            />
            <Input
              placeholder="Subject"
              value={newPost.subject}
              onChange={(e) => setNewPost({ ...newPost, subject: e.target.value })}
              required
              className="border-none bg-white/50"
            />
            <Input
              placeholder="Description"
              value={newPost.description}
              onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
              className="border-none bg-white/50"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="datetime-local"
                value={newPost.available_from}
                onChange={(e) => setNewPost({ ...newPost, available_from: e.target.value })}
                required
                className="border-none bg-white/50"
              />
              <Input
                type="datetime-local"
                value={newPost.available_until}
                onChange={(e) => setNewPost({ ...newPost, available_until: e.target.value })}
                required
                className="border-none bg-white/50"
              />
            </div>
            <Button type="submit" className="w-full">Post</Button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts?.map((post) => (
            <div
              key={post.id}
              className="bg-white/50 backdrop-blur-sm p-6 rounded-xl hover:shadow-lg transition-shadow"
            >
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
                <p>
                  From: {format(new Date(post.available_from), "PPp")}
                </p>
                <p>
                  Until: {format(new Date(post.available_until), "PPp")}
                </p>
                <p className="text-primary">
                  Posted by: {post.profiles.full_name || post.profiles.username}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Posts;