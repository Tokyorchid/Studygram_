
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Phone, Users, Sparkles, Video, VideoOff, Mic, MicOff, MonitorUp } from "lucide-react";
import CallControls from "./call-controls/CallControls";
import StudyTips from "./StudyTips";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CallViewProps {
  isVideoCall: boolean;
  activeChat: string;
  getChatName: (chatId: string) => string;
  endCall: () => void;
  toggleChat: () => void;
}

// Configuration for WebRTC
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]
};

const CallView = ({ 
  isVideoCall, 
  activeChat, 
  getChatName,
  endCall,
  toggleChat
}: CallViewProps) => {
  const [participants, setParticipants] = useState<string[]>([]);
  const [showTip, setShowTip] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const { toast } = useToast();

  // Function to create a channel for WebRTC signaling
  const createSignalingChannel = (sessionId: string) => {
    return supabase.channel(`call:${sessionId}`, {
      config: {
        broadcast: {
          self: false
        }
      }
    });
  };

  // Initialize call setup on component mount
  useEffect(() => {
    const initializeCall = async () => {
      try {
        // Get participant info from the session
        const { data: sessionParticipants } = await supabase
          .from('session_participants')
          .select(`
            user_id,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .eq('session_id', activeChat);

        if (sessionParticipants && sessionParticipants.length > 0) {
          const participantNames = sessionParticipants.map(p => 
            p.profiles?.username || 'Anonymous'
          );
          setParticipants(participantNames);
        } else {
          // Set default participants if no data
          setParticipants(["User 1", "User 2", "User 3"]);
        }

        // Initialize media for video calls
        if (isVideoCall) {
          await initializeUserMedia();
        }

        // Setup real-time connection for WebRTC signaling
        const channel = createSignalingChannel(activeChat);
        
        // Handle incoming offers
        channel.on('broadcast', { event: 'offer' }, async (payload) => {
          console.log('Received offer:', payload);
          await handleOffer(payload.payload, payload.sender);
        });
        
        // Handle incoming answers
        channel.on('broadcast', { event: 'answer' }, async (payload) => {
          console.log('Received answer:', payload);
          await handleAnswer(payload.payload, payload.sender);
        });
        
        // Handle ICE candidates
        channel.on('broadcast', { event: 'ice-candidate' }, async (payload) => {
          console.log('Received ICE candidate:', payload);
          await handleIceCandidate(payload.payload, payload.sender);
        });
        
        // Subscribe to the channel
        channel.subscribe();

        // Hide study tip after 10 seconds
        const timer = setTimeout(() => {
          setShowTip(false);
        }, 10000);

        // Clean up
        return () => {
          clearTimeout(timer);
          if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
          }
          
          // Close all peer connections
          peerConnectionsRef.current.forEach(peerConnection => {
            peerConnection.close();
          });
          
          channel.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing call:", error);
        toast({
          title: "Error initializing call",
          description: "Failed to set up call. Please try again.",
          variant: "destructive"
        });
      }
    };

    initializeCall();
  }, [activeChat, isVideoCall]);

  // Connect local video stream to video element
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Initialize user media (camera and microphone)
  const initializeUserMedia = async () => {
    try {
      const mediaConstraints = {
        audio: true,
        video: isVideoCall
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      setLocalStream(stream);
      
      toast({
        title: "Media initialized",
        description: isVideoCall 
          ? "Camera and microphone are active" 
          : "Microphone is active",
      });

      // Create peer connections for each participant
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const channel = createSignalingChannel(activeChat);
        
        // Get other participants
        const { data: otherParticipants } = await supabase
          .from('session_participants')
          .select('user_id')
          .eq('session_id', activeChat)
          .neq('user_id', user.id);
          
        if (otherParticipants && otherParticipants.length > 0) {
          // Create a peer connection for each participant
          for (const participant of otherParticipants) {
            createPeerConnection(participant.user_id, stream, channel);
          }
        }
      }

      return stream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast({
        title: "Error accessing camera or microphone",
        description: "Please check your device permissions",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Create a peer connection for a participant
  const createPeerConnection = async (
    participantId: string, 
    stream: MediaStream, 
    channel: any
  ) => {
    try {
      // Create a new RTCPeerConnection
      const peerConnection = new RTCPeerConnection(configuration);
      
      // Store the connection
      peerConnectionsRef.current.set(participantId, peerConnection);
      
      // Add all tracks from the local stream to the peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          channel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: event.candidate,
            sender: participantId
          });
        }
      };
      
      // Handle incoming tracks (remote streams)
      peerConnection.ontrack = (event) => {
        console.log('Received remote track', event);
        if (event.streams && event.streams[0]) {
          setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.set(participantId, event.streams[0]);
            return newStreams;
          });
        }
      };
      
      // Create and send an offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      channel.send({
        type: 'broadcast',
        event: 'offer',
        payload: offer,
        sender: participantId
      });

      return peerConnection;
    } catch (error) {
      console.error("Error creating peer connection:", error);
      toast({
        title: "Error connecting to peer",
        description: "Failed to establish connection with another participant",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Handle an incoming offer
  const handleOffer = async (offer: RTCSessionDescriptionInit, senderId: string) => {
    try {
      // Create a peer connection if it doesn't exist
      if (!peerConnectionsRef.current.has(senderId) && localStream) {
        const channel = createSignalingChannel(activeChat);
        const peerConnection = new RTCPeerConnection(configuration);
        
        // Store the connection
        peerConnectionsRef.current.set(senderId, peerConnection);
        
        // Add all tracks from the local stream
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        });
        
        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            channel.send({
              type: 'broadcast',
              event: 'ice-candidate',
              payload: event.candidate,
              sender: senderId
            });
          }
        };
        
        // Handle incoming tracks
        peerConnection.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStreams(prev => {
              const newStreams = new Map(prev);
              newStreams.set(senderId, event.streams[0]);
              return newStreams;
            });
          }
        };
        
        // Set the remote description (the offer)
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Create and send an answer
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        
        channel.send({
          type: 'broadcast',
          event: 'answer',
          payload: answer,
          sender: senderId
        });
      }
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  // Handle an incoming answer
  const handleAnswer = async (answer: RTCSessionDescriptionInit, senderId: string) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(senderId);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };

  // Handle an incoming ICE candidate
  const handleIceCandidate = async (candidate: RTCIceCandidateInit, senderId: string) => {
    try {
      const peerConnection = peerConnectionsRef.current.get(senderId);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  };

  const handleToggleVideo = async (videoOff: boolean) => {
    setIsVideoOff(videoOff);
    
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !videoOff;
      });
    }
    
    console.log("Video toggled:", videoOff ? "off" : "on");
  };

  const handleToggleMute = (muted: boolean) => {
    setIsMuted(muted);
    
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !muted;
      });
    }
    
    console.log("Microphone toggled:", muted ? "muted" : "unmuted");
  };

  const handleToggleScreenShare = async (screenSharing: boolean) => {
    setIsScreenSharing(screenSharing);
    
    if (screenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
        }
        
        // Share the screen with all peers
        peerConnectionsRef.current.forEach(peerConnection => {
          const sender = peerConnection.getSenders().find(s => 
            s.track?.kind === 'video'
          );
          
          if (sender) {
            sender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        });
        
        toast({
          title: "Screen sharing active",
          description: "You are now sharing your screen",
        });
        
        // When the user stops screen sharing through the browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          
          // Restore the camera video
          if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
              peerConnectionsRef.current.forEach(peerConnection => {
                const sender = peerConnection.getSenders().find(s => 
                  s.track?.kind === 'video'
                );
                
                if (sender) {
                  sender.replaceTrack(videoTrack);
                }
              });
            }
          }
        };
      } catch (error) {
        console.error("Error sharing screen:", error);
        setIsScreenSharing(false);
        toast({
          title: "Screen sharing failed",
          description: "Unable to share your screen",
          variant: "destructive"
        });
      }
    } else {
      // Stop screen sharing
      if (screenShareRef.current && screenShareRef.current.srcObject) {
        const stream = screenShareRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        screenShareRef.current.srcObject = null;
      }
      
      // Restore the camera video
      if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
          peerConnectionsRef.current.forEach(peerConnection => {
            const sender = peerConnection.getSenders().find(s => 
              s.track?.kind === 'video'
            );
            
            if (sender) {
              sender.replaceTrack(videoTrack);
            }
          });
        }
      }
    }
  };

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
              {isScreenSharing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative col-span-1 md:col-span-2 aspect-video bg-gray-800/80 rounded-lg overflow-hidden backdrop-blur-sm border border-green-500/30 flex items-center justify-center"
                >
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white flex items-center">
                    <MonitorUp className="h-3 w-3 mr-1 text-green-400" />
                    Screen Share
                  </div>
                  <video 
                    ref={screenShareRef}
                    autoPlay 
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </motion.div>
              )}
              
              {/* Remote participant videos */}
              {Array.from(remoteStreams).map(([participantId, stream], index) => (
                <motion.div
                  key={participantId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative aspect-video bg-gray-800/80 rounded-lg overflow-hidden backdrop-blur-sm border border-purple-500/10 flex items-center justify-center"
                >
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white flex items-center">
                    <Mic className="h-3 w-3 mr-1" />
                    {participants[index] || `Participant ${index + 1}`}
                  </div>
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    ref={el => {
                      if (el) el.srcObject = stream;
                    }}
                  />
                </motion.div>
              ))}
              
              {/* Placeholder videos if no remote streams */}
              {remoteStreams.size === 0 && participants.map((participant, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative aspect-video bg-gray-800/80 rounded-lg overflow-hidden backdrop-blur-sm border border-purple-500/10 flex items-center justify-center"
                >
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white flex items-center">
                    {isMuted ? <MicOff className="h-3 w-3 mr-1 text-red-400" /> : <Mic className="h-3 w-3 mr-1" />}
                    {participant}
                  </div>
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 flex items-center justify-center">
                    <Video className="h-10 w-10 text-gray-500" />
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Self video */}
            <div className="absolute bottom-20 right-4 w-32 h-24 bg-gray-700 rounded-lg border-2 border-gray-600 shadow-lg flex items-center justify-center overflow-hidden">
              <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              {isVideoOff ? (
                <VideoOff className="h-6 w-6 text-gray-400" />
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}
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
          onToggleVideo={handleToggleVideo}
          onToggleMute={handleToggleMute}
          onToggleScreenShare={handleToggleScreenShare}
        />
      </div>
    </div>
  );
};

export default CallView;
