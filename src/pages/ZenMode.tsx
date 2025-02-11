
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Timer, Volume2, VolumeX } from "lucide-react";

interface ZenPreferences {
  theme: string;
  music: string;
  timer: number;
}

const ZenMode = () => {
  const [preferences, setPreferences] = useState<ZenPreferences>({
    theme: "dark",
    music: "nature",
    timer: 25
  });
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getPreferences();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      toast({
        title: "time's up bestie! ⏰",
        description: "you ate that focus session fr fr!",
      });
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, toast]);

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
        setPreferences(data.zen_mode_preferences);
        setTimeLeft(data.zen_mode_preferences.timer * 60);
      }
    } catch (error: any) {
      toast({
        title: "couldn't load your vibe settings bestie 😭",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleTimer = () => {
    if (!isActive && timeLeft === 0) {
      setTimeLeft(preferences.timer * 60);
    }
    setIsActive(!isActive);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const bgClass = preferences.theme === "dark" 
    ? "bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" 
    : "bg-gradient-to-br from-purple-100 via-white to-purple-100";

  const textClass = preferences.theme === "dark" ? "text-white" : "text-gray-900";

  return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
      <div className="text-center space-y-8">
        <div className={`text-8xl font-bold font-mono ${textClass}`}>
          {formatTime(timeLeft)}
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={toggleTimer}
            className="px-8 py-6 bg-purple-500 hover:bg-purple-600 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            {isActive ? "pause bestie" : timeLeft === 0 ? "start slaying" : "continue slaying"}
          </Button>

          <Button
            onClick={() => setIsMuted(!isMuted)}
            variant="outline"
            className="px-4 py-6 border-purple-500/20 hover:bg-purple-500/10"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
        </div>

        <div className={`text-sm ${textClass} opacity-60`}>
          {isActive 
            ? "you're doing amazing sweetie! keep that focus going!" 
            : "ready to slay your study session? let's get this bread! 🍞"}
        </div>
      </div>
    </div>
  );
};

export default ZenMode;
