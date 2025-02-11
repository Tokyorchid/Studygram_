
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Volume2, Timer } from "lucide-react";
import { Json } from "@/integrations/supabase/types";

interface ZenPreferences {
  theme: string;
  music: string;
  timer: number;
}

const Settings = () => {
  const [preferences, setPreferences] = useState<ZenPreferences>({
    theme: "dark",
    music: "nature",
    timer: 25
  });
  const { toast } = useToast();

  useEffect(() => {
    getPreferences();
  }, []);

  const getPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("zen_mode_preferences")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      if (data?.zen_mode_preferences) {
        const zenPrefs = data.zen_mode_preferences as unknown as ZenPreferences;
        setPreferences(zenPrefs);
      }
    } catch (error: any) {
      toast({
        title: "couldn't get your vibe settings bestie 😭",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updatePreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("bestie, you're not logged in!");

      const { error } = await supabase
        .from("profiles")
        .update({
          zen_mode_preferences: preferences as unknown as Json
        })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "vibe check passed! ✨",
        description: "your zen mode is totally giving rn",
      });
    } catch (error: any) {
      toast({
        title: "that wasn't very zen of us 😔",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black/90 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/5 backdrop-blur-xl p-8 rounded-xl border border-purple-500/20 shadow-lg">
          <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            customize your vibe ✨
          </h1>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {preferences.theme === "dark" ? (
                    <Moon className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-purple-400" />
                  )}
                  <h3 className="text-lg font-medium text-white">zen mode theme</h3>
                </div>
                <Switch
                  checked={preferences.theme === "dark"}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, theme: checked ? "dark" : "light" })
                  }
                />
              </div>
              <p className="text-sm text-gray-400">
                bestie, pick your aesthetic for maximum focus vibes
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-medium text-white">background music</h3>
              </div>
              <Select
                value={preferences.music}
                onValueChange={(value) => setPreferences({ ...preferences, music: value })}
              >
                <SelectTrigger className="w-full bg-white/5 border-purple-500/20">
                  <SelectValue placeholder="pick your vibe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nature">nature sounds (fr fr)</SelectItem>
                  <SelectItem value="lofi">lo-fi beats to study to</SelectItem>
                  <SelectItem value="ambient">ambient vibes</SelectItem>
                  <SelectItem value="none">silence is golden bestie</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-medium text-white">focus timer</h3>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  value={[preferences.timer]}
                  onValueChange={([value]) => setPreferences({ ...preferences, timer: value })}
                  max={60}
                  min={5}
                  step={5}
                  className="flex-1"
                />
                <span className="text-white min-w-[4rem]">{preferences.timer} mins</span>
              </div>
              <p className="text-sm text-gray-400">
                slay your study sesh with the perfect timer
              </p>
            </div>

            <Button
              onClick={updatePreferences}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              save these immaculate vibes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
