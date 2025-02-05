import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface StudyGroupCardProps {
  name: string;
  members: number;
  active: boolean;
  note: string;
}

const StudyGroupCard = ({ name, members, active, note }: StudyGroupCardProps) => {
  return (
    <Card className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">{name}</h3>
          <Badge variant={active ? "default" : "secondary"} className={active ? "bg-green-500/20 text-green-300" : "bg-gray-500/20 text-gray-300"}>
            {active ? "Active" : "Inactive"}
          </Badge>
        </div>
        <div className="space-y-4">
          <div className="flex items-center text-gray-400">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">{members} members</span>
          </div>
          <p className="text-sm text-gray-400 italic">{note}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StudyGroupCard;