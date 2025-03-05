
import React from "react";
import { Button } from "@/components/ui/button";
import { Phone, Video, X } from "lucide-react";

interface ChatHeaderProps {
  activeChat: string;
  isInCall: boolean;
  startCall: (video: boolean) => void;
  endCall: () => void;
  showStudyTools: boolean;
  setShowStudyTools: (show: boolean) => void;
}

const ChatHeader = ({ 
  activeChat, 
  isInCall, 
  startCall, 
  endCall, 
  showStudyTools, 
  setShowStudyTools 
}: ChatHeaderProps) => {
  
  const getChatName = (chatId: string): string => {
    switch (chatId) {
      case "study-group-a": return "Study Group A";
      case "math-squad": return "Math Squad";
      case "science-team": return "Science Team";
      default: return chatId;
    }
  };

  const getChatMembers = (chatId: string): number => {
    switch (chatId) {
      case "study-group-a": return 4;
      case "math-squad": return 3;
      case "science-team": return 5;
      default: return 2;
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border-b border-purple-500/20 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold gradient-text">{getChatName(activeChat)}</h2>
          <p className="text-sm text-gray-400">{getChatMembers(activeChat)} members</p>
        </div>
        {!isInCall ? (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => startCall(false)}
              className="hover:bg-purple-900/30 hover:text-purple-400"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => startCall(true)}
              className="hover:bg-purple-900/30 hover:text-purple-400"
            >
              <Video className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowStudyTools(!showStudyTools)}
              className={showStudyTools ? "bg-purple-900/30 text-purple-400" : ""}
            >
              Study Tools
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" onClick={endCall}>
            <X className="h-4 w-4 mr-2" /> End Call
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatHeader;
