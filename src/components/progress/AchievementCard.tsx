
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface AchievementCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBgColor: string;
  valueColor: string;
  quote: string;
}

const AchievementCard = ({ 
  title, 
  value, 
  icon, 
  iconBgColor, 
  valueColor, 
  quote 
}: AchievementCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
    >
      <div className="flex items-center gap-4">
        <div className={`${iconBgColor} p-3 rounded-full`}>
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-4">
        {quote}
      </p>
    </motion.div>
  );
};

export default AchievementCard;
