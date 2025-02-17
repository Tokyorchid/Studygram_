
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Clock, Target, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import StudySessionCard from "@/components/StudySessionCard";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StudySessions = () => {
  const navigate = useNavigate();

  const { data: sessions } = useQuery({
    queryKey: ['studySessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .order('start_time', { ascending: true })
        .gte('end_time', new Date().toISOString());

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      }
    };
    checkUser();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">📚 Study Sessions</h1>
            <p className="text-gray-400">"Life is a series of small beginnings" - Permission to Dance</p>
          </div>
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
            Create New Session
          </Button>
        </div>

        {/* Session Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions?.map((session) => (
            <StudySessionCard
              key={session.id}
              id={session.id}
              title={session.title}
              subject={session.subject}
              startTime={session.start_time}
              endTime={session.end_time}
              description={session.description}
              goals={["Study Goals", "Practice Problems", "Review Material"]}
            />
          ))}
        </div>

        {/* Quick Tips */}
        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
          <h2 className="text-xl font-semibold mb-4">💫 Study Tips</h2>
          <p className="text-gray-300 italic mb-2">
            "The morning will come again, because no darkness lasts forever" - Tomorrow
          </p>
          <ul className="list-disc list-inside text-gray-400 space-y-2">
            <li>Take regular breaks - your brain needs rest too!</li>
            <li>Stay hydrated and keep snacks nearby</li>
            <li>Use active recall techniques</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default StudySessions;
