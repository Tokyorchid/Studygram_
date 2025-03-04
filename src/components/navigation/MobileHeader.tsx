
import { NavLink } from "react-router-dom";
import { Home, BookOpen, PenSquare, User, Menu } from "lucide-react";
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
        <span className="text-lg font-bold ml-2 text-white hidden md:block">Studygram</span>
      </div>
      
      <nav className="mobile-nav">
        <NavLink 
          to="/welcome" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Home className="w-5 h-5 mb-1" />
          <span>Home</span>
        </NavLink>
        
        <NavLink 
          to="/posts" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <PenSquare className="w-5 h-5 mb-1" />
          <span>Posts</span>
        </NavLink>
        
        <NavLink 
          to="/study-sessions" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <BookOpen className="w-5 h-5 mb-1" />
          <span>Study</span>
        </NavLink>
        
        <NavLink 
          to="/profile" 
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <User className="w-5 h-5 mb-1" />
          <span>Profile</span>
        </NavLink>
      </nav>
      
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
