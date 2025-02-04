import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart3, BookOpen, Home, MessageSquare, Settings, TrendingUp, User } from "lucide-react";
import { Link } from "react-router-dom";

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
          <NavItem icon={<Home />} text="Home" active />
          <NavItem icon={<TrendingUp />} text="Progress" />
          <NavItem icon={<BookOpen />} text="Study Sessions" />
          <NavItem icon={<MessageSquare />} text="Messages" />
          <NavItem icon={<User />} text="Profile" />
          <NavItem icon={<Settings />} text="Settings" />
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
              <h1 className="text-3xl font-bold mb-2">✨ Hey bestie!</h1>
              <p className="text-gray-400">ready to crush those study goals? 💪</p>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
              Start Session
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard 
              title="Study Streak" 
              value="7 days" 
              icon={<TrendingUp className="w-6 h-6" />}
              color="from-purple-500 to-pink-500"
            />
            <StatsCard 
              title="Focus Time" 
              value="4.2 hrs" 
              icon={<BarChart3 className="w-6 h-6" />}
              color="from-blue-500 to-purple-500"
            />
            <StatsCard 
              title="Tasks Done" 
              value="12" 
              icon={<BookOpen className="w-6 h-6" />}
              color="from-pink-500 to-orange-500"
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-semibold mb-4">🔥 Recent Activity</h2>
            <div className="space-y-4">
              <ActivityItem 
                title="Finished Math Chapter 5"
                time="2 hours ago"
                tag="Mathematics"
              />
              <ActivityItem 
                title="Created Study Group"
                time="5 hours ago"
                tag="Collaboration"
              />
              <ActivityItem 
                title="Completed Quiz"
                time="Yesterday"
                tag="Assessment"
              />
            </div>
          </div>

          {/* Study Groups */}
          <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
            <h2 className="text-xl font-semibold mb-4">👥 Study Squads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StudyGroupCard 
                name="Math Wizards 🧙‍♂️"
                members={5}
                active={true}
              />
              <StudyGroupCard 
                name="Science Gang 🔬"
                members={3}
                active={false}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, text, active = false }) => (
  <Link
    to="#"
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

const StatsCard = ({ title, value, icon, color }) => (
  <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <h3 className="text-gray-400 mb-1">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

const ActivityItem = ({ title, time, tag }) => (
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

const StudyGroupCard = ({ name, members, active }) => (
  <div className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
    <div>
      <h4 className="font-medium">{name}</h4>
      <p className="text-sm text-gray-400">{members} members</p>
    </div>
    <div className={`w-3 h-3 rounded-full ${active ? "bg-green-500" : "bg-gray-500"}`} />
  </div>
);

export default Welcome;