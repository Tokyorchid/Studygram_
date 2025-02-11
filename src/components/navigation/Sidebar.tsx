
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Home, MessageSquare, Settings, TrendingUp, User, Sun, Moon, LogOut, PenSquare } from "lucide-react";
import NavItem from "./NavItem";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Sidebar = () => {
  const [theme, setTheme] = useState("light");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleThemeChange = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({ theme: newTheme })
        .eq("id", user.id);

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

  return (
    <motion.div 
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-20 md:w-64 bg-gray-900/50 backdrop-blur-xl border-r border-purple-500/20 p-4 hidden md:flex flex-col"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-xl font-bold">S</span>
        </div>
        <h1 className="text-xl font-bold hidden md:block">Studygram</h1>
      </div>

      <nav className="space-y-4 flex-1">
        <NavItem icon={<Home />} text="Home" to="/welcome" active />
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
          <span className="hidden md:block">Toggle Theme</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-purple-500/10 text-gray-400 hover:text-purple-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
