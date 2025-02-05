import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/50 border-purple-500/20"
          />
          <Button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {showCreatePost ? "Cancel" : "Create Post"}
          </Button>
        </div>

        {showCreatePost && (
          <form
            onSubmit={handleCreatePost}
            className="space-y-4 bg-black/50 border border-purple-500/20 p-6 rounded-xl"
          >
            <Input
              placeholder="Title"
              value={newPost.title}
              onChange={(e) =>
                setNewPost({ ...newPost, title: e.target.value })
              }
              required
              className="bg-black/50 border-purple-500/20"
            />
            <Input
              placeholder="Subject"
              value={newPost.subject}
              onChange={(e) =>
                setNewPost({ ...newPost, subject: e.target.value })
              }
              required
              className="bg-black/50 border-purple-500/20"
            />
            <Input
              placeholder="Description"
              value={newPost.description}
              onChange={(e) =>
                setNewPost({ ...newPost, description: e.target.value })
              }
              className="bg-black/50 border-purple-500/20"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="datetime-local"
                value={newPost.available_from}
                onChange={(e) =>
                  setNewPost({ ...newPost, available_from: e.target.value })
                }
                required
                className="bg-black/50 border-purple-500/20"
              />
              <Input
                type="datetime-local"
                value={newPost.available_until}
                onChange={(e) =>
                  setNewPost({ ...newPost, available_until: e.target.value })
                }
                required
                className="bg-black/50 border-purple-500/20"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Post
            </Button>
          </form>
        )}

        <div className="space-y-4">
          {filteredPosts?.map((post) => (
            <div
              key={post.id}
              className="bg-black/50 border border-purple-500/20 p-6 rounded-xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{post.title}</h3>
                  <p className="text-purple-400">{post.subject}</p>
                </div>
                <span className="text-sm text-gray-400">
                  {format(new Date(post.created_at), "PPp")}
                </span>
              </div>
              {post.description && (
                <p className="text-gray-300">{post.description}</p>
              )}
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>
                  Available: {format(new Date(post.available_from), "PPp")} -{" "}
                  {format(new Date(post.available_until), "PPp")}
                </span>
                <span>
                  Posted by:{" "}
                  {post.profiles.full_name || post.profiles.username}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Posts;