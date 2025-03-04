
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

interface MobileHeaderProps {
  onMenuToggle: () => void;
}

const MobileHeader = ({ onMenuToggle }: MobileHeaderProps) => {
  return (
    <motion.header 
      className="mobile-header"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-sm font-bold text-white">S</span>
        </div>
        <div className="ml-2">
          <span className="text-lg font-bold text-white hidden md:block">Studygram</span>
          <span className="text-xs text-purple-300 hidden md:block italic">Even in the longest winter, your dreams won't freeze</span>
        </div>
      </div>
      
      <button 
        className="menu-button"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>
    </motion.header>
  );
};

export default MobileHeader;
