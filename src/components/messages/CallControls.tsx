
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Mic, MicOff, Phone, PhoneOff, Video, VideoOff, 
  ScreenShare, MonitorStop, MessageSquare 
} from "lucide-react";

interface CallControlsProps {
  onEndCall: () => void;
  onToggleChat: () => void;
  isVideoCall?: boolean;
}

const CallControls = ({ 
  onEndCall, 
  onToggleChat,
  isVideoCall = false 
}: CallControlsProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideoCall);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoEnabled(!isVideoEnabled);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);

  return (
    <div className="flex items-center justify-center gap-4 p-4 bg-gray-900/80 backdrop-blur-md rounded-xl">
      <Button 
        onClick={toggleMute} 
        variant="outline"
        className={isMuted ? "bg-red-900/30 text-red-400" : ""}
      >
        {isMuted ? <MicOff /> : <Mic />}
      </Button>
      
      {isVideoCall && (
        <Button 
          onClick={toggleVideo} 
          variant="outline"
          className={!isVideoEnabled ? "bg-red-900/30 text-red-400" : ""}
        >
          {isVideoEnabled ? <Video /> : <VideoOff />}
        </Button>
      )}
      
      <Button 
        onClick={toggleScreenShare} 
        variant="outline"
        className={isScreenSharing ? "bg-purple-900/30 text-purple-400" : ""}
      >
        {isScreenSharing ? <MonitorStop /> : <ScreenShare />}
      </Button>
      
      <Button 
        onClick={onToggleChat} 
        variant="outline"
      >
        <MessageSquare />
      </Button>
      
      <Button 
        onClick={onEndCall} 
        variant="destructive"
        className="bg-red-600 hover:bg-red-700"
      >
        <Phone className="rotate-135" />
      </Button>
    </div>
  );
};

export default CallControls;
