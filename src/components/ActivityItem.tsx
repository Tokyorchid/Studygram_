import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ActivityItemProps {
  title: string;
  time: string;
  tag: string;
}

const ActivityItem = ({ title, time, tag }: ActivityItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-purple-500/10 transition-colors">
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <span className="text-sm text-gray-400">{time}</span>
      </div>
      <Badge variant="secondary" className={cn(
        "bg-purple-500/20 text-purple-300 hover:bg-purple-500/30",
      )}>
        {tag}
      </Badge>
    </div>
  );
};

export default ActivityItem;