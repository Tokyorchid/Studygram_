import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Clock, Target, Users, Play, Pause, X, MessageSquare, CheckCircle, Video, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Json } from "@/integrations/supabase/types";
import CallView from "@/components/messages/CallView";

interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
}

interface SessionMetadata {
  tasks?: TaskItem[];
  helpTopic?: string;
  goal?: string;
}

interface VibeSettings {
  theme?: string;
  name?: string;
}

const SessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [studyGoal, setStudyGoal] = useState("");
  const [progress, setProgress] = useState(0);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['sessionDetails', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: participants, isLoading: isParticipantsLoading } = useQuery({
    queryKey: ['sessionParticipants', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_participants')
        .select(`
          user_id,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('session_id', sessionId);

      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });

  useEffect(() => {
    if (!session) return;
    
    let interval: NodeJS.Timeout;
    
    if (!isPaused && !sessionEnded) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    const sessionEnd = new Date(session.end_time).getTime();
    const now = new Date().getTime();
    if (now >= sessionEnd && !sessionEnded) {
      setSessionEnded(true);
      toast({
        title: "Session ended",
        description: "Your study session has ended.",
      });
    }

    return () => clearInterval(interval);
  }, [isPaused, session, sessionEnded, toast]);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    if (session?.session_type === 'task_based' && session.metadata) {
      const sessionMetadata = session.metadata as SessionMetadata;
      if (sessionMetadata.tasks) {
        setTasks(sessionMetadata.tasks);
      }
    }
  }, [session]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTogglePause = () => {
    setIsPaused(prev => !prev);
    toast({
      title: isPaused ? "Session resumed" : "Session paused",
      description: isPaused ? "Timer is now running" : "Take a break, timer is paused",
    });
  };

  const handleEndSession = () => {
    setSessionEnded(true);
    toast({
      title: "Session complete",
      description: `You studied for ${formatTime(elapsedTime)}`,
    });
  };

  const handleUpdateProgress = (newProgress: number) => {
    setProgress(newProgress);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
    
    const newTasks = tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    const completedCount = newTasks.filter(t => t.completed).length;
    handleUpdateProgress(Math.round((completedCount / newTasks.length) * 100));
  };

  const startCall = (video: boolean) => {
    setIsInCall(true);
    setIsVideoCall(video);
    setShowChat(false);
    toast({
      title: video ? "Video call started" : "Audio call started",
      description: "You are now connected with other study pod members",
    });
  };

  const endCall = () => {
    setIsInCall(false);
    setIsVideoCall(false);
    setShowChat(true);
    toast({
      title: "Call ended",
      description: "Call has been disconnected",
    });
  };

  const toggleChat = () => {
    setShowChat(!showChat);
  };

  const getChatName = (chatId: string) => {
    return session?.title || "Study Pod";
  };

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse text-xl">Loading session...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-red-500">Session not found</h1>
          <p className="mt-4">This study session doesn't exist or has ended.</p>
          <Button 
            className="mt-8 bg-purple-500" 
            onClick={() => navigate("/study-sessions")}
          >
            Back to Sessions
          </Button>
        </div>
      </div>
    );
  }

  if (isInCall) {
    return (
      <div className="min-h-screen bg-black text-white">
        <CallView 
          isVideoCall={isVideoCall} 
          activeChat={sessionId || ""}
          getChatName={getChatName}
          endCall={endCall}
          toggleChat={toggleChat}
        />
      </div>
    );
  }

  const renderSessionContent = () => {
    switch (session.session_type) {
      case 'instant_pod':
        return (
          <div className="space-y-8">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Instant Study Pod</h2>
              <div className="text-center my-8">
                <div className="text-5xl font-bold font-mono">{formatTime(elapsedTime)}</div>
                <p className="text-gray-400 mt-2">Study duration</p>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <Button 
                  onClick={handleTogglePause} 
                  className={isPaused ? "bg-green-500" : "bg-yellow-500"}
                >
                  {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                
                <Button 
                  onClick={() => startCall(false)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Audio Call
                </Button>
                
                <Button 
                  onClick={() => startCall(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Video Call
                </Button>
                
                <Button 
                  onClick={handleEndSession}
                  variant="destructive"
                  disabled={sessionEnded}
                >
                  <X className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </div>
            </div>

            {participants && participants.length > 0 && (
              <div className="bg-gray-900/50 rounded-xl p-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Users className="mr-2 h-4 w-4" />
                  Participants ({participants.length})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {participants.map((participant) => (
                    <div key={participant.user_id} className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        {participant.profiles?.username?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm">{participant.profiles?.username || 'Anonymous'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
        
      case 'silent_costudy':
        return (
          <div className="space-y-8">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Silent Co-Study Room</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-5xl font-bold font-mono">{formatTime(elapsedTime)}</div>
                    <p className="text-gray-400 mt-2">Focus time</p>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm text-gray-400 mb-2">Your study goal:</label>
                    <div className="flex gap-2">
                      <input 
                        className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2"
                        placeholder="What are you working on?"
                        value={studyGoal}
                        onChange={(e) => setStudyGoal(e.target.value)}
                        disabled={sessionEnded}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm text-gray-400 mb-2">Progress:</label>
                    <div className="w-full bg-gray-800 rounded-full h-4">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <button 
                        className="text-xs text-purple-400 hover:text-purple-300"
                        onClick={() => handleUpdateProgress(Math.max(0, progress - 10))}
                        disabled={sessionEnded}
                      >
                        -10%
                      </button>
                      <span className="text-sm">{progress}%</span>
                      <button 
                        className="text-xs text-purple-400 hover:text-purple-300"
                        onClick={() => handleUpdateProgress(Math.min(100, progress + 10))}
                        disabled={sessionEnded}
                      >
                        +10%
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900/70 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Co-Study Members ({participants?.length || 0})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-auto">
                    {participants?.map((participant) => (
                      <div key={participant.user_id} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          {participant.profiles?.username?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">{participant.profiles?.username || 'Anonymous'}</div>
                          <div className="w-full bg-gray-800 rounded-full h-2 mt-1">
                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <Button 
                  onClick={handleTogglePause} 
                  className={isPaused ? "bg-green-500" : "bg-yellow-500"}
                >
                  {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button 
                  onClick={handleEndSession}
                  variant="destructive"
                  disabled={sessionEnded}
                >
                  <X className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 'task_based':
        return (
          <div className="space-y-8">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Task-Based Study Room</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold font-mono">{formatTime(elapsedTime)}</div>
                    <p className="text-gray-400 mt-2">Study duration</p>
                  </div>
                  
                  <div className="bg-gray-900/70 p-4 rounded-xl">
                    <h3 className="font-semibold mb-3 flex items-center text-purple-300">
                      <Target className="mr-2 h-4 w-4" />
                      Your Study Tasks
                    </h3>
                    
                    <div className="space-y-2 mt-4">
                      {tasks.length > 0 ? (
                        tasks.map(task => (
                          <div 
                            key={task.id} 
                            className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${
                              task.completed ? 'bg-green-900/30 text-green-300' : 'bg-gray-800/50'
                            }`}
                          >
                            <button 
                              onClick={() => handleToggleTask(task.id)}
                              disabled={sessionEnded}
                              className="flex-shrink-0"
                            >
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                task.completed ? 'border-green-500 bg-green-500/30' : 'border-gray-500'
                              }`}>
                                {task.completed && <CheckCircle className="w-4 h-4 text-green-300" />}
                              </div>
                            </button>
                            <span className={task.completed ? 'line-through opacity-70' : ''}>{task.text}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 italic text-sm">No tasks defined for this session.</div>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <div className="bg-gray-800 rounded-full h-4">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-emerald-500 h-4 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="text-sm text-right mt-1">{progress}% complete</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="bg-gray-900/70 rounded-xl p-4 mb-4">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Participants ({participants?.length || 0})
                    </h3>
                    <div className="space-y-3 max-h-40 overflow-auto">
                      {participants?.map((participant) => (
                        <div key={participant.user_id} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            {participant.profiles?.username?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm">{participant.profiles?.username || 'Anonymous'}</div>
                            <div className="w-full bg-gray-800 rounded-full h-2 mt-1">
                              <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/70 rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Quick Messages
                    </h3>
                    <div className="space-y-2">
                      <Button variant="ghost" className="w-full justify-start text-sm" disabled={sessionEnded}>
                        🎉 Great job everyone!
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-sm" disabled={sessionEnded}>
                        💪 Keep going!
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-sm" disabled={sessionEnded}>
                        🔥 Making good progress!
                      </Button>
                      <Button variant="ghost" className="w-full justify-start text-sm" disabled={sessionEnded}>
                        ⏰ Almost done!
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <Button 
                  onClick={handleTogglePause} 
                  className={isPaused ? "bg-green-500" : "bg-yellow-500"}
                >
                  {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button 
                  onClick={handleEndSession}
                  variant="destructive"
                  disabled={sessionEnded}
                >
                  <X className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 'help_session':
        const helpMetadata = session.metadata as SessionMetadata;
        return (
          <div className="space-y-8">
            <div className="bg-gray-900/50 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Help Session</h2>
              
              <div className="bg-gray-900/70 p-4 rounded-xl mb-6">
                <h3 className="font-semibold text-yellow-300">Help Topic:</h3>
                <p className="mt-2">{helpMetadata?.helpTopic || session.description || "No help topic specified"}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-900/70 rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                  </h3>
                  <div className="bg-gray-800/70 rounded-xl p-4 h-60 overflow-y-auto mb-3">
                    <div className="opacity-50 text-center text-sm">Chat messages will appear here</div>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-md px-3 py-2"
                      disabled={sessionEnded}
                    />
                    <Button disabled={sessionEnded}>Send</Button>
                  </div>
                </div>
                
                <div>
                  <div className="text-center mb-6">
                    <div className="text-4xl font-bold font-mono">{formatTime(elapsedTime)}</div>
                    <p className="text-gray-400 mt-2">Session duration</p>
                  </div>
                  
                  <div className="bg-gray-900/70 rounded-xl p-4">
                    <h3 className="font-semibold mb-3 flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Participants ({participants?.length || 0})
                    </h3>
                    <div className="space-y-3 max-h-40 overflow-auto">
                      {participants?.map((participant) => (
                        <div key={participant.user_id} className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            {participant.profiles?.username?.charAt(0) || '?'}
                          </div>
                          <span className="text-sm">{participant.profiles?.username || 'Anonymous'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <Button 
                  onClick={handleEndSession}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={sessionEnded}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Problem Solved
                </Button>
                <Button 
                  onClick={handleEndSession}
                  variant="destructive"
                  disabled={sessionEnded}
                >
                  <X className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </div>
            </div>
          </div>
        );
        
      case 'vibe_based':
        const vibeSettings = session.vibe_settings as VibeSettings;
        const vibeTheme = vibeSettings?.theme || 'deep_focus';
        const vibeColors = {
          deep_focus: 'from-blue-900 to-indigo-900',
          chill_cafe: 'from-amber-900 to-orange-900', 
          sprint_mode: 'from-red-900 to-pink-900'
        };
        const vibeBg = vibeColors[vibeTheme as keyof typeof vibeColors] || vibeColors.deep_focus;
        
        return (
          <div className="space-y-8">
            <div className={`rounded-xl p-6 bg-gradient-to-br ${vibeBg}`}>
              <h2 className="text-xl font-semibold mb-4">
                {vibeSettings?.name || "Vibe Study Session"}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-5xl font-bold font-mono">{formatTime(elapsedTime)}</div>
                    <p className="text-gray-300 mt-2">Vibe time</p>
                  </div>
                  
                  <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                    <h3 className="font-semibold mb-3">Session Goal</h3>
                    <p>
                      {(session.metadata as SessionMetadata)?.goal || session.description || "Focus and be productive"}
                    </p>
                  </div>
                  
                  {vibeTheme === 'chill_cafe' && (
                    <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <span className="mr-2">🎵</span> Ambient Music
                      </h3>
                      <div className="flex items-center justify-between">
                        <span>Lo-fi beats</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                            <Pause className="h-4 w-4" />
                          </Button>
                          <div className="w-24 bg-gray-800 rounded-full h-2">
                            <div className="bg-white h-2 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4">
                  <h3 className="font-semibold mb-3 flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Vibe Buddies ({participants?.length || 0})
                  </h3>
                  <div className="space-y-3 max-h-60 overflow-auto">
                    {participants?.map((participant) => (
                      <div key={participant.user_id} className="flex items-center gap-3 p-2 bg-black/30 rounded-lg">
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                          {participant.profiles?.username?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm">{participant.profiles?.username || 'Anonymous'}</div>
                          <div className="w-full bg-gray-800 rounded-full h-2 mt-1">
                            <div className="bg-white h-2 rounded-full" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 justify-center mt-8">
                <Button 
                  onClick={handleTogglePause} 
                  className={`bg-black/40 hover:bg-black/60 ${isPaused ? "text-green-400" : "text-yellow-400"}`}
                >
                  {isPaused ? <Play className="mr-2 h-4 w-4" /> : <Pause className="mr-2 h-4 w-4" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <Button 
                  onClick={handleEndSession}
                  className="bg-black/40 hover:bg-black/60 text-red-400"
                  disabled={sessionEnded}
                >
                  <X className="mr-2 h-4 w-4" />
                  End Session
                </Button>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center my-8">
            <p>Unknown session type. Please contact support.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto space-y-6"
      >
        <div className="flex flex-col md:flex-row items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{session.title}</h1>
            <p className="text-gray-400 mt-1">{session.description}</p>
            
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock className="h-4 w-4" />
                <span>
                  {session.start_time && format(new Date(session.start_time), 'MMM d, h:mm a')}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Users className="h-4 w-4" />
                <span>{participants?.length || 0} participants</span>
              </div>
            </div>
          </div>
          
          {!sessionEnded && !isInCall && (
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={() => startCall(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Video className="mr-2 h-4 w-4" />
                Video Call
              </Button>
              <Button 
                onClick={() => startCall(false)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Phone className="mr-2 h-4 w-4" />
                Audio Call
              </Button>
            </div>
          )}
        </div>
        
        {renderSessionContent()}
      </motion.div>
    </div>
  );
};

export default SessionPage;
