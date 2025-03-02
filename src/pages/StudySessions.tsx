
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
    sessionType: "instant_pod",
    tasks: "",
    helpTopic: "",
    vibeTheme: "deep_focus",
  });
  const [dialogOpen, setDialogOpen] = useState(false);

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

      // Prepare metadata based on session type
      let metadata = null;
      let vibeSettings = null;

      if (newSession.sessionType === 'task_based' && newSession.tasks) {
        // Convert tasks string to array of task objects
        const taskItems = newSession.tasks.split('\n').filter(t => t.trim()).map((task, i) => ({
          id: `task-${i}`,
          text: task,
          completed: false
        }));
        metadata = { tasks: taskItems };
      }
      else if (newSession.sessionType === 'help_session' && newSession.helpTopic) {
        metadata = { helpTopic: newSession.helpTopic };
      }
      else if (newSession.sessionType === 'vibe_based') {
        vibeSettings = { 
          theme: newSession.vibeTheme,
          name: newSession.vibeTheme === 'deep_focus' 
            ? "Deep Focus Zone" 
            : newSession.vibeTheme === 'chill_cafe'
              ? "Chill Study Café"
              : "Sprint Study Mode"
        };
        metadata = { goal: newSession.description };
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
          session_type: newSession.sessionType,
          metadata,
          vibe_settings: vibeSettings
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
        sessionType: "instant_pod",
        tasks: "",
        helpTopic: "",
        vibeTheme: "deep_focus",
      });

      setDialogOpen(false);
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

  // Get session type description
  const getSessionTypeDescription = (type: string) => {
    switch(type) {
      case 'instant_pod':
        return "Quick, no-fuss study session with minimal features. Just join and study!";
      case 'silent_costudy':
        return "A quiet space where you can see others studying without distractions.";
      case 'task_based':
        return "Create a checklist of tasks to complete during the session.";
      case 'help_session':
        return "Get help with a specific topic or question from other students.";
      case 'vibe_based':
        return "Customize the mood and atmosphere of your study session.";
      default:
        return "";
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
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500">
                Create New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white">
              <DialogHeader>
                <DialogTitle>Create New Study Session</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="basic">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="advanced">Session Type</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
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
                </TabsContent>
                
                <TabsContent value="advanced" className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sessionType">Session Type</Label>
                    <Select 
                      value={newSession.sessionType} 
                      onValueChange={(value) => setNewSession({ ...newSession, sessionType: value })}
                    >
                      <SelectTrigger className="bg-gray-800">
                        <SelectValue placeholder="Select a session type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800">
                        <SelectItem value="instant_pod">🟢 Instant Study Pod</SelectItem>
                        <SelectItem value="silent_costudy">🔵 Silent Co-Study</SelectItem>
                        <SelectItem value="task_based">🟠 Task-Based Study</SelectItem>
                        <SelectItem value="help_session">🟡 Help Session</SelectItem>
                        <SelectItem value="vibe_based">🟣 Vibe-Based Session</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-400 mt-1">{getSessionTypeDescription(newSession.sessionType)}</p>
                  </div>
                  
                  {/* Conditional fields based on session type */}
                  {newSession.sessionType === 'task_based' && (
                    <div className="grid gap-2">
                      <Label htmlFor="tasks">Study Tasks (one per line)</Label>
                      <Textarea
                        id="tasks"
                        value={newSession.tasks}
                        onChange={(e) => setNewSession({ ...newSession, tasks: e.target.value })}
                        className="bg-gray-800"
                        placeholder="Read chapter 5
Work on 3 practice problems
Review class notes"
                        rows={5}
                      />
                    </div>
                  )}
                  
                  {newSession.sessionType === 'help_session' && (
                    <div className="grid gap-2">
                      <Label htmlFor="helpTopic">Help Topic/Question</Label>
                      <Textarea
                        id="helpTopic"
                        value={newSession.helpTopic}
                        onChange={(e) => setNewSession({ ...newSession, helpTopic: e.target.value })}
                        className="bg-gray-800"
                        placeholder="What specific topic do you need help with?"
                      />
                    </div>
                  )}
                  
                  {newSession.sessionType === 'vibe_based' && (
                    <div className="grid gap-2">
                      <Label htmlFor="vibeTheme">Vibe Theme</Label>
                      <Select 
                        value={newSession.vibeTheme} 
                        onValueChange={(value) => setNewSession({ ...newSession, vibeTheme: value })}
                      >
                        <SelectTrigger className="bg-gray-800">
                          <SelectValue placeholder="Select a vibe" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800">
                          <SelectItem value="deep_focus">🌙 Deep Focus Mode</SelectItem>
                          <SelectItem value="chill_cafe">🎵 Chill Café Mode</SelectItem>
                          <SelectItem value="sprint_mode">⚡ Sprint Mode</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
              
              <Button
                onClick={handleCreateSession}
                disabled={isCreating}
                className="bg-purple-500 hover:bg-purple-600 w-full mt-2"
              >
                {isCreating ? "Creating..." : "Create Session"}
              </Button>
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
              sessionType={session.session_type}
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
