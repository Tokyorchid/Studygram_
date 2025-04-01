
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import LogoComponent from "./LogoComponent";

interface MobileHeaderProps {
  onMenuToggle: () => void;
}

const MobileHeader = ({ onMenuToggle }: MobileHeaderProps) => {
  return (
    <motion.header 
      className="mobile-header fixed top-0 w-full bg-black/50 backdrop-blur-lg border-b border-purple-500/20 z-40 p-4"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto flex items-center justify-between">
        <LogoComponent />
        
        <button 
          className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center hover:bg-purple-800/30 transition-colors"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      </div>
    </motion.header>
  );
};

export default MobileHeader;
