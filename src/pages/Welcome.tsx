import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Home, MessageSquare, Settings, TrendingUp, User, Sun, Moon, LogOut, PenSquare } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active?: boolean;
}

const Welcome = () => {
  const [theme, setTheme] = useState("light");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      }
    };
    checkUser();
  }, [navigate]);

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
    <div className="min-h-screen bg-black text-white flex">
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

      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">✨ Yo, what's good!</h1>
              <p className="text-gray-400">time to level up your study game fr fr 💪</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
              Start Grinding
            </Button>
          </div>

          {/* Inspiration Quote */}
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-xl border border-purple-500/20">
            <p className="text-lg italic text-gray-300">
              "Even when winter comes, don't fear the cold" - Spring Day, BTS
            </p>
            <p className="text-sm text-gray-400 mt-2">your daily dose of motivation ✨</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard 
              title="Study Streak" 
              value="7 days" 
              icon={<TrendingUp className="w-6 h-6" />}
              color="from-purple-500 to-pink-500"
              note="no cap, you're on fire! 🔥"
            />
            <StatsCard 
              title="Focus Time" 
              value="4.2 hrs" 
              icon={<BarChart3 className="w-6 h-6" />}
              color="from-blue-500 to-purple-500"
              note="slay! that's the vibe 💫"
            />
            <StatsCard 
              title="Tasks Done" 
              value="12" 
              icon={<BookOpen className="w-6 h-6" />}
              color="from-pink-500 to-orange-500"
              note="you're eating this up! 🌟"
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-semibold mb-4">🔥 The Tea</h2>
            <div className="space-y-4">
              <ActivityItem 
                title="Finished Math Chapter 5"
                time="2 hrs ago"
                tag="Math Queen"
              />
              <ActivityItem 
                title="Created Study Squad"
                time="5 hrs ago"
                tag="Squad Goals"
              />
              <ActivityItem 
                title="Aced That Quiz"
                time="Yesterday"
                tag="Big Brain Energy"
              />
            </div>
          </div>

          {/* Study Groups */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-semibold mb-4">👥 Study Squads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StudyGroupCard 
                name="Math Besties 🧮"
                members={5}
                active={true}
                note={'Yet to Come - your grades after joining this squad'}
              />
              <StudyGroupCard 
                name="Science Gang 🧪"
                members={3}
                active={false}
                note={'Mic Drop - you after acing that test'}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, text, to, active = false }: NavItemProps) => (
  <Link
    to={to}
    className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
      active 
        ? "bg-purple-500/20 text-purple-400" 
        : "hover:bg-purple-500/10 text-gray-400 hover:text-purple-400"
    }`}
  >
    {icon}
    <span className="hidden md:block">{text}</span>
  </Link>
);

export default Welcome;
