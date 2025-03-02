
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Clock, Target, Users } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface StudySessionCardProps {
  id: string;
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  description?: string;
  goals?: string[];
  sessionType?: string;
}

const StudySessionCard = ({ 
  id, 
  title, 
  subject, 
  startTime, 
  endTime, 
  description, 
  goals,
  sessionType = "instant_pod"
}: StudySessionCardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEntering, setIsEntering] = useState(false);

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
      setIsEntering(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to join a session",
          variant: "destructive",
        });
        setIsEntering(false);
        return;
      }

      const { error } = await supabase
        .from('session_participants')
        .insert({ session_id: id, user_id: user.id });

      if (error) throw error;

      // After successfully joining
      toast({
        title: "Joined session! 🎉",
        description: "You've successfully joined the study session",
      });

      // Show another toast with instructions
      setTimeout(() => {
        toast({
          title: "Session activated",
          description: "Click 'Enter Session' to begin studying",
        });
      }, 1000);

      refetchParticipants();
      refetchJoined();
    } catch (error: any) {
      toast({
        title: "Error joining session",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsEntering(false);
    }
  };

  const handleEnterSession = () => {
    navigate(`/session/${id}`);
  };

  const isSessionActive = () => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    return now >= start && now <= end;
  };

  // Function to get session type badge color
  const getSessionTypeBadge = () => {
    const types: Record<string, { color: string, label: string }> = {
      instant_pod: { color: 'bg-green-500/20 text-green-300', label: 'Instant Pod' },
      silent_costudy: { color: 'bg-blue-500/20 text-blue-300', label: 'Silent Co-Study' },
      task_based: { color: 'bg-orange-500/20 text-orange-300', label: 'Task-Based' },
      help_session: { color: 'bg-yellow-500/20 text-yellow-300', label: 'Help Session' },
      vibe_based: { color: 'bg-purple-500/20 text-purple-300', label: 'Vibe Session' }
    };
    
    return types[sessionType] || types.instant_pod;
  };

  const typeBadge = getSessionTypeBadge();

  return (
    <motion.div
      id={"session-" + id}
      whileHover={{ scale: 1.02 }}
      className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg text-white">{title}</h3>
            <span className={`px-2 py-1 rounded-full text-xs ${typeBadge.color}`}>
              {typeBadge.label}
            </span>
          </div>
          <p className="text-gray-400">{subject}</p>
        </div>
        {!isJoined ? (
          <Button 
            onClick={handleJoinSession} 
            disabled={isEntering}
            className="bg-purple-500 hover:bg-purple-600"
          >
            {isEntering ? "Joining..." : "Join"}
          </Button>
        ) : (
          <Button 
            onClick={handleEnterSession} 
            className="bg-green-500 hover:bg-green-600 animate-pulse"
          >
            Enter Session
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{format(new Date(startTime), 'PPp')} - {format(new Date(endTime), 'p')}</span>
          {isSessionActive() && (
            <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded-full ml-2">
              Active Now
            </span>
          )}
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
