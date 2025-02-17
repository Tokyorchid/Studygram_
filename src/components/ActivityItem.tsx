
import { motion } from "framer-motion";

interface ActivityItemProps {
  title: string;
  time: string;
  tag: string;
}

const ActivityItem = ({ title, time, tag }: ActivityItemProps) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="bg-purple-500/10 rounded-lg p-4 hover:bg-purple-500/20 transition-all duration-300 cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex-1">
          <h3 className="text-white font-medium">{title}</h3>
          <p className="text-sm text-gray-400">{time}</p>
        </div>
        <span className="px-3 py-1 bg-purple-500/20 rounded-full text-purple-300 text-sm">
          {tag}
        </span>
      </div>
    </motion.div>
  );
};

export default ActivityItem;
