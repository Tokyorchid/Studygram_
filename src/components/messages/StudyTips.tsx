
import React from "react";
import { Lightbulb, Sparkles, Flame, Zap } from "lucide-react";
import { motion } from "framer-motion";

const StudyTips = () => {
  const videoCallTips = [
    "Pop on some lo-fi beats and grind for 25 mins, then vibe check for 5. It's called Pomodoro and it slaps!",
    "Share your screen to review notes together - explaining concepts to others is the best way to learn!",
    "Use the chat feature to drop quick links and resources without interrupting the speaker.",
    "Take turns being the 'teacher' - each person gets 5 minutes to explain a topic from their notes.",
    "Set clear goals for the video session at the start - what do you want to accomplish together?",
    "If someone's struggling with a concept, use the annotation tools to highlight and explain.",
    "Record key parts of your study session to review later when you're prepping for the exam.",
    "Keep your camera on to stay accountable - it's harder to get distracted when others can see you!",
    "Use hand signals for 'I need to speak' or 'I understand' to avoid talking over each other.",
    "Schedule quick 2-minute stretch breaks every 30 minutes to keep everyone fresh and focused.",
  ];
  
  const randomTip = videoCallTips[Math.floor(Math.random() * videoCallTips.length)];
  
  const icons = [
    <Lightbulb className="text-yellow-400 w-5 h-5 mr-2 shrink-0 mt-0.5" />,
    <Sparkles className="text-blue-400 w-5 h-5 mr-2 shrink-0 mt-0.5" />,
    <Flame className="text-orange-400 w-5 h-5 mr-2 shrink-0 mt-0.5" />,
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
