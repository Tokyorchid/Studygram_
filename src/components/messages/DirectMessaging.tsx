
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase, getProfile, getDirectMessages, sendDirectMessage } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
  is_read: boolean;
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
}

interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

export function DirectMessaging() {
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const location = useLocation();
  const otherUserId = new URLSearchParams(location.search).get('userId');

  // Fetch the current logged-in user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      } else {
        toast.error("Please login to use messages");
      }
    };
    
    fetchCurrentUser();
  }, []);

  // Fetch the other user's profile
  useEffect(() => {
    const fetchOtherUserProfile = async () => {
      if (!otherUserId) return;
      
      setIsLoadingProfile(true);
      try {
        const profileData = await getProfile(otherUserId);
        setOtherUser(profileData as Profile);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load user profile");
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    if (otherUserId) {
      fetchOtherUserProfile();
    }
  }, [otherUserId]);

  // Fetch messages
  const { data: messages, isLoading: isLoadingMessages, refetch } = useQuery({
    queryKey: ['directMessages', otherUserId],
    queryFn: async () => {
      if (!otherUserId) return [];
      return await getDirectMessages(otherUserId);
    },
    enabled: !!otherUserId && !!currentUserId,
    refetchInterval: 5000  // Poll for new messages every 5 seconds
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Setup realtime subscription for new messages
  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    const channel = supabase
      .channel('direct_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'direct_messages',
          filter: `recipient_id=eq.${currentUserId},sender_id=eq.${otherUserId}`
        },
        (payload) => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId, refetch]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !otherUserId || !currentUserId) return;

    try {
      const { error } = await sendDirectMessage(otherUserId, newMessage);
      if (error) throw error;
      
      setNewMessage("");
      await refetch();
      
      // Scroll to bottom immediately after sending
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!otherUserId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-900/50 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20">
        <User className="h-16 w-16 text-purple-500 mb-4" />
        <h2 className="text-xl font-semibold text-center">Select a user to start messaging</h2>
        <p className="text-gray-400 mt-2 text-center">
          Search for users or go to someone's profile to send them a message
        </p>
      </div>
    );
  }

  if (isLoadingProfile) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20 h-full flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24 mt-1" />
          </div>
        </div>
        <div className="flex-1 overflow-auto space-y-4 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-12 w-3/4 rounded-lg ml-auto" />
              <Skeleton className="h-12 w-3/4 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-xl border border-purple-500/20 h-full flex flex-col">
      {/* Header with user info */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-purple-500/20">
        <Avatar className="h-10 w-10 border border-purple-500/30">
          <AvatarImage src={otherUser?.avatar_url || undefined} alt={otherUser?.username || "user"} />
          <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500">
            <User className="h-5 w-5 text-white" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{otherUser?.full_name || "User"}</h3>
          <p className="text-sm text-gray-400">@{otherUser?.username || "username"}</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {isLoadingMessages ? (
          <div className="text-center py-4">
            <div className="animate-spin h-5 w-5 border-2 border-purple-500 rounded-full border-t-transparent mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading messages...</p>
          </div>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((message: Message) => (
              <div
                key={message.id}
                className={`flex flex-col ${
                  message.sender_id === currentUserId ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg max-w-[80%] ${
                    message.sender_id === currentUserId
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-100"
                  }`}
                >
                  {message.content}
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {formatMessageTime(message.created_at)}
                </span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">No messages yet. Send a message to start the conversation!</p>
          </div>
        )}
      </div>

      {/* Message input */}
      <div className="flex gap-2">
        <Input
          className="bg-gray-800/50 border-purple-500/20"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <Button
          className="bg-purple-500 hover:bg-purple-600 px-4"
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
