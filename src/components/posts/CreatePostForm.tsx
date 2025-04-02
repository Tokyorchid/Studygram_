
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CreatePostFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreatePostForm = ({ onSuccess, onCancel }: CreatePostFormProps) => {
  const { toast } = useToast();
  const [newPost, setNewPost] = useState({
    title: "",
    subject: "",
    description: "",
    available_from: "",
    available_until: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to create a post");

      // Type assertion to help TypeScript understand this is a valid insert
      const postData = {
        ...newPost,
        user_id: user.id,
      };

      const { error } = await supabase
        .from("posts")
        .insert(postData as any);

      if (error) throw error;

      toast({
        title: "Post created! ✨",
        description: "Your study session has been posted",
      });
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white/50 backdrop-blur-sm p-6 rounded-xl mb-8">
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
      <div className="flex gap-4">
        <Button type="submit" className="flex-1">Post</Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </form>
  );
};

export default CreatePostForm;
