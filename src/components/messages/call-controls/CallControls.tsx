
import React, { useState, useEffect } from "react";
import { Video, Mic, MessageSquare, Phone, Settings } from "lucide-react";
import CallControlButton from "./CallControlButton";
import AudioVisualizer from "./AudioVisualizer";
import EnhancedModeSettings from "./EnhancedModeSettings";
import { CallControlsProps } from "./types";

const CallControls = ({ onEndCall, onToggleChat, isVideoCall = false }: CallControlsProps) => {
  // State management for controls
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(isVideoCall);
  const [isEnhancedMode, setIsEnhancedMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Simulate audio levels for visualizer
  useEffect(() => {
    if (!isMuted) {
      const interval = setInterval(() => {
        setAudioLevel(Math.random());
      }, 100);
      return () => clearInterval(interval);
    } else {
      setAudioLevel(0);
    }
  }, [isMuted]);

  const toggleMute = () => setIsMuted(!isMuted);
  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleEnhancedMode = () => setIsEnhancedMode(!isEnhancedMode);
  const toggleSettings = () => setShowSettings(!showSettings);

  return (
    <div className="flex flex-col items-center">
      <AudioVisualizer show={!isMuted} audioLevel={audioLevel} />
      
      <div className="p-2 backdrop-blur-sm bg-gray-900/80 rounded-full flex space-x-2 shadow-lg border border-gray-800">
        <CallControlButton
          onClick={toggleMute}
          active={isMuted}
          icon={<Mic className="h-5 w-5" />}
          activeIcon={<Mic className="h-5 w-5 text-red-500" />}
          activeClass="bg-gray-800 border-red-500/30"
        />
        
        {isVideoCall && (
          <CallControlButton
            onClick={toggleVideo}
            active={!isVideoOn}
            icon={<Video className="h-5 w-5" />}
            activeIcon={<Video className="h-5 w-5 text-red-500" />}
            activeClass="bg-gray-800 border-red-500/30"
          />
        )}
        
        <CallControlButton
          onClick={onToggleChat}
          icon={<MessageSquare className="h-5 w-5" />}
        />
        
        <CallControlButton
          onClick={toggleEnhancedMode}
          active={isEnhancedMode}
          icon={<Settings className="h-5 w-5" />}
          activeClass="bg-gray-800 border-purple-500/50"
        />
        
        <CallControlButton
          onClick={onEndCall}
          icon={<Phone className="h-5 w-5 rotate-135" />}
          className="bg-red-500 hover:bg-red-600 text-white"
        />
      </div>
      
      <EnhancedModeSettings show={showSettings} />
    </div>
  );
};

export default CallControls;
