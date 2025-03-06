
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Phone, Users, Sparkles, Video, Mic } from "lucide-react";
import CallControls from "./call-controls/CallControls";
import StudyTips from "./StudyTips";
import { supabase } from "@/integrations/supabase/client";

interface CallViewProps {
  isVideoCall: boolean;
  activeChat: string;
  getChatName: (chatId: string) => string;
  endCall: () => void;
  toggleChat: () => void;
}

const CallView = ({ 
  isVideoCall, 
  activeChat, 
  getChatName,
  endCall,
  toggleChat
}: CallViewProps) => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [showTip, setShowTip] = useState(true);

  // Simulate getting participants
  useEffect(() => {
    // This would be replaced with actual data fetching
    const fakeParticipants = ["User 1", "User 2", "User 3"];
    setParticipants(fakeParticipants);

    // Hide study tip after 10 seconds
    const timer = setTimeout(() => {
      setShowTip(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, [activeChat]);

  return (
    <div className="relative flex-1 bg-gradient-to-b from-gray-900 to-black flex flex-col">
      {/* Study tip that appears at the start of call */}
      {showTip && (
        <div className="absolute top-4 left-0 right-0 z-10 px-4">
          <StudyTips />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center p-4">
        {isVideoCall ? (
          <div className="w-full h-full flex flex-col">
            {/* Main video area */}
            <div className="relative w-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-2">
              {participants.map((participant, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative aspect-video bg-gray-800/80 rounded-lg overflow-hidden backdrop-blur-sm border border-purple-500/10 flex items-center justify-center"
                >
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white flex items-center">
                    <Mic className="h-3 w-3 mr-1" />
                    {participant}
                  </div>
                  
                  {/* Placeholder for video */}
                  <Video className="h-10 w-10 text-gray-500" />
                </motion.div>
              ))}
            </div>
            
            {/* Self video */}
            <div className="absolute bottom-20 right-4 w-32 h-24 bg-gray-700 rounded-lg border-2 border-gray-600 shadow-lg flex items-center justify-center">
              <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              <Video className="h-6 w-6 text-gray-400" />
            </div>
          </div>
        ) : (
          <div className="p-8">
            <motion.div 
              className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600/50 to-pink-600/50 flex items-center justify-center mx-auto mb-4 relative overflow-hidden"
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
              </div>
              <Phone className="h-10 w-10 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h3 className="text-2xl font-semibold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">Study Squad Call</h3>
              <p className="text-gray-400 flex items-center justify-center">
                <Users className="h-4 w-4 mr-1" /> Connected to {getChatName(activeChat)}
              </p>
              <div className="mt-4 px-3 py-1.5 bg-purple-500/20 rounded-full text-xs text-purple-300 inline-flex items-center">
                <Sparkles className="h-3 w-3 mr-1 text-yellow-300" /> Focus Mode Active
              </div>
            </motion.div>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <CallControls 
          onEndCall={endCall} 
          onToggleChat={toggleChat} 
          isVideoCall={isVideoCall}
        />
      </div>
    </div>
  );
};

export default CallView;
