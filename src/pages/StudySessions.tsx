import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Clock, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface SessionCardProps {
  title: string;
  subject: string;
  time: string;
  participants: number;
  goals: string[];
}

const StudySessions = () => {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">📚 Study Sessions</h1>
            <p className="text-gray-400">"Life is a series of small beginnings" - Permission to Dance</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
            Create New Session
          </Button>
        </div>

        {/* Session Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SessionCard
            title="Calculus Crew"
            subject="Mathematics"
            time="Today, 3:00 PM"
            participants={4}
            goals={["Limits", "Derivatives", "Integration"]}
          />
          <SessionCard
            title="Physics Focus"
            subject="Science"
            time="Tomorrow, 2:00 PM"
            participants={3}
            goals={["Mechanics", "Thermodynamics"]}
          />
          <SessionCard
            title="Literature Circle"
            subject="English"
            time="Friday, 4:00 PM"
            participants={5}
            goals={["Poetry Analysis", "Essay Writing"]}
          />
        </div>

        {/* Quick Tips */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
          <h2 className="text-xl font-semibold mb-4">💫 Study Tips</h2>
          <p className="text-gray-300 italic mb-2">
            "The morning will come again, because no darkness lasts forever" - Tomorrow
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>Take regular breaks - your brain needs rest too!</li>
            <li>Stay hydrated and keep snacks nearby</li>
            <li>Use active recall techniques</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

const SessionCard = ({ title, subject, time, participants, goals }: SessionCardProps) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-400">{subject}</p>
      </div>
      <Button variant="outline" size="sm" className="hover:bg-purple-500/20">
        Join
      </Button>
    </div>
    
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-400">
        <Clock className="w-4 h-4" />
        <span>{time}</span>
      </div>
      
      <div className="flex items-center gap-2 text-gray-400">
        <Users className="w-4 h-4" />
        <span>{participants} participants</span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-gray-400">
          <Target className="w-4 h-4" />
          <span>Goals:</span>
        </div>
        <ul className="list-disc list-inside text-sm text-gray-400 pl-2">
          {goals.map((goal) => (
            <li key={goal}>{goal}</li>
          ))}
        </ul>
      </div>
    </div>
  </motion.div>
);

export default StudySessions;