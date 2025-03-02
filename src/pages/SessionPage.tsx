
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Mic, MicOff, Video, VideoOff, UserCircle, Clock, CheckSquare, Hash, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { motion } from "framer-motion";

// Define better types for session metadata and vibe settings
interface SessionMetadata {
  tasks?: Array<{ id: string; text: string; completed: boolean }>;
  goal?: string;
  helpTopic?: string;
  [key: string]: any;
}

interface VibeSettings {
  theme?: 'deep_focus' | 'chill_cafe' | 'sprint_mode';
  name?: string;
  [key: string]: any;
}

interface Session {
  id: string;
  title: string;
  subject: string;
  description: string;
  start_time: string;
  end_time: string;
  created_by: string;
  session_type: 'instant_pod' | 'silent_costudy' | 'task_based' | 'help_session' | 'vibe_based';
  metadata: SessionMetadata | null;
  vibe_settings: VibeSettings | null;
}

const SessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [tasks, setTasks] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [messages, setMessages] = useState<Array<{ id: string; user: string; text: string; timestamp: string }>>([]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch session data
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;
      return data as Session;
    },
  });

  // Fetch participants
  const { data: participants } = useQuery({
    queryKey: ['sessionParticipants', sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('session_participants')
        .select(`
          user_id,
          profiles:user_id(
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('session_id', sessionId);

      if (error) throw error;
      return data;
    },
    enabled: !!sessionId,
  });

  // Timer effect
  useEffect(() => {
    let interval: number | undefined;
    
    if (!sessionEnded && !isPaused) {
      interval = window.setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [sessionEnded, isPaused]);

  // Check if user is a participant
  useEffect(() => {
    const checkParticipation = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { count } = await supabase
        .from('session_participants')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', sessionId)
        .eq('user_id', user.id);

      if (!count) {
        toast({
          title: "Not a participant",
          description: "You need to join this session first",
          variant: "destructive",
        });
        navigate('/study-sessions');
      }
    };

    checkParticipation();
  }, [sessionId, navigate, toast]);

  // Initialize tasks for task-based sessions
  useEffect(() => {
    if (session?.session_type === 'task_based' && session.metadata) {
      // Safely access metadata with type checking
      const sessionMetadata = session.metadata as SessionMetadata;
      if (sessionMetadata.tasks) {
        setTasks(sessionMetadata.tasks);
      }
    }
  }, [session]);

  // Format time for display (HH:MM:SS)
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
    toast({
      title: !isMicOn ? "Microphone On" : "Microphone Off",
      description: !isMicOn ? "Others can now hear you" : "You are now muted",
    });
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast({
      title: !isVideoOn ? "Camera On" : "Camera Off",
      description: !isVideoOn ? "Others can now see you" : "Your camera is now off",
    });
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    toast({
      title: !isPaused ? "Session Paused" : "Session Resumed",
      description: !isPaused ? "Take a break and come back when ready" : "Let's continue studying!",
    });
  };

  const handleEndSession = () => {
    // Show confirmation
    if (!sessionEnded && !window.confirm("Are you sure you want to end your session?")) {
      return;
    }
    
    setSessionEnded(true);
    toast({
      title: "Session Ended",
      description: "Great job today! You studied for " + formatTime(elapsedTime),
    });
  };

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: `msg-${Date.now()}`,
      user: "You",
      text: newMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage("");
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-purple-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Session Not Found</h1>
        <p className="text-gray-400 mb-8">The study session you're looking for doesn't exist or has ended.</p>
        <Button onClick={() => navigate('/study-sessions')}>
          Back to Study Sessions
        </Button>
      </div>
    );
  }

  // Calculate completion percentage for task-based sessions
  const completedTasksPercentage = tasks.length > 0
    ? Math.round((tasks.filter(task => task.completed).length / tasks.length) * 100)
    : 0;

  // Shared session header
  const SessionHeader = () => (
    <div className="bg-gray-900 p-6 rounded-xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">{session.title}</h1>
        <p className="text-gray-400">{session.subject}</p>
      </div>
      
      <div className="flex flex-col items-end">
        <div className="text-2xl font-mono">{formatTime(elapsedTime)}</div>
        <div className="text-gray-400 text-sm">
          {format(new Date(session.start_time), 'PPp')} - {format(new Date(session.end_time), 'p')}
        </div>
      </div>
    </div>
  );

  // Shared participant display
  const ParticipantsList = () => (
    <div className="bg-gray-900/70 p-4 rounded-xl">
      <h3 className="font-semibold mb-3">Participants ({participants?.length || 0})</h3>
      <div className="flex flex-wrap gap-3">
        {participants?.map((participant) => (
          <div key={participant.user_id} className="flex items-center gap-2 bg-gray-800/50 rounded-full px-3 py-1">
            <UserCircle className="w-5 h-5" />
            <span>{participant.profiles?.username || "Anonymous"}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // Shared controls
  const SessionControls = () => (
    <div className="sticky bottom-6 flex justify-center">
      <div className="bg-gray-900/90 backdrop-blur-lg px-6 py-3 rounded-full flex items-center gap-4">
        <button
          onClick={toggleMic}
          className={`p-3 rounded-full ${isMicOn ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}
        >
          {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoOn ? 'bg-green-500/20 text-green-400' : 'bg-gray-800 text-gray-400'}`}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>
        
        <button
          onClick={togglePause}
          className={`p-3 rounded-full ${isPaused ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-400'}`}
        >
          <Clock className="w-5 h-5" />
        </button>
        
        <Button
          onClick={handleEndSession}
          variant={sessionEnded ? "secondary" : "destructive"}
          className="rounded-full px-6"
        >
          {sessionEnded ? "Return to Sessions" : "End Session"}
        </Button>
      </div>
    </div>
  );

  // Render different UIs based on session type
  switch (session.session_type) {
    case 'instant_pod':
      return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <SessionHeader />
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-xl p-6 flex items-center justify-center min-h-[400px]">
                {isVideoOn ? (
                  <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
                    <div className="text-gray-400">Camera preview (simulated)</div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center">
                    <VideoOff className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                    <p>Camera is off</p>
                    <p className="text-sm mt-2">Turn on your camera to see participants</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <ParticipantsList />
                
                <div className="bg-gray-900/70 p-4 rounded-xl">
                  <h3 className="font-semibold mb-3">Session Progress</h3>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div 
                      className="bg-purple-500 h-3 rounded-full" 
                      style={{ width: `${Math.min(100, (elapsedTime / (7200)) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Duration: {formatTime(elapsedTime)} 
                    {isPaused && <span className="text-amber-400 ml-2">(Paused)</span>}
                  </p>
                </div>
              </div>
            </div>
            
            {!sessionEnded && <SessionControls />}
          </div>
        </div>
      );
    
    case 'silent_costudy':
      return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <SessionHeader />
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4">Silent Co-Study Room</h2>
                <p className="text-gray-400 mb-6">Study quietly with others for accountability without distractions.</p>
                
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <h3 className="font-semibold mb-3">Your Study Goal</h3>
                  <p className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    {session.description || "No specific goal set"}
                  </p>
                </div>
                
                <div className="mt-8">
                  <h3 className="font-semibold mb-4">Others Studying Now</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {participants?.map((participant) => (
                      <div key={participant.user_id} className="bg-gray-800/50 rounded-xl p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center">
                            {participant.profiles?.username?.[0] || "?"}
                          </div>
                          <div>
                            <div className="font-medium">{participant.profiles?.username || "Anonymous"}</div>
                            <div className="text-xs text-gray-400">Studying for 0h 45m</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                          <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                        </div>
                        <div className="text-xs text-gray-400">75% complete</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <ParticipantsList />
                
                <div className="bg-gray-900/70 p-4 rounded-xl">
                  <h3 className="font-semibold mb-3">Session Progress</h3>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div 
                      className="bg-blue-500 h-3 rounded-full" 
                      style={{ width: `${Math.min(100, (elapsedTime / (7200)) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Duration: {formatTime(elapsedTime)} 
                    {isPaused && <span className="text-amber-400 ml-2">(Paused)</span>}
                  </p>
                </div>
                
                <div className="bg-gray-900/70 p-4 rounded-xl">
                  <h3 className="font-semibold mb-3">Focus Mode</h3>
                  <p className="text-gray-400 text-sm mb-3">
                    Hide all UI elements except the timer to maximize focus
                  </p>
                  <Button className="w-full">Enter Focus Mode</Button>
                </div>
              </div>
            </div>
            
            {!sessionEnded && <SessionControls />}
          </div>
        </div>
      );
    
    case 'task_based':
      return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <SessionHeader />
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold">Task-Based Study Session</h2>
                  <div className="bg-orange-900/30 text-orange-400 px-3 py-1 rounded-full text-sm">
                    {completedTasksPercentage}% Complete
                  </div>
                </div>
                
                <div className="space-y-4">
                  {tasks.length > 0 ? (
                    <>
                      {tasks.map((task) => (
                        <div 
                          key={task.id} 
                          className={`flex items-start gap-3 p-4 rounded-lg transition-colors ${
                            task.completed ? 'bg-gray-800/30 text-gray-400' : 'bg-gray-800/60'
                          }`}
                        >
                          <Checkbox 
                            checked={task.completed} 
                            onCheckedChange={() => handleToggleTask(task.id)}
                            className={task.completed ? 'border-green-500 bg-green-500' : ''}
                          />
                          <div className="flex-1">
                            <p className={task.completed ? 'line-through' : ''}>{task.text}</p>
                          </div>
                        </div>
                      ))}
                      
                      {completedTasksPercentage === 100 && (
                        <div className="mt-8 text-center p-4 bg-green-900/20 border border-green-700/30 rounded-xl">
                          <h3 className="text-xl font-semibold text-green-400">🎉 All Tasks Completed!</h3>
                          <p className="mt-2 text-gray-300">Great job! You've finished all your study tasks.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-8 bg-gray-800/30 rounded-xl">
                      <CheckSquare className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                      <h3 className="text-lg font-medium mb-2">No Tasks Available</h3>
                      <p className="text-gray-400">
                        This session doesn't have any specific tasks to complete.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                <ParticipantsList />
                
                <div className="bg-gray-900/70 p-4 rounded-xl">
                  <h3 className="font-semibold mb-3">Session Progress</h3>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div 
                      className="bg-orange-500 h-3 rounded-full" 
                      style={{ width: `${Math.min(100, (elapsedTime / (7200)) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Duration: {formatTime(elapsedTime)} 
                    {isPaused && <span className="text-amber-400 ml-2">(Paused)</span>}
                  </p>
                </div>
                
                <div className="bg-gray-900/70 p-4 rounded-xl">
                  <h3 className="font-semibold mb-3">Task Completion</h3>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div 
                      className="bg-orange-500 h-3 rounded-full" 
                      style={{ width: `${completedTasksPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
                  </p>
                </div>
              </div>
            </div>
            
            {!sessionEnded && <SessionControls />}
          </div>
        </div>
      );
    
    case 'help_session':
      return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <SessionHeader />
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 bg-gray-900/50 backdrop-blur-xl rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6">Help Session</h2>
                
                <div className="bg-gray-900/70 p-4 rounded-xl mb-6">
                  <h3 className="font-semibold text-yellow-300">Help Topic:</h3>
                  <p className="mt-2">
                    {session.metadata && typeof session.metadata === 'object' ? 
                      (session.metadata as SessionMetadata).helpTopic || session.description || "No help topic specified"
                      : session.description || "No help topic specified"}
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Session Chat</h3>
                    <div className="bg-gray-800/50 rounded-xl p-4 h-[300px] overflow-y-auto flex flex-col gap-3">
                      {messages.length > 0 ? (
                        messages.map((msg) => (
                          <div key={msg.id} className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{msg.user}</span>
                              <span className="text-xs text-gray-500">
                                {format(new Date(msg.timestamp), 'p')}
                              </span>
                            </div>
                            <p className="pl-1">{msg.text}</p>
                          </div>
                        ))
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <Hash className="w-10 h-10 mx-auto mb-2" />
                            <p>No messages yet</p>
                            <p className="text-sm">Ask your question to get help</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your question or answer..."
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white"
                      />
                      <Button onClick={handleSendMessage}>Send</Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Helpers Available</h3>
                    <div className="bg-gray-800/50 rounded-xl p-4 min-h-[300px]">
                      {participants?.map((participant) => (
                        <div 
                          key={participant.user_id} 
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-full bg-yellow-900/40 flex items-center justify-center">
                            {participant.profiles?.username?.[0] || "?"}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{participant.profiles?.username || "Anonymous"}</div>
                            <div className="text-xs text-gray-400">Available to help</div>
                          </div>
                          <Button variant="outline" size="sm">
                            Ask
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-6">
                <ParticipantsList />
                
                <div className="bg-gray-900/70 p-4 rounded-xl">
                  <h3 className="font-semibold mb-3">Session Progress</h3>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div 
                      className="bg-yellow-500 h-3 rounded-full" 
                      style={{ width: `${Math.min(100, (elapsedTime / (7200)) * 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Duration: {formatTime(elapsedTime)} 
                    {isPaused && <span className="text-amber-400 ml-2">(Paused)</span>}
                  </p>
                </div>
                
                <div className="flex gap-4 justify-center mt-8">
                  <Button 
                    onClick={handleEndSession}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={sessionEnded}
                  >
                    Mark as Solved
                  </Button>
                </div>
              </div>
            </div>
            
            {!sessionEnded && <SessionControls />}
          </div>
        </div>
      );
        
    case 'vibe_based':
      const vibeSettings = session.vibe_settings as VibeSettings || {};
      const vibeTheme = vibeSettings.theme || 'deep_focus';
      const vibeColors: Record<string, string> = {
        deep_focus: 'from-blue-900 to-indigo-900',
        chill_cafe: 'from-amber-900 to-orange-900', 
        sprint_mode: 'from-red-900 to-pink-900'
      };
      const vibeBg = vibeColors[vibeTheme] || vibeColors.deep_focus;
      
      return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <SessionHeader />
            
            <div className={`rounded-xl p-6 bg-gradient-to-br ${vibeBg}`}>
              <h2 className="text-xl font-semibold mb-4">
                {vibeSettings.name || "Vibe Study Session"}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl flex gap-4 items-center">
                    <Clock className="w-12 h-12 text-white/70" />
                    <div className="text-4xl font-mono font-bold">{formatTime(elapsedTime)}</div>
                  </div>
                  
                  <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                    <h3 className="font-semibold mb-3">Session Goal</h3>
                    <p>
                      {session.metadata && typeof session.metadata === 'object' ? 
                        (session.metadata as SessionMetadata).goal || session.description || "Focus and be productive"
                        : session.description || "Focus and be productive"}
                    </p>
                  </div>
                  
                  {vibeTheme === 'chill_cafe' && (
                    <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Volume2 className="w-5 h-5" />
                        Lofi Background Music
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1 bg-orange-500/50 rounded-full">
                          <div className="w-1/2 h-full bg-orange-500 rounded-full"></div>
                        </div>
                        <span className="text-xs">1:30 / 3:00</span>
                      </div>
                      <p className="text-gray-400 text-sm mt-2">Lofi Hip Hop Mix - Beats to Study To</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  <div className="bg-black/30 backdrop-blur-sm p-4 rounded-xl">
                    <h3 className="font-semibold mb-3">Current Vibe</h3>
                    <div className="flex gap-2 flex-wrap">
                      {vibeTheme === 'deep_focus' && (
                        <>
                          <span className="px-3 py-1 rounded-full bg-blue-900/50 text-blue-300 text-sm">Deep Focus</span>
                          <span className="px-3 py-1 rounded-full bg-blue-900/50 text-blue-300 text-sm">Minimal Distractions</span>
                          <span className="px-3 py-1 rounded-full bg-blue-900/50 text-blue-300 text-sm">Flow State</span>
                        </>
                      )}
                      {vibeTheme === 'chill_cafe' && (
                        <>
                          <span className="px-3 py-1 rounded-full bg-orange-900/50 text-orange-300 text-sm">Chill Café</span>
                          <span className="px-3 py-1 rounded-full bg-orange-900/50 text-orange-300 text-sm">Lofi Music</span>
                          <span className="px-3 py-1 rounded-full bg-orange-900/50 text-orange-300 text-sm">Relaxed Focus</span>
                        </>
                      )}
                      {vibeTheme === 'sprint_mode' && (
                        <>
                          <span className="px-3 py-1 rounded-full bg-red-900/50 text-red-300 text-sm">Sprint Mode</span>
                          <span className="px-3 py-1 rounded-full bg-red-900/50 text-red-300 text-sm">High Intensity</span>
                          <span className="px-3 py-1 rounded-full bg-red-900/50 text-red-300 text-sm">Timed Challenges</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <ParticipantsList />
                </div>
              </div>
            </div>
            
            {!sessionEnded && <SessionControls />}
          </div>
        </div>
      );
      
    default:
      return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">Unknown Session Type</h1>
            <p className="text-gray-400 mt-2 mb-6">This session type is not recognized.</p>
            <Button onClick={() => navigate('/study-sessions')}>
              Back to Study Sessions
            </Button>
          </div>
        </div>
      );
  }
};

export default SessionPage;
