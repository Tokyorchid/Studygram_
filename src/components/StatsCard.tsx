
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  note: string;
}

const StatsCard = ({ title, value, icon, color, note }: StatsCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20 transform hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm sm:text-base text-gray-400 font-medium">
              {title}
            </span>
            <div className={cn("p-2 rounded-lg bg-gradient-to-r", color)}>
              {icon}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-bold text-white">{value}</h3>
            <p className="text-sm text-gray-400 italic">{note}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsCard;
