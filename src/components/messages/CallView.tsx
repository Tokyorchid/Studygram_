
import React from "react";
import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import CallControls from "./CallControls";

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
  return (
    <div className="relative flex-1 bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        {isVideoCall ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-3xl aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-gray-400"
                >
                  {!isVideoCall && "Audio Call"}
                </motion.div>
              </div>
              <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg border-2 border-gray-600 shadow-lg">
                <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg border-2 border-gray-600 shadow-lg">
                  {/* Self video */}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8">
            <motion.div 
              className="w-24 h-24 rounded-full bg-purple-800/50 flex items-center justify-center mx-auto mb-4"
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
              <Phone className="h-10 w-10" />
            </motion.div>
            <h3 className="text-2xl font-semibold mb-2">Group Call</h3>
            <p className="text-gray-400">Connected to {getChatName(activeChat)}</p>
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
