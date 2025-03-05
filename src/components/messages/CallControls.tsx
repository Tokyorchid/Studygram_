
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Mic, MicOff, Phone, PhoneOff, Video, VideoOff, 
  ScreenShare, MonitorStop, MessageSquare, Volume2, VolumeX, 
  Zap, Users
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

  // Audio visualizer bars
  const renderAudioVisualizer = () => {
    if (!showAudioVisualizer) return null;

    const bars = 5;
    return (
      <div className="absolute -top-14 left-1/2 transform -translate-x-1/2 flex items-end justify-center gap-1 bg-gray-900/70 backdrop-blur-md p-2 rounded-lg">
        {Array(bars).fill(0).map((_, i) => {
          const height = Math.max(4, Math.floor(audioLevel * 20 * (0.5 + Math.random() * 0.5)));
          return (
            <motion.div
              key={i}
              className="w-1 bg-green-400"
              initial={{ height: 4 }}
              animate={{ height }}
              transition={{ duration: 0.1 }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="relative">
      {renderAudioVisualizer()}
      <motion.div 
        className="flex items-center justify-center gap-4 p-4 bg-gray-900/80 backdrop-blur-md rounded-xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <Button 
            onClick={toggleMute} 
            variant="outline"
            className={`relative ${isMuted ? "bg-red-900/30 text-red-400" : "bg-green-900/30 text-green-400"}`}
            size="icon"
          >
            {isMuted ? <MicOff /> : <Mic />}
          </Button>
        </motion.div>
        
        {isVideoCall && (
          <motion.div 
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.1 }}
          >
            <Button 
              onClick={toggleVideo} 
              variant="outline"
              className={`relative ${!isVideoEnabled ? "bg-red-900/30 text-red-400" : "bg-green-900/30 text-green-400"}`}
              size="icon"
            >
              {isVideoEnabled ? <Video /> : <VideoOff />}
            </Button>
          </motion.div>
        )}
        
        <motion.div 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <Button 
            onClick={toggleScreenShare} 
            variant="outline"
            className={`relative ${isScreenSharing ? "bg-purple-900/30 text-purple-400" : ""}`}
            size="icon"
          >
            {isScreenSharing ? <MonitorStop /> : <ScreenShare />}
          </Button>
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <Button 
            onClick={toggleSpeakerMute} 
            variant="outline"
            className={`relative ${isSpeakerMuted ? "bg-red-900/30 text-red-400" : ""}`}
            size="icon"
          >
            {isSpeakerMuted ? <VolumeX /> : <Volume2 />}
          </Button>
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <Button 
            onClick={toggleEnhancedMode} 
            variant="outline"
            className={`relative ${isCallEnhanced ? "bg-blue-900/30 text-blue-400" : ""}`}
            size="icon"
          >
            {isCallEnhanced ? <Zap /> : <Users />}
          </Button>
        </motion.div>
        
        <motion.div 
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
        >
          <Button 
            onClick={onToggleChat} 
            variant="outline"
            size="icon"
          >
            <MessageSquare />
          </Button>
        </motion.div>
        
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
      
      {/* Enhanced mode settings */}
      {isCallEnhanced && (
        <motion.div 
          className="mt-3 p-3 bg-gray-800/80 backdrop-blur-md rounded-lg text-sm"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          <div className="flex items-center justify-between mb-2">
            <span>Noise cancellation</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span>Voice enhancement</span>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span>Auto gain control</span>
            <Switch defaultChecked />
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CallControls;
