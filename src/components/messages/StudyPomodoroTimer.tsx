
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { playAlarm } from "@/utils/audioUtils";

interface StudyPomodoroTimerProps {
  initialMinutes?: number;
  onComplete?: () => void;
}

const StudyPomodoroTimer = ({ 
  initialMinutes = 25, 
  onComplete 
}: StudyPomodoroTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      playAlarm();
      if (isBreak) {
        // Break is over, reset to study time
        setTimeLeft(initialMinutes * 60);
        setIsBreak(false);
      } else {
        // Study time is over, start break
        setTimeLeft(5 * 60); // 5 minute break
        setIsBreak(true);
      }
      setIsActive(false);
      if (onComplete) onComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, initialMinutes, isBreak, onComplete]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setTimeLeft(initialMinutes * 60);
  };

  const formatTime = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 rounded-lg text-center">
      <h3 className="text-lg font-semibold mb-2 gradient-text">
        {isBreak ? "Break Time" : "Study Timer"}
      </h3>
      
      <div className="text-4xl font-bold mb-4 text-white">
        {formatTime()}
      </div>
      
      <div className="flex justify-center gap-2">
        <Button 
          onClick={toggleTimer}
          className="bg-gradient-to-r from-purple-500 to-pink-500"
        >
          {isActive ? <Pause /> : <Play />}
        </Button>
        <Button onClick={resetTimer} variant="outline">
          <RotateCcw />
        </Button>
      </div>
    </div>
  );
};

export default StudyPomodoroTimer;
