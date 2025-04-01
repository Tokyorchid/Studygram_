
import React from "react";
import { Button } from "@/components/ui/button";
import { Phone, Video, X, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatHeaderProps {
  activeChat: string;
  activeChatName: string;
  activeChatAvatar: string | null;
  isInCall: boolean;
  startCall: (video: boolean) => void;
  endCall: () => void;
  showStudyTools: boolean;
  setShowStudyTools: (show: boolean) => void;
}

const ChatHeader = ({ 
  activeChat, 
  activeChatName, 
  activeChatAvatar,
  isInCall, 
  startCall, 
  endCall, 
  showStudyTools, 
  setShowStudyTools 
}: ChatHeaderProps) => {
  return (
    <div className="bg-gray-900/50 backdrop-blur-xl border-b border-purple-500/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-gradient-to-r from-purple-500 to-pink-500">
            <AvatarImage src={activeChatAvatar || undefined} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold gradient-text">{activeChatName}</h2>
            <p className="text-sm text-gray-400">
              {isInCall ? "In call" : "Online"}
            </p>
          </div>
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
