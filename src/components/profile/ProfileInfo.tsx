
import { useRef, useState, useEffect } from "react";
import { Camera, User, MessageSquare, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { followUser, unfollowUser, isFollowing } from "@/services/directMessageService";

interface ProfileData {
  username: string | null;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
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
  const [profileUserId, setProfileUserId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      // Get current logged in user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserId(user.id);

      // Check if this profile belongs to someone else (using URL query params)
      const params = new URLSearchParams(window.location.search);
      const profileId = params.get('id');
      
      if (profileId && profileId !== user.id) {
        setIsCurrentUser(false);
        setProfileUserId(profileId);
        
        // Check if current user is following this profile
        const following = await isFollowing(profileId);
        setIsFollowingUser(following);
      } else {
        setIsCurrentUser(true);
        setProfileUserId(user.id);
      }
    };
    
    checkUser();
  }, []);

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

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

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

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please login first!");

      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          full_name: profile.full_name,
          bio: profile.bio,
        })
        .eq('id', user.id);

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
    if (!profileUserId) return;
    
    if (isFollowingUser) {
      const success = await unfollowUser(profileUserId);
      if (success) setIsFollowingUser(false);
    } else {
      const success = await followUser(profileUserId);
      if (success) setIsFollowingUser(true);
    }
  };

  const handleStartConversation = () => {
    if (!profileUserId) return;
    navigate(`/messages?contact=${profileUserId}`);
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
            <form onSubmit={updateProfile} className="space-y-4">
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
              {profile.bio && (
                <p className="text-white/80 mt-2">{profile.bio}</p>
              )}
              <div className="flex gap-4 mt-4">
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
                      variant={isFollowingUser ? "outline" : "default"}
                      onClick={handleFollowToggle}
                    >
                      {isFollowingUser ? (
                        <>
                          <UserMinus className="mr-2 h-4 w-4" />
                          Unfollow
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Follow
                        </>
                      )}
                    </Button>
                    <Button onClick={handleStartConversation}>
                      <MessageSquare className="mr-2 h-4 w-4" />
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
