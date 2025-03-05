
import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { CallControlButtonProps } from "./types";

const CallControlButton = ({
  onClick,
  active = false,
  icon,
  activeIcon,
  activeClass = "",
  className = "",
}: CallControlButtonProps) => {
  const displayIcon = active && activeIcon ? activeIcon : icon;
  
  return (
    <motion.div 
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.1 }}
    >
      <Button 
        onClick={onClick} 
        variant="outline"
        className={`relative ${active ? activeClass : ""} ${className}`}
        size="icon"
      >
        {displayIcon}
      </Button>
    </motion.div>
  );
};

export default CallControlButton;
