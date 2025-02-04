import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Home, MessageSquare, Settings, TrendingUp, User } from "lucide-react";
import { Link } from "react-router-dom";

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active?: boolean;
}

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  note: string;
}

interface ActivityItemProps {
  title: string;
  time: string;
  tag: string;
}

interface StudyGroupCardProps {
  name: string;
  members: number;
  active: boolean;
  note: string;
}

const Welcome = () => {
  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
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

        <nav className="space-y-4">
          <NavItem icon={<Home />} text="Home" to="/welcome" active />
          <NavItem icon={<TrendingUp />} text="Progress" to="/progress" />
          <NavItem icon={<BookOpen />} text="Study Sessions" to="/study-sessions" />
          <NavItem icon={<MessageSquare />} text="Messages" to="/messages" />
          <NavItem icon={<User />} text="Profile" to="/profile" />
          <NavItem icon={<Settings />} text="Settings" to="/settings" />
        </nav>
      </motion.div>

      {/* Main Content */}
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

const StatsCard = ({ title, value, icon, color, note }: StatsCardProps) => (
  <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h3 className="text-gray-400 mb-1">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
    <p className="text-sm text-gray-400 mt-2 italic">{note}</p>
  </div>
);

const ActivityItem = ({ title, time, tag }: ActivityItemProps) => (
  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-500/10 transition-colors">
    <div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-gray-400">{time}</p>
    </div>
    <span className="px-3 py-1 rounded-full text-sm bg-purple-500/20 text-purple-400">
      {tag}
    </span>
  </div>
);

const StudyGroupCard = ({ name, members, active, note }: StudyGroupCardProps) => (
  <div className="bg-gray-800/50 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div>
        <h4 className="font-medium">{name}</h4>
        <p className="text-sm text-gray-400">{members} members</p>
      </div>
      <div className={`w-3 h-3 rounded-full ${active ? "bg-green-500" : "bg-gray-500"}`} />
    </div>
    <p className="text-xs text-gray-400 italic mt-2">{note}</p>
  </div>
);

export default Welcome;