import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  note: string;
}

const StatsCard = ({ title, value, icon, color, note }: StatsCardProps) => {
  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-lg bg-gradient-to-r", color)}>
            {icon}
          </div>
          <span className="text-sm text-gray-400">{title}</span>
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{value}</h3>
          <p className="text-sm text-gray-400">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;