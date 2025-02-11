
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Camera, User } from "lucide-react";

interface Profile {
  username: string | null;
  full_name: string | null;
  zen_mode_preferences: {
    theme: string;
    music: string;
    timer: number;
  } | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile>({ 
    username: "", 
    full_name: "", 
    zen_mode_preferences: null 
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    getProfile();
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
        .select("username, full_name, zen_mode_preferences")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
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
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "bestie you ate that! ✨",
        description: "profile's giving main character energy now",
      });
    } catch (error: any) {
      toast({
        title: "oof, that didn't work bestie 😭",
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
    <div className="min-h-screen bg-black/90 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-xl border border-purple-500/20 shadow-lg">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-3xl">
                {profile.username?.[0]?.toUpperCase() || <User size={40} />}
              </div>
              <button className="absolute bottom-0 right-0 bg-purple-500 p-2 rounded-full hover:bg-purple-600 transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {profile.full_name || "Main Character"}
              </h1>
              <p className="text-gray-400">@{profile.username || "bestie"}</p>
            </div>
          </div>
          
          <form onSubmit={updateProfile} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-purple-300">
                username (slay bestie)
              </label>
              <Input
                id="username"
                type="text"
                value={profile.username || ""}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="border-none bg-white/5 text-white placeholder:text-gray-500"
                placeholder="your iconic username"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-purple-300">
                full name (as you slay)
              </label>
              <Input
                id="fullName"
                type="text"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="border-none bg-white/5 text-white placeholder:text-gray-500"
                placeholder="your main character name"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                slay these changes bestie
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleSignOut} 
                className="flex-1 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                ttyl bestie
              </Button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-purple-500/20">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                more ways to slay
              </h2>
              <Button 
                onClick={() => navigate("/settings")}
                variant="outline" 
                className="border-purple-500/20 hover:bg-purple-500/10"
              >
                settings & vibes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
