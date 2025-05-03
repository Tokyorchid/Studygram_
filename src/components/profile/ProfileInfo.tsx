import { useRef, useState, useEffect } from "react";
import { Camera, User, MessageSquare, UserPlus, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase, updateProfile, followUser, unfollowUser, isFollowing } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast as sonnerToast } from "sonner";

interface ProfileData {
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  id?: string;
}

interface ProfileInfoProps {
  profile: ProfileData;
  editMode: boolean;
  onProfileUpdate: () => Promise<void>;
  onEditModeChange: (mode: boolean) => void;
  onSignOut: () => void;
  onProfileChange: (updates: Partial<ProfileData>) => void;
}

export const ProfileInfo = ({
  profile,
  editMode,
  onProfileUpdate,
  onEditModeChange,
  onSignOut,
  onProfileChange,
}: ProfileInfoProps) => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCurrentUser, setIsCurrentUser] = useState(true);
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Check if this is the current user's profile or someone else's
  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && profile.id) {
        const isCurrent = user.id === profile.id;
        setIsCurrentUser(isCurrent);

        // If not current user, check if following
        if (!isCurrent) {
          const following = await isFollowing(profile.id);
          setIsFollowingUser(following);
        }
      }
    };
    
    checkCurrentUser();
  }, [profile.id]);

  // Fetch followers and following counts
  useEffect(() => {
    const fetchFollowCounts = async () => {
      if (!profile.id) return;

      try {
        // Get followers count
        const { data: followers, error: followersError } = await supabase
          .from('user_follows')
          .select('follower_id')
          .eq('following_id', profile.id);
        
        if (!followersError) {
          setFollowersCount(followers?.length || 0);
        }

        // Get following count
        const { data: following, error: followingError } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', profile.id);
        
        if (!followingError) {
          setFollowingCount(following?.length || 0);
        }
      } catch (error) {
        console.error("Error fetching follow counts:", error);
      }
    };

    fetchFollowCounts();
  }, [profile.id, isFollowingUser]);

  const uploadAvatar = async (file: File) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please login first!");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar_${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('user-content')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('user-content')
        .getPublicUrl(filePath);

      const { error } = await updateProfile(user.id, { avatar_url: publicUrl });

      if (error) throw error;

      await onProfileUpdate();
      
      toast({
        title: "Avatar updated! ✨",
        description: "Your profile picture looks great!",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed 😭",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadAvatar(file);
  };

  const updateUserProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please login first!");

      const { error } = await updateProfile(user.id, {
        username: profile.username,
        full_name: profile.full_name,
        bio: profile.bio,
      });

      if (error) throw error;

      await onProfileUpdate();
      onEditModeChange(false);
      
      toast({
        title: "Profile updated! ✨",
        description: "Your changes have been saved successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Update failed 😭",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFollowToggle = async () => {
    if (!profile.id) return;
    
    setFollowLoading(true);
    try {
      if (isFollowingUser) {
        // Unfollow
        const { error } = await unfollowUser(profile.id);
        if (error) throw error;
        setIsFollowingUser(false);
        sonnerToast.success("Unfollowed successfully");
      } else {
        // Follow
        const { error } = await followUser(profile.id);
        if (error) throw error;
        setIsFollowingUser(true);
        sonnerToast.success("Now following " + (profile.username || "user"));
      }
    } catch (error: any) {
      console.error("Error updating follow status:", error);
      sonnerToast.error(error.message || "Failed to update follow status");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleMessage = () => {
    if (!profile.id) return;
    navigate(`/messages?userId=${profile.id}`);
  };

  return (
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
          {isCurrentUser && (
            <button 
              onClick={() => avatarInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full hover:bg-purple-600 transition-colors"
            >
              <Camera className="w-4 h-4 text-white" />
            </button>
          )}
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="flex-1 space-y-2">
          {editMode ? (
            <form onSubmit={updateUserProfile} className="space-y-4">
              <Input
                value={profile.username || ""}
                onChange={(e) => onProfileChange({ username: e.target.value })}
                placeholder="@username"
                className="bg-white/5 border-none text-white"
              />
              <Input
                value={profile.full_name || ""}
                onChange={(e) => onProfileChange({ full_name: e.target.value })}
                placeholder="Full Name"
                className="bg-white/5 border-none text-white"
              />
              <Textarea
                value={profile.bio || ""}
                onChange={(e) => onProfileChange({ bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="bg-white/5 border-none text-white resize-none"
                rows={3}
              />
              <div className="flex gap-2">
                <Button type="submit">Save Changes</Button>
                <Button type="button" variant="outline" onClick={() => onEditModeChange(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {profile.full_name || "Profile Owner"}
              </h1>
              <p className="text-gray-400">@{profile.username || "user"}</p>
              
              <div className="flex gap-4 mt-1 text-sm text-gray-300">
                <span>{followersCount} followers</span>
                <span>{followingCount} following</span>
              </div>
              
              {profile.bio && (
                <p className="text-white/80 mt-2">{profile.bio}</p>
              )}
              
              <div className="flex gap-3 mt-4">
                {isCurrentUser ? (
                  <>
                    <Button onClick={() => onEditModeChange(true)}>Edit Profile</Button>
                    <Button variant="destructive" onClick={onSignOut}>
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={isFollowingUser ? "bg-purple-700 hover:bg-purple-800" : ""}
                    >
                      {followLoading ? (
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                      ) : isFollowingUser ? (
                        <>
                          <UserX className="h-4 w-4 mr-2" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={handleMessage}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
