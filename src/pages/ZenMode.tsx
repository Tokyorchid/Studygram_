
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Timer, Volume2, VolumeX, Heart, Moon, Sun, Sparkles } from "lucide-react";
import { Json } from "@/integrations/supabase/types";
import { playBackgroundMusic, stopAllBackgroundMusic, playAlarm } from "@/utils/audioUtils";
import { motion, AnimatePresence } from "framer-motion";

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
  const [showMessage, setShowMessage] = useState(true);
  const { toast } = useToast();

  // Fetch user preferences on component mount
  useEffect(() => {
    getPreferences();
  }, []);
  
  // Apply theme based on preferences
  useEffect(() => {
    document.documentElement.classList.toggle('dark', preferences.theme === 'dark');
    document.documentElement.classList.toggle('light', preferences.theme === 'light');
  }, [preferences.theme]);

  // Handle background music changes
  useEffect(() => {
    if (!isMuted) {
      playBackgroundMusic(preferences.music);
    } else {
      stopAllBackgroundMusic();
    }

    return () => {
      stopAllBackgroundMusic();
    };
  }, [preferences.music, isMuted]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      playAlarm();
      toast({
        title: "time's up bestie! ⏰",
        description: "you ate that focus session fr fr!",
      });
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, toast]);

  // Hide motivational message after 5 seconds
  useEffect(() => {
    if (showMessage) {
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showMessage]);

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
        setTimeLeft(zenPrefs.timer * 60);
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
    
    // Show encouraging message when starting timer
    if (!isActive) {
      setShowMessage(true);
    }
  };
  
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (newMutedState) {
      stopAllBackgroundMusic();
      toast({
        title: "sounds muted bestie 🤫",
        description: "it's giving library vibes now",
      });
    } else {
      playBackgroundMusic(preferences.music);
      toast({
        title: "sounds back on! 🎵",
        description: "the vibes have been restored",
      });
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(preferences.timer * 60);
    toast({
      title: "timer reset ⏱️",
      description: "ready for a fresh start!",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get random motivational message
  const getMotivationalMessage = () => {
    const messages = [
      "you've got this! one step at a time ✨",
      "progress over perfection, always 💖",
      "breathe, focus, achieve 🌟",
      "every minute counts, make it shine! ✨",
      "your future self is proud of you already 💫",
      "even in the longest winter, your dreams won't freeze ❄️",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const bgClass = preferences.theme === "dark" 
    ? "bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900" 
    : "bg-gradient-to-br from-purple-100 via-white to-purple-100";

  const textClass = preferences.theme === "dark" ? "text-white" : "text-gray-900";
  const cardClass = preferences.theme === "dark" 
    ? "bg-white/5 backdrop-blur-xl border border-purple-500/20" 
    : "bg-white/70 backdrop-blur-xl border border-purple-200";

  return (
    <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4 transition-colors duration-300`}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`${cardClass} rounded-xl shadow-xl p-8 max-w-md w-full text-center space-y-8`}
      >
        <div className="flex justify-end">
          {preferences.theme === "dark" ? (
            <Moon className={`w-6 h-6 ${textClass} opacity-50`} />
          ) : (
            <Sun className={`w-6 h-6 ${textClass} opacity-50`} />
          )}
        </div>
        
        <AnimatePresence>
          {showMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`${preferences.theme === "dark" ? "bg-white/10" : "bg-purple-100/70"} px-4 py-3 rounded-lg`}
            >
              <p className={`${textClass} text-sm`}>{getMotivationalMessage()}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`text-8xl font-bold font-mono ${textClass} transition-colors duration-300 flex justify-center`}>
          <motion.span
            key={timeLeft}
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            {formatTime(timeLeft)}
          </motion.span>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={toggleTimer}
            className={`px-8 py-6 ${isActive 
              ? "bg-pink-500 hover:bg-pink-600" 
              : "bg-purple-500 hover:bg-purple-600"} 
              transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}
          >
            {isActive ? "take a breath" : timeLeft === 0 ? "start slaying" : "continue slaying"}
          </Button>

          <Button
            onClick={toggleMute}
            variant="outline"
            className="px-4 py-6 border-purple-500/20 hover:bg-purple-500/10"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </Button>
          
          {timeLeft > 0 && !isActive && (
            <Button
              onClick={resetTimer}
              variant="outline"
              className="px-4 py-6 border-purple-500/20 hover:bg-purple-500/10"
            >
              <Timer className="w-6 h-6" />
            </Button>
          )}
        </div>

        <div className={`flex items-center justify-center gap-2 ${textClass} opacity-60`}>
          <Heart className="w-4 h-4 text-pink-400" />
          <p className="text-sm">
            {isActive 
              ? "each moment of focus brings you closer to your dreams" 
              : "ready to create some magic today? let's go! ✨"}
          </p>
        </div>
        
        <div className="text-xs opacity-40 italic">
          <p className={textClass}>"even in the longest winter, your dreams won't freeze"</p>
        </div>
      </motion.div>
    </div>
  );
};

export default ZenMode;
