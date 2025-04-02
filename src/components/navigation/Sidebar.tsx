import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, BookOpen, Home, MessageSquare, Settings, 
  TrendingUp, User, Sun, Moon, LogOut, PenSquare, X 
} from "lucide-react";
import NavItem from "./NavItem";
import { useToast } from "@/hooks/use-toast";
import { supabase, getProfile, updateProfile } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [theme, setTheme] = useState("light");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getInitialTheme = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const profile = await getProfile(user.id);
          
          if (profile?.theme) {
            setTheme(profile.theme);
          }
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    };
    
    getInitialTheme();
  }, []);

  const handleThemeChange = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await updateProfile(user.id, { theme: newTheme });

      if (error) throw error;

      setTheme(newTheme);
      toast({
        title: `Theme updated! ✨`,
        description: `Switched to ${newTheme} mode`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/login");
    }
  };

  const sidebarStyle = theme === 'dark' 
    ? "bg-gray-900 text-white" 
    : "bg-gray-100 text-gray-800";

  const sidebarVariants = {
    open: { 
      x: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    closed: { 
      x: "-100%", 
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      } 
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />
          
          <motion.div 
            className={`fixed top-0 left-0 h-full z-50 w-64 ${sidebarStyle} border-r border-purple-500/20 overflow-y-auto shadow-2xl`}
            variants={sidebarVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-xl font-bold text-white">S</span>
                  </div>
                  <div className="text-xl font-serif tracking-wider">
                    <span className="text-gray-100">STUDY</span>
                    <span className="text-purple-500">/</span>
                    <span className="text-gray-100">GRAM</span>
                  </div>
                </div>
                <button 
                  className="text-gray-400 hover:text-purple-400 transition-colors p-2 rounded-full hover:bg-purple-500/10"
                  onClick={onClose}
                  aria-label="Close sidebar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-4 flex-1 mb-8">
                <NavItem icon={<Home />} text="Home" to="/welcome" />
                <NavItem icon={<TrendingUp />} text="Progress" to="/progress" />
                <NavItem icon={<PenSquare />} text="Posts" to="/posts" />
                <NavItem icon={<BookOpen />} text="Study Sessions" to="/study-sessions" />
                <NavItem icon={<MessageSquare />} text="Messages" to="/messages" />
                <NavItem icon={<User />} text="Profile" to="/profile" />
                <NavItem icon={<Settings />} text="Settings" to="/settings" />
              </nav>

              <div className="space-y-4 pt-4 border-t border-purple-500/20">
                <button
                  onClick={handleThemeChange}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {theme === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span>Toggle Theme</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
