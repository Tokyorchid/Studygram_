import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

interface Profile {
  username: string | null;
  full_name: string | null;
}

const Profile = () => {
  const [profile, setProfile] = useState<Profile>({ username: "", full_name: "" });
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
        .select("username, full_name")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data) setProfile(data);
    } catch (error: any) {
      toast({
        title: "Error fetching profile",
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
      if (!user) throw new Error("No user logged in");

      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          full_name: profile.full_name,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Profile updated! ✨",
        description: "Your profile has been successfully updated",
      });
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/50 backdrop-blur-sm p-8 rounded-xl">
          <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
          
          <form onSubmit={updateProfile} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                value={profile.username || ""}
                onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                className="border-none bg-white/50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="border-none bg-white/50"
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Save Changes
              </Button>
              <Button type="button" variant="destructive" onClick={handleSignOut} className="flex-1">
                Sign Out
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;