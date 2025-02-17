
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Clock, Target, Users } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

interface StudySessionCardProps {
  id: string;
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  description?: string;
  goals?: string[];
}

const StudySessionCard = ({ 
  id, 
  title, 
  subject, 
  startTime, 
  endTime, 
  description, 
  goals 
}: StudySessionCardProps) => {
  const { toast } = useToast();

  const { data: participantCount, refetch: refetchParticipants } = useQuery({
    queryKey: ['sessionParticipants', id],
    queryFn: async () => {
      const { count } = await supabase
        .from('session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', id);
      return count || 0;
    },
  });

  const { data: isJoined, refetch: refetchJoined } = useQuery({
    queryKey: ['isSessionParticipant', id],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { count } = await supabase
        .from('session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', id)
        .eq('user_id', user.id);
      return count ? count > 0 : false;
    },
  });

  const handleJoinSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to join a session",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('session_participants')
        .insert({ session_id: id, user_id: user.id });

      if (error) throw error;

      toast({
        title: "Joined session! 🎉",
        description: "You've successfully joined the study session",
      });

      refetchParticipants();
      refetchJoined();
    } catch (error: any) {
      toast({
        title: "Error joining session",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg text-white">{title}</h3>
          <p className="text-gray-400">{subject}</p>
        </div>
        {!isJoined ? (
          <Button 
            onClick={handleJoinSession} 
            className="bg-purple-500 hover:bg-purple-600"
          >
            Join
          </Button>
        ) : (
          <Button 
            disabled 
            className="bg-gray-700"
          >
            Joined
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{format(new Date(startTime), 'PPp')} - {format(new Date(endTime), 'p')}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-400">
          <Users className="w-4 h-4" />
          <span>{participantCount} participants</span>
        </div>

        {description && (
          <p className="text-gray-400 text-sm">{description}</p>
        )}

        {goals && goals.length > 0 && (
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
        )}
      </div>
    </motion.div>
  );
};

export default StudySessionCard;
