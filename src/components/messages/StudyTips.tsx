
import React from "react";
import { Lightbulb, Sparkles, Fire, Zap } from "lucide-react";
import { motion } from "framer-motion";

const StudyTips = () => {
  const tips = [
    "Pop on some lo-fi beats and grind for 25 mins, then vibe check for 5. It's called Pomodoro and it slaps!",
    "Drop your notes in the group chat after each sesh. The squad's feedback hits different frfr.",
    "Stuck on something? No cap, just ask! The group chat's for actual help, not just memes.",
    "Build a shared vocab list with all the main character energy terms. #BigBrainTime",
    "Quizzing each other is lowkey the best way to see if you're actually getting it or just zoning.",
    "Try explaining concepts like you're making a TikTok. If you can't make it short & fire, you don't get it yet.",
    "Study aesthetics matter! Set up your space to be Instagram-worthy and watch your motivation skyrocket.",
    "Record voice notes explaining tricky concepts - play them back while you're touching grass later.",
    "Speedrun your flashcards and try to beat your high score each day. Gamify that grind!",
    "Create a shared playlist where everyone adds songs that help them focus. Real ones only!",
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  const icons = [
    <Lightbulb className="text-yellow-400 w-5 h-5 mr-2 shrink-0 mt-0.5" />,
    <Sparkles className="text-blue-400 w-5 h-5 mr-2 shrink-0 mt-0.5" />,
    <Fire className="text-orange-400 w-5 h-5 mr-2 shrink-0 mt-0.5" />,
    <Zap className="text-pink-400 w-5 h-5 mr-2 shrink-0 mt-0.5" />
  ];
  
  const randomIcon = icons[Math.floor(Math.random() * icons.length)];
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-3 bg-gradient-to-r from-purple-900/30 to-pink-900/20 rounded-lg mb-4 flex items-start backdrop-blur-sm border border-purple-500/10"
    >
      {randomIcon}
      <div>
        <div className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-300 text-sm mb-1">Study Hack</div>
        <div className="text-sm text-gray-300">{randomTip}</div>
      </div>
    </motion.div>
  );
};

export default StudyTips;
