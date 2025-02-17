
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import StatsCard from "@/components/StatsCard";
import ActivityItem from "@/components/ActivityItem";
import StudyGroupCard from "@/components/StudyGroupCard";
import Sidebar from "@/components/navigation/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import QuoteCard from "@/components/dashboard/QuoteCard";
import { BarChart3, BookOpen, TrendingUp } from "lucide-react";

const Welcome = () => {
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

  const fadeInUp = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar />

      <div className="flex-1 p-4 md:p-8 overflow-auto">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto space-y-8"
        >
          <DashboardHeader />
          <QuoteCard />

          <motion.div 
            {...fadeInUp}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <StatsCard 
              title="Study Streak" 
              value="7 days" 
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              color="from-purple-500 to-pink-500"
              note="no cap, you're on fire! 🔥"
            />
            <StatsCard 
              title="Focus Time" 
              value="4.2 hrs" 
              icon={<BarChart3 className="w-6 h-6 text-white" />}
              color="from-blue-500 to-purple-500"
              note="slay! that's the vibe 💫"
            />
            <StatsCard 
              title="Tasks Done" 
              value="12" 
              icon={<BookOpen className="w-6 h-6 text-white" />}
              color="from-pink-500 to-orange-500"
              note="you're eating this up! 🌟"
            />
          </motion.div>

          <motion.div 
            {...fadeInUp}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
          >
            <h2 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
              🔥 The Tea
            </h2>
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
          </motion.div>

          <motion.div 
            {...fadeInUp}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
          >
            <h2 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text mb-4">
              👥 Study Squads
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StudyGroupCard 
                name="Math Besties 🧮"
                members={5}
                active={true}
                note="Yet to Come - your grades after joining this squad"
              />
              <StudyGroupCard 
                name="Science Gang 🧪"
                members={3}
                active={false}
                note="Mic Drop - you after acing that test"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Welcome;
