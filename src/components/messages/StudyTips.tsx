
import React from "react";
import { Lightbulb } from "lucide-react";

const StudyTips = () => {
  const tips = [
    "Use the Pomodoro technique: 25 minutes of focused study, then a 5-minute break.",
    "Share your notes after each session for group feedback.",
    "Ask questions as soon as you encounter confusion - don't wait!",
    "Create a shared vocabulary list for technical terms.",
    "Quiz each other at the end of each study session.",
    "Explain concepts in your own words to solidify understanding."
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  return (
    <div className="p-3 bg-purple-900/20 rounded-lg mb-4 flex items-start">
      <Lightbulb className="text-yellow-400 w-5 h-5 mr-2 shrink-0 mt-0.5" />
      <div>
        <div className="font-medium text-yellow-300 text-sm mb-1">Study Tip</div>
        <div className="text-sm text-gray-300">{randomTip}</div>
      </div>
    </div>
  );
};

export default StudyTips;
