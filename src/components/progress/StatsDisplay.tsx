
import { motion } from "framer-motion";
import { Users, Calendar } from "lucide-react";

const StatsDisplay = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
      >
        <div className="flex items-center gap-4">
          <div className="bg-green-500/20 p-3 rounded-full">
            <Users className="h-6 w-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Study Buddies</h3>
            <p className="text-3xl font-bold text-green-400">12</p>
            <p className="text-sm text-gray-400">Connected & Growing</p>
          </div>
        </div>
      </motion.div>
      
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
      >
        <div className="flex items-center gap-4">
          <div className="bg-yellow-500/20 p-3 rounded-full">
            <Calendar className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Study Sessions</h3>
            <p className="text-3xl font-bold text-yellow-400">42</p>
            <p className="text-sm text-gray-400">Last 30 Days</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StatsDisplay;
