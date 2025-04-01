
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

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
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-xl font-bold text-white">S</span>
          </div>
          <div className="ml-3">
            <div className="text-2xl font-serif tracking-wider">
              <span className="text-white">STUDY</span>
              <span className="text-purple-500">/</span>
              <span className="text-white">GRAM</span>
            </div>
            <span className="text-xs text-purple-300 italic hidden md:block">Even in the longest winter, your dreams won't freeze</span>
          </div>
        </div>
        
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
