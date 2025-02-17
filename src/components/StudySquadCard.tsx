
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { motion } from "framer-motion";

interface StudySquadCardProps {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

const StudySquadCard = ({ id, name, description, active }: StudySquadCardProps) => {
  const { toast } = useToast();

  const { data: memberCount, refetch: refetchMembers } = useQuery({
    queryKey: ['squadMembers', id],
    queryFn: async () => {
      const { count } = await supabase
        .from('squad_members')
        .select('*', { count: 'exact', head: true })
        .eq('squad_id', id);
      return count || 0;
    },
  });

  const { data: isJoined, refetch: refetchJoined } = useQuery({
    queryKey: ['isSquadMember', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { count } = await supabase
        .from('squad_members')
        .select('*', { count: 'exact', head: true })
        .eq('squad_id', id)
        .eq('user_id', user.id);
      return count ? count > 0 : false;
    },
  });

  const handleJoin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to join a squad",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('squad_members')
        .insert({ squad_id: id, user_id: user.id });

      if (error) throw error;

      toast({
        title: "Joined squad! 🎉",
        description: "Welcome to the squad!",
      });

      refetchMembers();
      refetchJoined();
    } catch (error: any) {
      toast({
        title: "Error joining squad",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <Card className="bg-gray-900/50 backdrop-blur-xl border border-purple-500/20">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg text-white">{name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs ${
              active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'
            }`}>
              {active ? 'Active' : 'Inactive'}
            </span>
          </div>
          
          <p className="text-gray-400 text-sm">{description}</p>
          
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="w-4 h-4" />
            <span className="text-sm">{memberCount} members</span>
          </div>

          {!isJoined ? (
            <Button 
              onClick={handleJoin} 
              className="w-full bg-purple-500 hover:bg-purple-600"
            >
              Join Squad
            </Button>
          ) : (
            <Button 
              disabled 
              className="w-full bg-gray-700"
            >
              Already Joined
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StudySquadCard;
