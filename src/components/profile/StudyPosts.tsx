
import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StudyPost {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
}

interface StudyPostsProps {
  posts: StudyPost[];
  onPostsUpdate: () => Promise<void>;
}

export const StudyPosts = ({ posts, onPostsUpdate }: StudyPostsProps) => {
  const [newPostCaption, setNewPostCaption] = useState("");
  const [uploadingPost, setUploadingPost] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadPost = async (file: File) => {
    if (uploadingPost) return;
    setUploadingPost(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please login first!");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/post_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      const { error: postError } = await supabase
        .from('study_posts')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          caption: newPostCaption
        });

      if (postError) throw postError;

      await supabase
        .from('profiles')
        .update({ last_study_post: new Date().toISOString() })
        .eq('id', user.id);

      setNewPostCaption("");
      await onPostsUpdate();
      
      toast({
        title: "Post shared! 📚✨",
        description: "Your study progress has been posted!",
      });
    } catch (error: any) {
      toast({
        title: "Post failed 😭",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploadingPost(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadPost(file);
  };

  return (
    <div className="space-y-6">
      <div className="border-t border-purple-500/20 pt-6">
        <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Study Timeline ✨
        </h2>
        
        <div className="bg-white/5 p-4 rounded-xl mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingPost}
              className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <ImagePlus size={20} />
              {uploadingPost ? "Uploading..." : "Share Today's Study"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <Textarea
            value={newPostCaption}
            onChange={(e) => setNewPostCaption(e.target.value)}
            placeholder="Add a caption to your study post..."
            className="bg-white/5 border-none text-white resize-none"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white/5 rounded-xl overflow-hidden">
              <img 
                src={post.image_url} 
                alt="Study post" 
                className="w-full aspect-video object-cover"
              />
              <div className="p-4">
                <p className="text-white/80 mb-2">{post.caption}</p>
                <p className="text-sm text-gray-400">
                  {format(new Date(post.created_at), "PPp")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
