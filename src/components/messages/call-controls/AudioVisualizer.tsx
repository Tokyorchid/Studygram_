
import React from "react";
import { motion } from "framer-motion";

interface AudioVisualizerProps {
  show: boolean;
  audioLevel: number;
}

const AudioVisualizer = ({ show, audioLevel }: AudioVisualizerProps) => {
  if (!show) return null;

  const bars = 5;
  
  return (
    <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 flex items-end justify-center gap-1 bg-gray-900/70 backdrop-blur-md p-2 rounded-lg">
      {Array(bars).fill(0).map((_, i) => {
        const height = Math.max(4, Math.floor(audioLevel * 20 * (0.5 + Math.random() * 0.5)));
        return (
          <motion.div
            key={i}
            className="w-1 bg-green-400"
            initial={{ height: 4 }}
            animate={{ height }}
            transition={{ duration: 0.1 }}
          />
        );
      })}
    </div>
  );
};

export default AudioVisualizer;
