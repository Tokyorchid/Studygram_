
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { BookOpen, Sparkles, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadingTexts = [
    "wait a sec ✨",
    "manifesting your success rn 🌟",
    "loading good vibes only ~",
    "spilling the tea... ☕",
    "it's giving... loading 💅",
    "no thoughts, just loading 🧠",
    "main character moment loading...",
    "slaying the loading game 💁‍♀️"
  ];

  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          setTimeout(() => {
            setLoading(false);
            navigate("/welcome");
          }, 1000);
          return 100;
        }
        return oldProgress + 1;
      });
    }, 30);

    return () => {
      clearInterval(progressInterval);
      clearInterval(textInterval);
    };
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black transition-all duration-1000">
        <div className="w-full max-w-md mx-auto text-center space-y-8">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text animate-pulse">
            Studygram
          </h1>
          <div className="space-y-8">
            <Progress value={progress} className="h-2 w-full bg-gray-800" />
            <p className="text-4xl font-bold text-white mb-4">{progress}%</p>
            <p className="text-xl text-purple-400 font-medium animate-bounce">
              {loadingTexts[currentTextIndex]}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
