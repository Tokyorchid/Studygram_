
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, User, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export function UserSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: searchResults, refetch, isLoading } = useQuery({
    queryKey: ["searchUsers", searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
        .limit(5);
      
      if (error) throw error;
      return data as Profile[];
    },
    enabled: false // We'll trigger this manually
  });

  const handleSearch = () => {
    if (searchTerm.trim()) {
      refetch();
    }
  };

  const viewProfile = (userId: string) => {
    navigate(`/profile?id=${userId}`);
  };

  const followUser = async (userId: string) => {
    try {
      // Here you would implement the follow functionality
      // which would typically involve adding a record to a follows table
      toast.success("User followed successfully!");
    } catch (error) {
      console.error("Error following user:", error);
      toast.error("Failed to follow user");
    }
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
        >
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </div>
      
      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin h-5 w-5 border-2 border-purple-500 rounded-full border-t-transparent mx-auto"></div>
          <p className="text-gray-400 mt-2">Searching for users...</p>
        </div>
      )}
      
      {searchResults && searchResults.length > 0 ? (
        <div className="space-y-3">
          {searchResults.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.username || "user"} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-5 w-5 text-white" />
                  )}
                </div>
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
                  className="bg-purple-500 hover:bg-purple-600"
                  onClick={() => followUser(profile.id)}
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  Follow
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : searchResults && searchResults.length === 0 && searchTerm ? (
        <div className="text-center py-4">
          <p className="text-gray-400">No users found matching "{searchTerm}"</p>
        </div>
      ) : null}
    </div>
  );
}
