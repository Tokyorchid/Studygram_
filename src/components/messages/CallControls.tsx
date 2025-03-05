
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Mic, MicOff, Phone, Video, VideoOff, 
  ScreenShare, MonitorStop, MessageSquare, Volume2, VolumeX, 
  Zap, Users
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import CallControlButton from "./call-controls/CallControlButton";
import AudioVisualizer from "./call-controls/AudioVisualizer";
import EnhancedModeSettings from "./call-controls/EnhancedModeSettings";
import { CallControlsProps } from "./call-controls/types";

const CallControls = ({ 
  onEndCall, 
  onToggleChat,
  isVideoCall = false 
}: CallControlsProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideoCall);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isCallEnhanced, setIsCallEnhanced] = useState(false);
  const [speakerVolume, setSpeakerVolume] = useState(0.8);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  
  // Audio visualizer elements
  const [audioLevel, setAudioLevel] = useState(0);
  const [showAudioVisualizer, setShowAudioVisualizer] = useState(false);

  useEffect(() => {
    // Simulate audio levels when mic is active
    let interval: any;
    if (!isMuted) {
      interval = setInterval(() => {
        // Generate random audio level between 0.1 and 1.0
        setAudioLevel(0.1 + Math.random() * 0.9);
        setShowAudioVisualizer(true);
      }, 100);
    } else {
      setShowAudioVisualizer(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
    toast.info(isMuted ? "Microphone enabled" : "Microphone muted");
  };
  
  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast.info(isVideoEnabled ? "Camera turned off" : "Camera turned on");
  };
  
  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast.success(isScreenSharing ? "Screen sharing stopped" : "Screen sharing started");
  };

  const toggleSpeakerMute = () => {
    setIsSpeakerMuted(!isSpeakerMuted);
    setSpeakerVolume(isSpeakerMuted ? 0.8 : 0);
    toast.info(isSpeakerMuted ? "Speaker enabled" : "Speaker muted");
  };

  const toggleEnhancedMode = () => {
    setIsCallEnhanced(!isCallEnhanced);
    toast.success(
      isCallEnhanced 
        ? "Study mode activated" 
        : "Focus mode activated with noise cancellation"
    );
  };

  return (
    <div className="relative">
      <AudioVisualizer show={showAudioVisualizer} audioLevel={audioLevel} />
      
      <motion.div 
        className="flex items-center justify-center gap-4 p-4 bg-gray-900/80 backdrop-blur-md rounded-xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <CallControlButton 
          onClick={toggleMute}
          active={isMuted}
          icon={<Mic />}
          activeIcon={<MicOff />}
          activeClass="bg-red-900/30 text-red-400"
          className={!isMuted ? "bg-green-900/30 text-green-400" : ""}
        />
        
        {isVideoCall && (
          <CallControlButton 
            onClick={toggleVideo}
            active={!isVideoEnabled}
            icon={<Video />}
            activeIcon={<VideoOff />}
            activeClass="bg-red-900/30 text-red-400"
            className={isVideoEnabled ? "bg-green-900/30 text-green-400" : ""}
          />
        )}
        
        <CallControlButton 
          onClick={toggleScreenShare}
          active={isScreenSharing}
          icon={<ScreenShare />}
          activeIcon={<MonitorStop />}
          activeClass="bg-purple-900/30 text-purple-400"
        />
        
        <CallControlButton 
          onClick={toggleSpeakerMute}
          active={isSpeakerMuted}
          icon={<Volume2 />}
          activeIcon={<VolumeX />}
          activeClass="bg-red-900/30 text-red-400"
        />
        
        <CallControlButton 
          onClick={toggleEnhancedMode}
          active={isCallEnhanced}
          icon={<Users />}
          activeIcon={<Zap />}
          activeClass="bg-blue-900/30 text-blue-400"
        />
        
        <CallControlButton 
          onClick={onToggleChat}
          icon={<MessageSquare />}
        />
        
        <motion.div 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <Button 
            onClick={onEndCall} 
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            size="icon"
          >
            <Phone className="rotate-135" />
          </Button>
        </motion.div>
      </motion.div>
      
      <EnhancedModeSettings show={isCallEnhanced} />
    </div>
  );
};

export default CallControls;
