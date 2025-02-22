
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookOpen, Clock, Target, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import StudySessionCard from "@/components/StudySessionCard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const StudySessions = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    subject: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const { data: sessions, refetch: refetchSessions } = useQuery({
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

  const handleCreateSession = async () => {
    try {
      setIsCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create a session",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('study_sessions')
        .insert({
          title: newSession.title,
          subject: newSession.subject,
          description: newSession.description,
          start_time: new Date(newSession.startTime).toISOString(),
          end_time: new Date(newSession.endTime).toISOString(),
          created_by: user.id,
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Study session created successfully",
      });

      setNewSession({
        title: "",
        subject: "",
        description: "",
        startTime: "",
        endTime: "",
      });

      refetchSessions();
    } catch (error: any) {
      toast({
        title: "Error creating session",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

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
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                Create New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gray-900 text-white">
              <DialogHeader>
                <DialogTitle>Create New Study Session</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    className="bg-gray-800"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newSession.subject}
                    onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                    className="bg-gray-800"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newSession.description}
                    onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                    className="bg-gray-800"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({ ...newSession, startTime: e.target.value })}
                    className="bg-gray-800"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({ ...newSession, endTime: e.target.value })}
                    className="bg-gray-800"
                  />
                </div>
                <Button
                  onClick={handleCreateSession}
                  disabled={isCreating}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  {isCreating ? "Creating..." : "Create Session"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
