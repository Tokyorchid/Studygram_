
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, getProfile } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileInfo } from "@/components/profile/ProfileInfo";
import { StudyPosts } from "@/components/profile/StudyPosts";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
  id: string;
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
    id: "",
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
  const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the requested user ID from the URL query parameters
  const userIdParam = new URLSearchParams(location.search).get('id');

  useEffect(() => {
    getProfileData();
  }, [userIdParam]);

  const getProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user && !userIdParam) {
        navigate("/login");
        return;
      }

      const profileId = userIdParam || user?.id;
      
      if (!profileId) {
        toast({
          title: "oof, we hit a snag 😔",
          description: "No profile ID found",
          variant: "destructive",
        });
        return;
      }

      // Set whether this is the current user's profile
      setIsCurrentUserProfile(!userIdParam || userIdParam === user?.id);

      // Fetch the profile data
      const profileData = await getProfile(profileId);

      if (profileData) {
        const zenPrefs = profileData.zen_mode_preferences as unknown as ZenPreferences;
        setProfile({
          id: profileId,
          username: profileData.username,
          full_name: profileData.full_name,
          zen_mode_preferences: zenPrefs,
          bio: profileData.bio,
          avatar_url: profileData.avatar_url,
          header_url: profileData.header_url,
          last_study_post: profileData.last_study_post
        });

        // Fetch study posts for this profile
        await getStudyPosts(profileId);
      } else {
        toast({
          title: "Profile not found 😔",
          description: "We couldn't find this profile",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "oof, we hit a snag 😔",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStudyPosts = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("study_posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) {
        setStudyPosts(data);
      }
    } catch (error: any) {
      toast({
        title: "couldn't get study posts fr 😭",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "yikes, couldn't sign you out 😭",
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
        <div className="animate-pulse text-xl text-purple-400">loading profile vibes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black/90 pb-8">
      {!isCurrentUserProfile && (
        <div className="p-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      )}
      
      <ProfileHeader 
        headerUrl={profile.header_url}
        onProfileUpdate={getProfileData}
      />
      
      <div className="max-w-4xl mx-auto px-4">
        <ProfileInfo 
          profile={profile}
          editMode={editMode}
          onProfileUpdate={getProfileData}
          onEditModeChange={setEditMode}
          onSignOut={handleSignOut}
          onProfileChange={(updates) => setProfile((prev) => ({ ...prev, ...updates }))}
        />
        
        <StudyPosts 
          posts={studyPosts}
          onPostsUpdate={() => getStudyPosts(profile.id)}
          readOnly={!isCurrentUserProfile}
        />
      </div>
    </div>
  );
};

export default Profile;
