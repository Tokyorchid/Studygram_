
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Users, Sparkles, Video, VideoOff, Mic, MicOff, MonitorUp, Wifi, WifiOff } from "lucide-react";
import CallControls from "./call-controls/CallControls";
import StudyTips from "./StudyTips";
import { supabase, createSignalingChannel } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CallViewProps {
  isVideoCall: boolean;
  activeChat: string;
  getChatName: (chatId: string) => string;
  endCall: () => void;
  toggleChat: () => void;
}

interface PeerConnection {
  connection: RTCPeerConnection;
  videoElement?: React.RefObject<HTMLVideoElement> | null;
  isMuted: boolean;
  isVideoOff: boolean;
}

type ICECandidateMessage = {
  candidate: RTCIceCandidate;
  sender: string;
  target?: string;
};

type SDPMessage = {
  sdp: RTCSessionDescriptionInit;
  sender: string;
  target?: string;
};

// Enhanced configuration with multiple STUN/TURN servers for better connectivity
const configuration: RTCConfiguration = {
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
    },
    {
      urls: 'turn:openrelay.metered.ca:443?transport=tcp',
      username: 'openrelayproject',
      credential: 'openrelayproject'
    }
  ],
  iceCandidatePoolSize: 10,
  iceTransportPolicy: 'all'
};

const CallView = ({ 
  isVideoCall, 
  activeChat, 
  getChatName,
  endCall,
  toggleChat
}: CallViewProps) => {
  // State for participants and UI
  const [participants, setParticipants] = useState<string[]>([]);
  const [showTip, setShowTip] = useState(true);
  const [participantProfiles, setParticipantProfiles] = useState<{id: string, username: string, avatarUrl?: string}[]>([]);
  
  // WebRTC state
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'reconnecting'>('connecting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  
  // Refs for WebRTC management
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const signalingChannelRef = useRef<any>(null);
  const userIdRef = useRef<string | null>(null);
  const channelName = useRef<string>(`call:${activeChat}`);
  const isInitiatorRef = useRef<boolean>(false);
  const reconnectionAttemptsRef = useRef(0);
  const maxReconnectionAttempts = 3;

  // Clean up all media streams and connections when component unmounts
  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, []);
  
  // Set up the call when the component mounts
  useEffect(() => {
    console.log("Setting up call with session ID:", activeChat);
    
    const initCall = async () => {
      try {
        // Get current user info
        const { data } = await supabase.auth.getUser();
        if (!data?.user) {
          throw new Error("Not authenticated");
        }
        userIdRef.current = data.user.id;
        console.log("Current user ID:", userIdRef.current);
        
        // Fetch participants
        await fetchParticipants();
        
        // Initialize media based on call type
        if (isVideoCall) {
          const stream = await initUserMedia();
          if (stream) {
            setupSignalingChannel();
          }
        } else {
          const audioStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
              echoCancellation: true,
              noiseSuppression: true,
              autoGainControl: true
            } 
          });
          setLocalStream(audioStream);
          setupSignalingChannel();
        }
        
        // Hide study tip after 8 seconds
        const timer = setTimeout(() => {
          setShowTip(false);
        }, 8000);
        
        return () => {
          clearTimeout(timer);
        };
      } catch (error) {
        console.error("Error initializing call:", error);
        toast.error("Failed to initialize call. Please try again.");
        // Attempt auto-reconnect
        handleConnectionError();
      }
    };
    
    initCall();
  }, [activeChat, isVideoCall]);

  // Fetch session participants
  const fetchParticipants = async () => {
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
        .eq('session_id', activeChat);
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Transform data for UI
        const validParticipants = data
          .filter(p => p?.profiles && typeof p.profiles === 'object')
          .map(p => ({
            id: p.user_id,
            username: p.profiles?.[0]?.username || 'Anonymous',
            avatarUrl: p.profiles?.[0]?.avatar_url || undefined
          }));
        
        if (validParticipants.length > 0) {
          setParticipantProfiles(validParticipants);
          setParticipants(validParticipants.map(p => p.username));
          console.log("Participants:", validParticipants);
        } else {
          const defaultParticipants = [
            {id: 'user-1', username: 'Study Partner'},
            {id: 'user-2', username: 'You'}
          ];
          setParticipantProfiles(defaultParticipants);
          setParticipants(defaultParticipants.map(p => p.username));
        }
      } else {
        const defaultParticipants = [
          {id: 'user-1', username: 'Study Partner'},
          {id: 'user-2', username: 'You'}
        ];
        setParticipantProfiles(defaultParticipants);
        setParticipants(defaultParticipants.map(p => p.username));
      }
    } catch (err) {
      console.error("Error fetching participants:", err);
      const defaultParticipants = [
        {id: 'user-1', username: 'Study Partner'},
        {id: 'user-2', username: 'You'}
      ];
      setParticipantProfiles(defaultParticipants);
      setParticipants(defaultParticipants.map(p => p.username));
    }
  };
  
  // Setup signaling channel for WebRTC
  const setupSignalingChannel = useCallback(() => {
    console.log("Setting up signaling channel:", channelName.current);
    
    const channel = createSignalingChannel(channelName.current);
    
    channel
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Join presence event:', key, newPresences);
        // When someone joins after us, initiate connection
        if (userIdRef.current && key !== userIdRef.current && localStream) {
          console.log("New peer joined, initializing connection to:", key);
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
        console.log('Received offer from:', payload.sender);
        if (payload.sender !== userIdRef.current) {
          handleOffer(payload);
        }
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        console.log('Received answer from:', payload.sender);
        if (payload.sender !== userIdRef.current) {
          handleAnswer(payload);
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
        console.log('Received ICE candidate from:', payload.sender);
        if (payload.sender !== userIdRef.current) {
          handleIceCandidate(payload);
        }
      })
      .on('broadcast', { event: 'mute-status' }, ({ payload }) => {
        if (payload.sender !== userIdRef.current) {
          handleRemoteMuteStatus(payload);
        }
      })
      .on('broadcast', { event: 'video-status' }, ({ payload }) => {
        if (payload.sender !== userIdRef.current) {
          handleRemoteVideoStatus(payload);
        }
      });
    
    // Subscribe to channel and track presence
    channel.subscribe(async (status) => {
      console.log(`Channel subscription status: ${status}`);
      if (status === 'SUBSCRIBED') {
        try {
          // Track our presence with user ID
          await channel.track({
            id: userIdRef.current,
            online_at: new Date().toISOString(),
            video_on: isVideoCall && !isVideoOff,
            audio_on: !isMuted
          });
          console.log("Tracking presence with user ID:", userIdRef.current);
          setConnectionState('connected');
        } catch (error) {
          console.error("Error tracking presence:", error);
          setConnectionState('disconnected');
        }
      }
    });
    
    signalingChannelRef.current = channel;
  }, [isVideoCall, isMuted, isVideoOff]);
  
  // Initialize user media (camera and microphone)
  const initUserMedia = async () => {
    try {
      console.log("Requesting user media access");
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: isVideoCall ? { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } : false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Got local stream with tracks:", 
                stream.getTracks().map(t => `${t.kind}: ${t.id} (${t.label})`));
      
      setLocalStream(stream);
      
      // Connect stream to local video element if it's a video call
      if (localVideoRef.current && isVideoCall) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // Always mute local video to prevent feedback
      }
      
      toast.success("Camera and microphone connected");
      return stream;
    } catch (error) {
      console.error("Error getting user media:", error);
      toast.error("Could not access camera or microphone. Please check your device permissions.");
      
      if (isVideoCall) {
        // Fallback to audio-only if video fails
        try {
          console.log("Falling back to audio-only");
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          setLocalStream(audioOnlyStream);
          setIsVideoOff(true);
          toast.info("Falling back to audio-only mode");
          return audioOnlyStream;
        } catch (audioError) {
          console.error("Audio fallback also failed:", audioError);
          toast.error("Could not access microphone. Call functionality may be limited.");
          return null;
        }
      }
      
      return null;
    }
  };
  
  // Create a peer connection to another user
  const createPeerConnection = async (peerId: string) => {
    try {
      console.log(`Creating peer connection to ${peerId}`);
      const peerConnection = new RTCPeerConnection(configuration);
      
      // Store the connection with initial state
      peerConnectionsRef.current.set(peerId, {
        connection: peerConnection,
        videoElement: React.createRef<HTMLVideoElement>(),
        isMuted: false,
        isVideoOff: false
      });
      
      // Add all local tracks to the connection
      if (localStream) {
        localStream.getTracks().forEach(track => {
          console.log(`Adding ${track.kind} track to peer connection:`, track.id);
          peerConnection.addTrack(track, localStream);
        });
      }
      
      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`Generated ICE candidate for peer ${peerId}`);
          signalingChannelRef.current?.send({
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
      
      // Log connection state changes for debugging
      peerConnection.onconnectionstatechange = () => {
        console.log(`Connection state with ${peerId}: ${peerConnection.connectionState}`);
        
        if (peerConnection.connectionState === 'connected') {
          setConnectionState('connected');
          toast.success(`Connected to ${participants.find(p => p !== 'Anonymous') || 'peer'}`);
          reconnectionAttemptsRef.current = 0;
        } else if (peerConnection.connectionState === 'disconnected' || 
                   peerConnection.connectionState === 'failed') {
          console.warn(`Connection with ${peerId} is ${peerConnection.connectionState}`);
          handleConnectionIssue(peerId, peerConnection.connectionState);
        }
      };
      
      // Log ICE connection state changes
      peerConnection.oniceconnectionstatechange = () => {
        console.log(`ICE connection state with ${peerId}: ${peerConnection.iceConnectionState}`);
      };
      
      // Handle remote tracks
      peerConnection.ontrack = (event) => {
        console.log(`Received ${event.track.kind} track from ${peerId}`);
        
        const peerInfo = peerConnectionsRef.current.get(peerId);
        if (!peerInfo) return;
        
        // Create a MediaStream for the remote tracks
        const remoteStream = new MediaStream();
        event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track);
        });
        
        // Attach stream to video element if it exists
        if (peerInfo.videoElement && peerInfo.videoElement.current) {
          peerInfo.videoElement.current.srcObject = remoteStream;
          console.log(`Attached remote stream to video element for ${peerId}`);
        } else {
          console.warn("Could not find video element for remote stream");
        }
        
        // Force component update to render remote video
        forceUpdate();
      };
      
      // If we're the initiator, create and send an offer
      if (isInitiatorRef.current) {
        console.log(`Creating offer for ${peerId} as initiator`);
        const offer = await peerConnection.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: isVideoCall
        });
        
        await peerConnection.setLocalDescription(offer);
        
        signalingChannelRef.current?.send({
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
      toast.error("Failed to establish connection with peer");
      return null;
    }
  };
  
  // Force component re-render
  const [, updateState] = useState({});
  const forceUpdate = useCallback(() => updateState({}), []);
  
  // Handle connection issues
  const handleConnectionIssue = (peerId: string, state: string) => {
    if (reconnectionAttemptsRef.current < maxReconnectionAttempts) {
      setConnectionState('reconnecting');
      toast.warning(`Connection issue detected. Attempting to reconnect... (${reconnectionAttemptsRef.current + 1}/${maxReconnectionAttempts})`);
      
      // Clean up old connection
      cleanupPeerConnection(peerId);
      
      // Wait briefly before attempting to reconnect
      setTimeout(() => {
        if (isInitiatorRef.current) {
          createPeerConnection(peerId);
          reconnectionAttemptsRef.current++;
        }
      }, 2000);
    } else {
      setConnectionState('disconnected');
      toast.error("Could not establish a stable connection. You may need to rejoin the call.");
    }
  };
  
  // Handle general connection errors
  const handleConnectionError = () => {
    if (reconnectionAttemptsRef.current < maxReconnectionAttempts) {
      setConnectionState('reconnecting');
      toast.warning(`Connection issue detected. Attempting to reconnect... (${reconnectionAttemptsRef.current + 1}/${maxReconnectionAttempts})`);
      
      // Wait briefly before attempting to reconnect
      setTimeout(async () => {
        try {
          // Attempt to re-initialize media
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
          
          reconnectionAttemptsRef.current++;
        } catch (error) {
          console.error("Error during reconnection:", error);
          setConnectionState('disconnected');
          toast.error("Could not reconnect. Please try rejoining the call.");
        }
      }, 2000);
    } else {
      setConnectionState('disconnected');
      toast.error("Could not establish a stable connection. Please try rejoining the call.");
    }
  };
  
  // Handle incoming WebRTC offer
  const handleOffer = async (payload: SDPMessage) => {
    try {
      const { sdp, sender } = payload;
      
      console.log(`Handling offer from ${sender}`);
      
      // Create peer connection if it doesn't exist
      let peerInfo = peerConnectionsRef.current.get(sender);
      let peerConnection: RTCPeerConnection;
      
      if (!peerInfo) {
        peerConnection = (await createPeerConnection(sender))!;
        if (!peerConnection) return; // Failed to create peer connection
      } else {
        peerConnection = peerInfo.connection;
      }
      
      // Set remote description from offer
      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log("Set remote description from offer");
      
      // Create and set local description (answer)
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      console.log("Created and set local answer");
      
      // Send answer back to the sender
      signalingChannelRef.current?.send({
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
  
  // Handle incoming WebRTC answer
  const handleAnswer = async (payload: SDPMessage) => {
    try {
      const { sdp, sender } = payload;
      
      console.log(`Handling answer from ${sender}`);
      
      const peerInfo = peerConnectionsRef.current.get(sender);
      if (peerInfo) {
        const peerConnection = peerInfo.connection;
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        console.log("Set remote description from answer");
      } else {
        console.warn(`No peer connection found for ${sender}`);
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  };
  
  // Handle incoming ICE candidate
  const handleIceCandidate = async (payload: ICECandidateMessage) => {
    try {
      const { candidate, sender } = payload;
      
      console.log(`Handling ICE candidate from ${sender}`);
      
      const peerInfo = peerConnectionsRef.current.get(sender);
      if (peerInfo) {
        const peerConnection = peerInfo.connection;
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("Added ICE candidate");
      } else {
        console.warn(`No peer connection found for ${sender}`);
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  };
  
  // Handle remote mute status change
  const handleRemoteMuteStatus = (payload: { sender: string, isMuted: boolean }) => {
    const { sender, isMuted } = payload;
    
    const peerInfo = peerConnectionsRef.current.get(sender);
    if (peerInfo) {
      peerConnectionsRef.current.set(sender, {
        ...peerInfo,
        isMuted
      });
      
      forceUpdate();
      console.log(`Peer ${sender} ${isMuted ? "muted" : "unmuted"} their microphone`);
    }
  };
  
  // Handle remote video status change
  const handleRemoteVideoStatus = (payload: { sender: string, isVideoOff: boolean }) => {
    const { sender, isVideoOff } = payload;
    
    const peerInfo = peerConnectionsRef.current.get(sender);
    if (peerInfo) {
      peerConnectionsRef.current.set(sender, {
        ...peerInfo,
        isVideoOff
      });
      
      forceUpdate();
      console.log(`Peer ${sender} turned ${isVideoOff ? "off" : "on"} their camera`);
    }
  };
  
  // Clean up a specific peer connection
  const cleanupPeerConnection = (peerId: string) => {
    console.log(`Cleaning up connection to ${peerId}`);
    
    const peerInfo = peerConnectionsRef.current.get(peerId);
    if (peerInfo) {
      const { connection } = peerInfo;
      
      // Close connection and remove all event listeners
      connection.onicecandidate = null;
      connection.ontrack = null;
      connection.onconnectionstatechange = null;
      connection.oniceconnectionstatechange = null;
      connection.close();
      
      // Remove connection from map
      peerConnectionsRef.current.delete(peerId);
      
      console.log(`Cleaned up connection to ${peerId}`);
      forceUpdate();
    }
  };
  
  // Clean up all connections and resources
  const cleanupCall = () => {
    console.log("Cleaning up call");
    
    // Stop all tracks in local stream
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped local ${track.kind} track:`, track.id);
      });
    }
    
    // Stop screen share stream if it exists
    if (screenShareRef.current && screenShareRef.current.srcObject) {
      const screenStream = screenShareRef.current.srcObject as MediaStream;
      screenStream.getTracks().forEach(track => {
        track.stop();
        console.log(`Stopped screen share ${track.kind} track:`, track.id);
      });
      screenShareRef.current.srcObject = null;
    }
    
    // Close all peer connections
    peerConnectionsRef.current.forEach((peerInfo, peerId) => {
      const { connection } = peerInfo;
      connection.close();
      console.log(`Closed connection to ${peerId}`);
    });
    peerConnectionsRef.current.clear();
    
    // Unsubscribe from signaling channel
    if (signalingChannelRef.current) {
      signalingChannelRef.current.unsubscribe();
      console.log("Unsubscribed from signaling channel");
    }
    
    setConnectionState('disconnected');
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
      
      // Broadcast status change to all peers
      signalingChannelRef.current?.send({
        type: 'broadcast',
        event: 'video-status',
        payload: {
          isVideoOff: videoOff,
          sender: userIdRef.current
        }
      });
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
      
      // Broadcast status change to all peers
      signalingChannelRef.current?.send({
        type: 'broadcast',
        event: 'mute-status',
        payload: {
          isMuted: muted,
          sender: userIdRef.current
        }
      });
    }
  };

  // Handle toggle screen share
  const handleToggleScreenShare = async (screenSharing: boolean) => {
    setIsScreenSharing(screenSharing);
    
    if (screenSharing) {
      try {
        console.log("Requesting screen share access");
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: {
            cursor: "always",
            displaySurface: "window"
          } as any,
          audio: false // Screen audio can cause feedback issues
        });
        
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = screenStream;
          screenShareRef.current.muted = true;
        }
        
        // Replace video track in all peer connections with screen share
        peerConnectionsRef.current.forEach(({ connection }) => {
          const senders = connection.getSenders();
          const videoSender = senders.find(sender => 
            sender.track && sender.track.kind === 'video'
          );
          
          if (videoSender && screenStream.getVideoTracks()[0]) {
            console.log("Replacing video track with screen share");
            videoSender.replaceTrack(screenStream.getVideoTracks()[0])
              .catch(err => console.error("Error replacing track:", err));
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
        if (localStream && !isVideoOff) {
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            peerConnectionsRef.current.forEach(({ connection }) => {
              const senders = connection.getSenders();
              const videoSender = senders.find(sender => 
                sender.track && sender.track.kind === 'video'
              );
              
              if (videoSender) {
                console.log("Replacing screen share with camera video");
                videoSender.replaceTrack(videoTrack)
                  .catch(err => console.error("Error replacing track:", err));
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
      <AnimatePresence>
        {showTip && (
          <motion.div 
            className="absolute top-4 left-0 right-0 z-10 px-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <StudyTips />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connection status indicator */}
      <div className="absolute top-4 right-4 z-10 flex items-center">
        {connectionState === 'connected' ? (
          <motion.div 
            className="flex items-center gap-1 bg-green-900/30 text-green-300 px-2 py-1 rounded-full text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Wifi className="h-3 w-3" />
            <span>Connected</span>
          </motion.div>
        ) : connectionState === 'connecting' ? (
          <motion.div 
            className="flex items-center gap-1 bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded-full text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Wifi className="h-3 w-3" />
            <span>Connecting...</span>
          </motion.div>
        ) : connectionState === 'reconnecting' ? (
          <motion.div 
            className="flex items-center gap-1 bg-orange-900/30 text-orange-300 px-2 py-1 rounded-full text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Wifi className="h-3 w-3" />
            <span>Reconnecting...</span>
          </motion.div>
        ) : (
          <motion.div 
            className="flex items-center gap-1 bg-red-900/30 text-red-300 px-2 py-1 rounded-full text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <WifiOff className="h-3 w-3" />
            <span>Disconnected</span>
          </motion.div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        {isVideoCall ? (
          <div className="w-full h-full flex flex-col">
            {/* Main video area */}
            <div className="relative w-full flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto p-2">
              {/* Screen share view (takes priority) */}
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
              {Array.from(peerConnectionsRef.current).map(([peerId, peerInfo], index) => (
                <motion.div
                  key={peerId}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative aspect-video bg-gray-800/80 rounded-lg overflow-hidden backdrop-blur-sm border border-purple-500/10 flex items-center justify-center"
                >
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded text-xs text-white flex items-center">
                    {peerInfo.isMuted && <MicOff className="h-3 w-3 mr-1 text-red-400" />}
                    {!peerInfo.isMuted && <Mic className="h-3 w-3 mr-1" />}
                    {participants[index] || `Participant ${index + 1}`}
                  </div>
                  
                  {peerInfo.isVideoOff ? (
                    <div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-purple-900/30 to-blue-900/30">
                      <VideoOff className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-300 mt-2">Camera off</p>
                    </div>
                  ) : (
                    <video
                      ref={peerInfo.videoElement}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  )}
                </motion.div>
              ))}
              
              {/* Placeholder videos if no remote connections */}
              {peerConnectionsRef.current.size === 0 && participants.map((participant, index) => (
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
                    <motion.div 
                      className="text-center"
                      animate={{ 
                        opacity: connectionState === 'connecting' || connectionState === 'reconnecting' ? 
                          [0.5, 1, 0.5] : 1 
                      }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Video className="h-10 w-10 text-gray-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-300">
                        {connectionState === 'connecting' ? 
                          'Connecting to peers...' : 
                          connectionState === 'reconnecting' ? 
                          'Reconnecting...' : 
                          connectionState === 'disconnected' ?
                          'Connection lost' :
                          `Waiting for ${participant}...`}
                      </p>
                    </motion.div>
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
              {isMuted && (
                <div className="absolute bottom-1 left-1 bg-red-900/60 rounded-full p-1">
                  <MicOff className="h-3 w-3 text-white" />
                </div>
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
              
              {/* Connection status indicator */}
              <div className="mt-4 flex justify-center">
                {connectionState === 'connected' ? (
                  <div className="flex items-center gap-1 bg-green-900/30 text-green-300 px-3 py-1.5 rounded-full text-sm">
                    <Wifi className="h-4 w-4 mr-1" />
                    <span>Call Connected</span>
                  </div>
                ) : connectionState === 'connecting' ? (
                  <motion.div 
                    className="flex items-center gap-1 bg-yellow-900/30 text-yellow-300 px-3 py-1.5 rounded-full text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <Wifi className="h-4 w-4 mr-1" />
                    <span>Connecting...</span>
                  </motion.div>
                ) : connectionState === 'reconnecting' ? (
                  <motion.div 
                    className="flex items-center gap-1 bg-orange-900/30 text-orange-300 px-3 py-1.5 rounded-full text-sm"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Wifi className="h-4 w-4 mr-1" />
                    <span>Reconnecting...</span>
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-1 bg-red-900/30 text-red-300 px-3 py-1.5 rounded-full text-sm">
                    <WifiOff className="h-4 w-4 mr-1" />
                    <span>Disconnected</span>
                  </div>
                )}
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
