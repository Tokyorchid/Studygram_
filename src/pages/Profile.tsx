
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { StudyPosts } from "@/components/profile/StudyPosts";

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
      <ProfileHeader 
        headerUrl={profile.header_url}
        onProfileUpdate={getProfile}
      />
      
      <div className="max-w-4xl mx-auto px-4">
        <ProfileInfo 
          profile={profile}
          editMode={editMode}
          onProfileUpdate={getProfile}
          onEditModeChange={setEditMode}
          onSignOut={handleSignOut}
          onProfileChange={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
        />
        
        <StudyPosts 
          posts={studyPosts}
          onPostsUpdate={getStudyPosts}
        />
      </div>
    </div>
  );
};

export default Profile;
