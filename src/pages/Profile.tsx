
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Camera, User, ImagePlus, X } from "lucide-react";
import { Json } from "@/integrations/supabase/types";
import { format } from "date-fns";

interface ZenPreferences {
  theme: string;
  music: string;
  timer: number;
}

interface StudyPost {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
}

interface Profile {
  username: string | null;
  full_name: string | null;
  zen_mode_preferences: ZenPreferences | null;
  bio: string | null;
  avatar_url: string | null;
  header_url: string | null;
  last_study_post: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile>({ 
    username: "", 
    full_name: "", 
    zen_mode_preferences: null,
    bio: "",
    avatar_url: null,
    header_url: null,
    last_study_post: null
  });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [studyPosts, setStudyPosts] = useState<StudyPost[]>([]);
  const [uploadingPost, setUploadingPost] = useState(false);
  const [newPostCaption, setNewPostCaption] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const headerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getProfile();
    getStudyPosts();
  }, []);

  const getProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("username, full_name, zen_mode_preferences, bio, avatar_url, header_url, last_study_post")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) {
        const zenPrefs = data.zen_mode_preferences as unknown as ZenPreferences;
        setProfile({
          username: data.username,
          full_name: data.full_name,
          zen_mode_preferences: zenPrefs,
          bio: data.bio,
          avatar_url: data.avatar_url,
          header_url: data.header_url,
          last_study_post: data.last_study_post
        });
      }
    } catch (error: any) {
      toast({
        title: "bestie, we hit a snag 😔",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStudyPosts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("study_posts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setStudyPosts(data);
      }
    } catch (error: any) {
      toast({
        title: "couldn't get your study posts bestie 😭",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("bestie, you're not logged in!");

      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          full_name: profile.full_name,
          bio: profile.bio,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "bestie you ate that! ✨",
        description: "profile's giving main character energy now",
      });
      setEditMode(false);
    } catch (error: any) {
      toast({
        title: "oof, that didn't work bestie 😭",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const uploadImage = async (file: File, type: 'avatar' | 'header' | 'post') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("bestie, you need to log in first!");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${type}_${Math.random()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      if (type === 'post') {
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
        getStudyPosts();
      } else {
        const updateData = type === 'avatar' 
          ? { avatar_url: publicUrl }
          : { header_url: publicUrl };

        const { error: updateError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', user.id);

        if (updateError) throw updateError;
        getProfile();
      }

      toast({
        title: "bestie that's fire! 🔥",
        description: `${type} updated successfully!`,
      });
    } catch (error: any) {
      toast({
        title: "upload failed bestie 😭",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'header' | 'post') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'post') {
      setUploadingPost(true);
    }

    try {
      await uploadImage(file, type);
    } finally {
      if (type === 'post') {
        setUploadingPost(false);
      }
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "bestie, we couldn't sign you out 😭",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black/90">
        <div className="animate-pulse text-xl text-purple-400">loading your vibe...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/90 pb-8">
      {/* Header Image */}
      <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-purple-900 to-pink-900">
        {profile.header_url && (
          <img 
            src={profile.header_url} 
            alt="Profile header" 
            className="w-full h-full object-cover"
          />
        )}
        <button 
          onClick={() => headerInputRef.current?.click()}
          className="absolute bottom-4 right-4 bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
        >
          <Camera className="w-5 h-5 text-white" />
        </button>
        <input
          ref={headerInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, 'header')}
          className="hidden"
        />
      </div>

      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Info Section */}
        <div className="relative -mt-20 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-black/90 overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.username || "Profile"} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-white" />
                )}
              </div>
              <button 
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full hover:bg-purple-600 transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatar')}
                className="hidden"
              />
            </div>

            <div className="flex-1 space-y-2">
              {editMode ? (
                <form onSubmit={updateProfile} className="space-y-4">
                  <Input
                    value={profile.username || ""}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    placeholder="@username"
                    className="bg-white/5 border-none text-white"
                  />
                  <Input
                    value={profile.full_name || ""}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Full Name"
                    className="bg-white/5 border-none text-white"
                  />
                  <Textarea
                    value={profile.bio || ""}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="Tell us about yourself bestie..."
                    className="bg-white/5 border-none text-white resize-none"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button type="submit">Save Changes</Button>
                    <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {profile.full_name || "Main Character"}
                  </h1>
                  <p className="text-gray-400">@{profile.username || "bestie"}</p>
                  {profile.bio && (
                    <p className="text-white/80 mt-2">{profile.bio}</p>
                  )}
                  <div className="flex gap-4 mt-4">
                    <Button onClick={() => setEditMode(true)}>Edit Profile</Button>
                    <Button variant="destructive" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Study Posts Section */}
        <div className="space-y-6">
          <div className="border-t border-purple-500/20 pt-6">
            <h2 className="text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              Study Timeline ✨
            </h2>
            
            {/* New Post Input */}
            <div className="bg-white/5 p-4 rounded-xl mb-6">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 px-4 py-2 rounded-lg transition-colors"
                >
                  <ImagePlus size={20} />
                  Share Today's Study
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'post')}
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

            {/* Study Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {studyPosts.map((post) => (
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
      </div>
    </div>
  );
};

export default Profile;

