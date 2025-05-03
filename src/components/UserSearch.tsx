
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, UserPlus, UserCheck, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { supabase, searchProfiles, followUser, unfollowUser, isFollowing } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const [followStatus, setFollowStatus] = useState<Record<string, boolean>>({});
  const [loadingFollow, setLoadingFollow] = useState<Record<string, boolean>>({});

  const { data: searchResults, refetch, isLoading, isRefetching } = useQuery({
    queryKey: ["searchUsers", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      const profiles = await searchProfiles(searchTerm);
      return profiles;
    },
    enabled: false // We'll trigger this manually
  });

  useEffect(() => {
    // Check follow status for each user in search results
    if (searchResults && searchResults.length > 0) {
      searchResults.forEach(async (profile) => {
        const following = await isFollowing(profile.id);
        setFollowStatus(prev => ({ ...prev, [profile.id]: following }));
      });
    }
  }, [searchResults]);

  const handleSearch = () => {
    if (searchTerm.trim()) {
      refetch();
    }
  };

  const viewProfile = (userId: string) => {
    navigate(`/profile?id=${userId}`);
  };

  const handleFollowUser = async (userId: string) => {
    try {
      setLoadingFollow(prev => ({ ...prev, [userId]: true }));
      const isCurrentlyFollowing = followStatus[userId];
      
      if (isCurrentlyFollowing) {
        // Unfollow
        const { error } = await unfollowUser(userId);
        if (error) throw error;
        setFollowStatus(prev => ({ ...prev, [userId]: false }));
        toast.success("Unfollowed successfully");
      } else {
        // Follow
        const { error } = await followUser(userId);
        if (error) throw error;
        setFollowStatus(prev => ({ ...prev, [userId]: true }));
        toast.success("Following user!");
      }
    } catch (error: any) {
      console.error("Error following/unfollowing user:", error);
      toast.error(error.message || "Failed to update follow status");
    } finally {
      setLoadingFollow(prev => ({ ...prev, [userId]: false }));
    }
  };

  const openMessages = (userId: string) => {
    navigate(`/messages?userId=${userId}`);
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
      <h2 className="text-xl font-semibold mb-4">Find Study Buddies</h2>
      
      <div className="flex gap-2 mb-4">
        <Input 
          className="bg-gray-800/50 border-purple-500/20"
          placeholder="Search for users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button 
          className="bg-purple-500 hover:bg-purple-600"
          onClick={handleSearch}
          disabled={isLoading || isRefetching}
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
      
      {(isLoading || isRefetching) && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && !isRefetching && searchResults && searchResults.length > 0 ? (
        <div className="space-y-3">
          {searchResults.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-purple-500/30">
                  <AvatarImage src={profile.avatar_url || undefined} alt={profile.username || "user"} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500">
                    <User className="h-5 w-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{profile.full_name || "User"}</p>
                  <p className="text-sm text-gray-400">@{profile.username || "username"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-purple-500/20 hover:bg-purple-500/10"
                  onClick={() => viewProfile(profile.id)}
                >
                  View
                </Button>
                <Button 
                  size="sm"
                  className={followStatus[profile.id] ? 
                    "bg-purple-700 hover:bg-purple-800" : 
                    "bg-purple-500 hover:bg-purple-600"}
                  onClick={() => handleFollowUser(profile.id)}
                  disabled={loadingFollow[profile.id]}
                >
                  {loadingFollow[profile.id] ? (
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
                  ) : followStatus[profile.id] ? (
                    <>
                      <UserCheck className="h-4 w-4 mr-1" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-1" />
                      Follow
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
                  onClick={() => openMessages(profile.id)}
                  title="Send message"
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : !isLoading && !isRefetching && searchTerm ? (
        <div className="text-center py-4">
          <p className="text-gray-400">No users found matching "{searchTerm}"</p>
        </div>
      ) : null}
    </div>
  );
}
