
import React from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";

interface EnhancedModeSettingsProps {
  show: boolean;
}

const EnhancedModeSettings = ({ show }: EnhancedModeSettingsProps) => {
  if (!show) return null;
  
  return (
    <motion.div 
      className="mt-3 p-3 bg-gray-800/80 backdrop-blur-md rounded-lg text-sm"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span>Noise cancellation</span>
        <Switch defaultChecked />
      </div>
      <div className="flex items-center justify-between mb-2">
        <span>Voice enhancement</span>
        <Switch defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <span>Auto gain control</span>
        <Switch defaultChecked />
      </div>
    </motion.div>
  );
};

export default EnhancedModeSettings;
