
import React from "react";
import { Lightbulb } from "lucide-react";

const StudyTips = () => {
  const tips = [
    "Use the Pomodoro technique: 25 minutes of grinding, then a 5-minute vibe check.",
    "Share your notes after each session for the squad's feedback.",
    "If you're confused, just ask - the group chat got you!",
    "Create a shared vocab list for all the big brain terms.",
    "Quiz each other at the end of each study sesh - keep it 100.",
    "Explain concepts in your own words to make sure you're not just memorizing."
  ];
  
  const randomTip = tips[Math.floor(Math.random() * tips.length)];
  
  return (
    <div className="p-3 bg-purple-900/20 rounded-lg mb-4 flex items-start">
      <Lightbulb className="text-yellow-400 w-5 h-5 mr-2 shrink-0 mt-0.5" />
      <div>
        <div className="font-medium text-yellow-300 text-sm mb-1">Study Hack</div>
        <div className="text-sm text-gray-300">{randomTip}</div>
      </div>
    </div>
  );
};

export default StudyTips;
