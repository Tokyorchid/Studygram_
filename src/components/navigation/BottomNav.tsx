
import { NavLink } from "react-router-dom";
import { Home, BookOpen, PenSquare, User } from "lucide-react";
import { motion } from "framer-motion";

const BottomNav = () => {
  return (
    <motion.nav 
      className="bottom-nav"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
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
    </motion.nav>
  );
};

export default BottomNav;
