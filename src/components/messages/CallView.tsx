
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Phone, Users, Sparkles, Video, VideoOff, Mic, MicOff, MonitorUp } from "lucide-react";
import CallControls from "./call-controls/CallControls";
import StudyTips from "./StudyTips";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CallViewProps {
  isVideoCall: boolean;
  activeChat: string;
  getChatName: (chatId: string) => string;
  endCall: () => void;
  toggleChat: () => void;
}

// Enhanced configuration for WebRTC with additional STUN/TURN servers
const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
    { 
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 10
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
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const signalChannelRef = useRef<any>(null);
  const userIdRef = useRef<string | null>(null);
  const channelName = useRef<string>(`call:${activeChat}`);
  const isInitiatorRef = useRef<boolean>(false);

  // Set up the WebRTC and signaling
  useEffect(() => {
    console.log("Setting up call with session ID:", activeChat);
    
    const initCall = async () => {
      try {
        // Get current user info
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Not authenticated");
        }
        userIdRef.current = user.id;
        console.log("Current user ID:", userIdRef.current);
        
        // Get session participants
        try {
          const { data, error } = await supabase
            .from('session_participants')
            .select(`
              user_id,
              profiles:user_id (
                username,
                avatar_url
              )
            `)
            .eq('session_id', activeChat as any);
            
          if (error) {
            throw error;
          }
          
          if (data && data.length > 0) {
            const participantNames = data
              .filter(p => p?.profiles?.username) // Filter out invalid entries
              .map(p => p.profiles?.username || 'Anonymous');
            
            if (participantNames.length > 0) {
              setParticipants(participantNames);
              console.log("Participants:", participantNames);
            } else {
              setParticipants(["User 1", "User 2"]);
              console.log("No valid participant names found, using defaults");
            }
          } else {
            setParticipants(["User 1", "User 2"]);
            console.log("No participants found, using defaults");
          }
        } catch (err) {
          console.error("Error fetching participants:", err);
          setParticipants(["User 1", "User 2"]);
        }
        
        // Initialize media
        if (isVideoCall) {
          const stream = await initUserMedia();
          if (stream) {
            setupSignalingChannel();
          }
        } else {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setLocalStream(audioStream);
          setupSignalingChannel();
        }
        
        // Hide study tip after 10 seconds
        const timer = setTimeout(() => {
          setShowTip(false);
        }, 10000);
        
        return () => {
          clearTimeout(timer);
          cleanupCall();
        };
      } catch (error) {
        console.error("Error initializing call:", error);
        toast.error("Failed to initialize call. Please try again.");
      }
    };
    
    initCall();
  }, [activeChat, isVideoCall]);

  // Setup signaling channel
  const setupSignalingChannel = () => {
    console.log("Setting up signaling channel:", channelName.current);
    
    const channel = supabase.channel(channelName.current, {
      config: {
        broadcast: { self: false }
      }
    });
    
    channel
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Join presence event:', key, newPresences);
        // When someone else joins after us, we're the initiator
        if (userIdRef.current && key !== userIdRef.current && localStream) {
          console.log("We are the initiator for:", key);
          isInitiatorRef.current = true;
          createPeerConnection(key);
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        console.log('Leave presence event:', key);
        // Clean up connection when peer leaves
        cleanupPeerConnection(key);
      })
      .on('broadcast', { event: 'offer' }, ({ payload }) => {
        console.log('Received offer:', payload);
        if (payload.sender !== userIdRef.current) {
          handleOffer(payload);
        }
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        console.log('Received answer:', payload);
        if (payload.sender !== userIdRef.current) {
          handleAnswer(payload);
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
        console.log('Received ICE candidate');
        if (payload.sender !== userIdRef.current) {
          handleIceCandidate(payload);
        }
      });
    
    // Track presence and subscribe
    channel.subscribe(async (status) => {
      console.log(`Channel subscription status: ${status}`);
      if (status === 'SUBSCRIBED') {
        // Enter the presence channel with our user ID
        await channel.track({
          id: userIdRef.current,
          online_at: new Date().toISOString(),
        });
        console.log("Tracking presence with user ID:", userIdRef.current);
      }
    });
    
    signalChannelRef.current = channel;
  };
  
  // Initialize camera and microphone
  const initUserMedia = async () => {
    try {
      console.log("Requesting user media access");
      const mediaConstraints = {
        audio: true,
        video: isVideoCall ? { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      console.log("Got local stream:", stream.id, "with tracks:", 
                  stream.getTracks().map(t => `${t.kind}: ${t.id} (${t.label})`));
      
      // Connect stream to video element
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      toast.success("Camera and microphone connected");
      return stream;
    } catch (error) {
      console.error("Error getting user media:", error);
      toast.error("Could not access camera or microphone");
      return null;
    }
  };
  
  // Create a peer connection
  const createPeerConnection = async (peerId: string) => {
    try {
      console.log(`Creating peer connection to ${peerId}`);
      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionsRef.current.set(peerId, peerConnection);
      
      // Add local tracks to the connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          console.log(`Adding ${track.kind} track to peer connection:`, track.id);
          peerConnection.addTrack(track, localStream);
        });
      }
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`Generated ICE candidate for peer ${peerId}:`, event.candidate.candidate.substring(0, 50) + "...");
          signalChannelRef.current?.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: {
              candidate: event.candidate,
              sender: userIdRef.current,
              target: peerId
            }
          });
        }
      };
      
      // Log state changes for debugging
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state change with ${peerId}: ${peerConnection.connectionState}`);
      };
      
      peerConnection.oniceconnectionstatechange = () => {
        console.log(`ICE connection state change with ${peerId}: ${peerConnection.iceConnectionState}`);
        // If we're connected, toast success
        if (peerConnection.iceConnectionState === 'connected') {
          toast.success(`Connected to ${participants.find(p => p !== 'Anonymous') || 'peer'}`);
        }
      };
      
      // Handle incoming tracks
      peerConnection.ontrack = (event) => {
        console.log(`Received ${event.track.kind} track from ${peerId}`);
        
        // Create a new MediaStream if we receive tracks
        if (event.streams && event.streams[0]) {
          console.log(`Got remote stream from ${peerId}:`, event.streams[0].id);
          
          // Update remote streams with the new stream
          setRemoteStreams(prev => {
            const newStreams = new Map(prev);
            newStreams.set(peerId, event.streams[0]);
            return newStreams;
          });
        }
      };
      
      // If we're the initiator, create and send offer
      if (isInitiatorRef.current) {
        console.log(`Creating offer for ${peerId}`);
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: isVideoCall
        });
        
        await peerConnection.setLocalDescription(offer);
        
        signalChannelRef.current?.send({
          type: 'broadcast',
          event: 'offer',
          payload: {
            sdp: offer,
            sender: userIdRef.current,
            target: peerId
          }
        });
      }
      
      return peerConnection;
    } catch (error) {
      console.error("Error creating peer connection:", error);
      toast.error("Failed to establish connection");
      return null;
    }
  };
  
  // Handle incoming offer
  const handleOffer = async (payload: any) => {
    try {
      const { sdp, sender, target } = payload;
      
      // Only process if we're the target or it's broadcast
      if (target && target !== userIdRef.current) return;
      
      console.log(`Handling offer from ${sender}`);
      
      // Create peer connection if it doesn't exist
      let peerConnection = peerConnectionsRef.current.get(sender);
      if (!peerConnection) {
        peerConnection = await createPeerConnection(sender);
        if (!peerConnection) return; // Failed to create peer connection
      }
      
      // Set remote description from offer
      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log("Set remote description from offer");
      
      // Create and set local description (answer)
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log("Created and set local answer");
      
      // Send answer back to the sender
      signalChannelRef.current?.send({
        type: 'broadcast',
        event: 'answer',
        payload: {
          sdp: answer,
          sender: userIdRef.current,
          target: sender
        }
      });
    } catch (error) {
      console.error("Error handling offer:", error);
      toast.error("Failed to process connection offer");
    }
  };
  
  // Handle incoming answer
  const handleAnswer = async (payload: any) => {
    try {
      const { sdp, sender, target } = payload;
      
      // Only process if we're the target or it's broadcast
      if (target && target !== userIdRef.current) return;
      
      console.log(`Handling answer from ${sender}`);
      
      const peerConnection = peerConnectionsRef.current.get(sender);
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log("Set remote description from answer");
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };
  
  // Handle incoming ICE candidate
  const handleIceCandidate = async (payload: any) => {
    try {
      const { candidate, sender, target } = payload;
      
      // Only process if we're the target or it's broadcast
      if (target && target !== userIdRef.current) return;
      
      console.log(`Handling ICE candidate from ${sender}`);
      
      const peerConnection = peerConnectionsRef.current.get(sender);
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("Added ICE candidate");
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  };
  
  // Clean up a specific peer connection
  const cleanupPeerConnection = (peerId: string) => {
    const peerConnection = peerConnectionsRef.current.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      peerConnectionsRef.current.delete(peerId);
      
      // Remove the remote stream
      setRemoteStreams(prev => {
        const newStreams = new Map(prev);
        newStreams.delete(peerId);
        return newStreams;
      });
      
      console.log(`Cleaned up connection to ${peerId}`);
    }
  };
  
  // Clean up all connections when leaving
  const cleanupCall = () => {
    console.log("Cleaning up call");
    
    // Stop all tracks in local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped local ${track.kind} track:`, track.id);
      });
    }
    
    // Close all peer connections
    peerConnectionsRef.current.forEach((connection, peerId) => {
      connection.close();
      console.log(`Closed connection to ${peerId}`);
    });
    
    // Unsubscribe from signaling channel
    if (signalChannelRef.current) {
      signalChannelRef.current.unsubscribe();
      console.log("Unsubscribed from signaling channel");
    }
  };

  // Handle toggle video
  const handleToggleVideo = (videoOff: boolean) => {
    setIsVideoOff(videoOff);
    
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = !videoOff;
      });
      console.log("Video toggled:", videoOff ? "off" : "on");
    }
  };

  // Handle toggle mute
  const handleToggleMute = (muted: boolean) => {
    setIsMuted(muted);
    
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !muted;
      });
      console.log("Audio toggled:", muted ? "muted" : "unmuted");
    }
  };

  // Handle toggle screen share
  const handleToggleScreenShare = async (screenSharing: boolean) => {
    setIsScreenSharing(screenSharing);
    
    if (screenSharing) {
      try {
        console.log("Requesting screen share access");
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false // Screen audio can cause feedback issues
        });
        
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
        }
        
        // Replace video track in all peer connections with screen share
        peerConnectionsRef.current.forEach((peerConnection) => {
          const senders = peerConnection.getSenders();
          const videoSender = senders.find(sender => 
            sender.track && sender.track.kind === 'video'
          );
          
          if (videoSender && screenStream.getVideoTracks()[0]) {
            console.log("Replacing video track with screen share");
            videoSender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        });
        
        // Handle when user stops sharing via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          handleToggleScreenShare(false);
        };
        
        toast.success("Screen sharing started");
      } catch (error) {
        console.error("Error starting screen share:", error);
        setIsScreenSharing(false);
        toast.error("Could not share screen");
      }
    } else {
      // Revert back to camera if we were screen sharing
      if (screenShareRef.current && screenShareRef.current.srcObject) {
        const screenStream = screenShareRef.current.srcObject as MediaStream;
        screenStream.getTracks().forEach(track => track.stop());
        screenShareRef.current.srcObject = null;
        
        // Replace screen share track with camera track in all peer connections
        if (localStream) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            peerConnectionsRef.current.forEach((peerConnection) => {
              const senders = peerConnection.getSenders();
              const videoSender = senders.find(sender => 
                sender.track && sender.track.kind === 'video'
              );
              
              if (videoSender) {
                console.log("Replacing screen share with camera video");
                videoSender.replaceTrack(videoTrack);
              }
            });
          }
        }
        
        toast.success("Screen sharing stopped");
      }
    }
  };

  return (
    <div className="relative flex-1 bg-gradient-to-b from-gray-900 to-black flex flex-col">
      {/* Study tip */}
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
                    {participant}
                  </div>
                  <div className="w-full h-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-300">Waiting for {participant}...</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Self video */}
            <div className="absolute bottom-20 right-4 w-40 h-30 bg-gray-700 rounded-lg border-2 border-gray-600 shadow-lg flex items-center justify-center overflow-hidden">
              <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></div>
              {isVideoOff ? (
                <div className="flex flex-col items-center justify-center h-full w-full">
                  <VideoOff className="h-6 w-6 text-gray-400" />
                  <p className="text-xs text-gray-400 mt-1">Camera off</p>
                </div>
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
