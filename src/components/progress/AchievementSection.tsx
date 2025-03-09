
import React from "react";
import AchievementCard from "./AchievementCard";
import { Award, Brain, Timer } from "lucide-react";

const AchievementSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <AchievementCard
        title="Longest Study Streak"
        value="7 Days"
        icon={<Award className="h-6 w-6 text-purple-400" />}
        iconBgColor="bg-purple-500/20"
        valueColor="text-purple-400"
        quote="\"Make it right, make it shine\" - you're doing amazing!"
      />
      
      <AchievementCard
        title="Average Focus Score"
        value="4.2/5"
        icon={<Brain className="h-6 w-6 text-pink-400" />}
        iconBgColor="bg-pink-500/20"
        valueColor="text-pink-400"
        quote="\"Focus on your dreams\" - keep that concentration!"
      />
      
      <AchievementCard
        title="Total Study Hours"
        value="28.5"
        icon={<Timer className="h-6 w-6 text-blue-400" />}
        iconBgColor="bg-blue-500/20"
        valueColor="text-blue-400"
        quote="\"We are bulletproof\" - nothing can stop you!"
      />
    </div>
  );
};

export default AchievementSection;
