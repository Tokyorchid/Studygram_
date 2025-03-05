
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Volume2, Timer, Sparkles, Heart, Leaf } from "lucide-react";
import { Json } from "@/integrations/supabase/types";
import { motion } from "framer-motion";
import { playBackgroundMusic, stopAllBackgroundMusic } from "@/utils/audioUtils";

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
  const [previewMusic, setPreviewMusic] = useState<string | null>(null);
  const { toast } = useToast();

  // Apply theme immediately when changed in settings for preview
  useEffect(() => {
    document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
    document.documentElement.classList.toggle('light', preferences.theme === 'light');
  }, [preferences.theme]);

  useEffect(() => {
    getPreferences();
    
    // Clean up preview music when component unmounts
    return () => {
      stopAllBackgroundMusic();
    };
  }, []);

  // Handle preview music changes
  useEffect(() => {
    if (previewMusic) {
      playBackgroundMusic(previewMusic);
    } else {
      stopAllBackgroundMusic();
    }
  }, [previewMusic]);

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

  const handleMusicPreview = (musicType: string) => {
    // If already previewing this music, stop it
    if (previewMusic === musicType) {
      setPreviewMusic(null);
    } else {
      setPreviewMusic(musicType);
    }
  };

  const bgClass = preferences.theme === "dark" 
    ? "bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" 
    : "bg-gradient-to-br from-purple-100 via-white to-purple-100";
  
  const cardBgClass = preferences.theme === "dark" 
    ? "bg-white/5 backdrop-blur-xl border border-purple-500/20" 
    : "bg-white/80 backdrop-blur-xl border border-purple-200";
  
  const textClass = preferences.theme === "dark" ? "text-white" : "text-gray-800";
  const labelClass = preferences.theme === "dark" ? "text-purple-300" : "text-purple-600";
  const descClass = preferences.theme === "dark" ? "text-gray-400" : "text-gray-500";

  // Animation variants for motion components
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className={`min-h-screen ${bgClass} p-4 md:p-8 transition-colors duration-500`}>
      <div className="max-w-2xl mx-auto">
        <motion.div 
          className={`${cardBgClass} p-8 rounded-xl shadow-lg transition-colors duration-500`}
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                customize your vibe ✨
              </h1>
            </div>
            <p className={`${descClass} italic text-sm`}>
              "Even in the longest winter, your dreams won't freeze"
            </p>
          </motion.div>

          <div className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {preferences.theme === "dark" ? (
                    <Moon className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-purple-500" />
                  )}
                  <h3 className={`text-lg font-medium ${textClass}`}>zen mode theme</h3>
                </div>
                <Switch
                  checked={preferences.theme === "dark"}
                  onCheckedChange={(checked) => 
                    setPreferences({ ...preferences, theme: checked ? "dark" : "light" })
                  }
                />
              </div>
              <p className={`text-sm ${descClass}`}>
                choose a theme that soothes your soul and calms your mind
              </p>
              <div className={`p-3 rounded-lg ${preferences.theme === "dark" ? "bg-black/20" : "bg-white/40"} flex items-center gap-2`}>
                <Heart className="w-4 h-4 text-pink-400" /> 
                <span className={`text-xs ${descClass}`}>
                  {preferences.theme === "dark" 
                    ? "dark mode helps reduce eye strain during night study sessions" 
                    : "light mode brings clarity and energy to your morning sessions"}
                </span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-400" />
                <h3 className={`text-lg font-medium ${textClass}`}>background music</h3>
              </div>
              <Select
                value={preferences.music}
                onValueChange={(value) => setPreferences({ ...preferences, music: value })}
              >
                <SelectTrigger className={`w-full ${preferences.theme === "dark" ? "bg-white/5 border-purple-500/20" : "bg-white/60 border-purple-200"}`}>
                  <SelectValue placeholder="pick your vibe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nature">nature sounds (fr fr)</SelectItem>
                  <SelectItem value="lofi">lo-fi beats to study to</SelectItem>
                  <SelectItem value="ambient">ambient vibes</SelectItem>
                  <SelectItem value="none">silence is golden bestie</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`${preferences.theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-white/60 hover:bg-white/80"} border-purple-500/20`}
                  onClick={() => handleMusicPreview("nature")}
                >
                  {previewMusic === "nature" ? "Stop" : "Preview"} Nature
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`${preferences.theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-white/60 hover:bg-white/80"} border-purple-500/20`}
                  onClick={() => handleMusicPreview("lofi")}
                >
                  {previewMusic === "lofi" ? "Stop" : "Preview"} Lo-fi
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={`${preferences.theme === "dark" ? "bg-white/5 hover:bg-white/10" : "bg-white/60 hover:bg-white/80"} border-purple-500/20`}
                  onClick={() => handleMusicPreview("ambient")}
                >
                  {previewMusic === "ambient" ? "Stop" : "Preview"} Ambient
                </Button>
              </div>
              
              <div className={`p-3 rounded-lg ${preferences.theme === "dark" ? "bg-black/20" : "bg-white/40"} flex items-center gap-2`}>
                <Leaf className="w-4 h-4 text-green-400" /> 
                <span className={`text-xs ${descClass}`}>
                  music can boost your focus by up to 65% and reduce stress levels
                </span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-purple-400" />
                <h3 className={`text-lg font-medium ${textClass}`}>focus timer</h3>
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
                <span className={`${textClass} min-w-[4rem] text-center`}>{preferences.timer} mins</span>
              </div>
              <p className={`text-sm ${descClass}`}>
                find your perfect focus window for maximum productivity
              </p>
              <div className={`p-3 rounded-lg ${preferences.theme === "dark" ? "bg-black/20" : "bg-white/40"} flex items-center gap-2`}>
                <Sparkles className="w-4 h-4 text-yellow-400" /> 
                <span className={`text-xs ${descClass}`}>
                  the ideal focus session is 25-45 minutes with short breaks in between
                </span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Button
                onClick={updatePreferences}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 py-6"
              >
                save these immaculate vibes
              </Button>
              
              <p className={`text-center mt-4 text-xs ${descClass} italic`}>
                "your future self will thank you for creating this peaceful study space"
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
