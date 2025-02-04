import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BarChart, LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Mon', study: 4, focus: 3.5, mood: 85 },
  { name: 'Tue', study: 3, focus: 2.8, mood: 75 },
  { name: 'Wed', study: 5, focus: 4.2, mood: 90 },
  { name: 'Thu', study: 2.5, focus: 2, mood: 65 },
  { name: 'Fri', study: 4.8, focus: 4.5, mood: 95 },
  { name: 'Sat', study: 6, focus: 5.5, mood: 100 },
  { name: 'Sun', study: 3.2, focus: 3, mood: 80 },
];

const Progress = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">📈 Progress Check</h1>
            <p className="text-gray-400">"Life goes on" - and so does your growth!</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
            Download Report
          </Button>
        </div>

        {/* Weekly Overview */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
          <h2 className="text-xl font-semibold mb-6">Weekly Vibe Check</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="study" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  name="Study Hours"
                />
                <Line 
                  type="monotone" 
                  dataKey="focus" 
                  stroke="#EC4899" 
                  strokeWidth={2}
                  name="Focus Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-400 mt-4 text-center italic">
            "Every step forward is still progress" - Permission to Dance 🎵
          </p>
        </div>

        {/* Mood Tracker */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
          <h2 className="text-xl font-semibold mb-6">Mood Journey</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '0.5rem'
                  }}
                />
                <Bar 
                  dataKey="mood" 
                  fill="url(#colorGradient)" 
                  name="Mood Score"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-400 mt-4 text-center italic">
            "The best moment is yet to come" - keep pushing! 💫
          </p>
        </div>

        {/* Achievement Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
          >
            <h3 className="text-lg font-semibold mb-2">Longest Study Streak</h3>
            <p className="text-3xl font-bold text-purple-400">7 Days</p>
            <p className="text-sm text-gray-400 mt-2">
              "Make it right, make it shine" - you're doing amazing!
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
          >
            <h3 className="text-lg font-semibold mb-2">Average Focus Score</h3>
            <p className="text-3xl font-bold text-pink-400">4.2/5</p>
            <p className="text-sm text-gray-400 mt-2">
              "Focus on your dreams" - keep that concentration!
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
          >
            <h3 className="text-lg font-semibold mb-2">Total Study Hours</h3>
            <p className="text-3xl font-bold text-purple-400">28.5</p>
            <p className="text-sm text-gray-400 mt-2">
              "We are bulletproof" - nothing can stop you!
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Progress;