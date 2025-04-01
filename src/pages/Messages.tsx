import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import "../styles/gradientText.css";

import ChatSidebar from "@/components/messages/ChatSidebar";
import ChatHeader from "@/components/messages/ChatHeader";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";
import CallView from "@/components/messages/CallView";
import StudyPomodoroTimer from "@/components/messages/StudyPomodoroTimer";
import CollaborativeNotes from "@/components/messages/CollaborativeNotes";
import StudyFileSharing from "@/components/messages/StudyFileSharing";
import { MessageProps } from "@/components/messages/types";
import { supabase } from "@/integrations/supabase/client";
import { getConversation, getContacts, subscribeToMessages, getUserById } from "@/services/directMessageService";

const Messages = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [activeChatName, setActiveChatName] = useState("");
  const [activeChatAvatar, setActiveChatAvatar] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageProps[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [showStudyTools, setShowStudyTools] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to access messages");
        navigate("/login");
        return;
      }
      
      setCurrentUser(user);
      loadContacts();
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;
    
    // Subscribe to new messages
    const channel = subscribeToMessages(currentUser.id, (newMessage) => {
      if (activeChat === newMessage.sender_id) {
        // If we're already chatting with this user, add the message to the current list
        const messageToAdd: MessageProps = {
          id: newMessage.id,
          sender: "Contact",
          content: newMessage.content,
          time: new Date(newMessage.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          attachments: newMessage.attachment_url ? [{
            type: (newMessage.attachment_type || "document") as "image" | "audio" | "video" | "document",
            url: newMessage.attachment_url,
            filename: newMessage.attachment_name || "attachment"
          }] : undefined
        };
        
        setMessages(prev => [...prev, messageToAdd]);
      } else {
        // Otherwise, refresh the contacts list to show the new message
        loadContacts();
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, activeChat]);

  useEffect(() => {
    if (activeChat) {
      loadConversation(activeChat);
    }
  }, [activeChat]);

  const loadContacts = async () => {
    setIsLoading(true);
    try {
      const contactsList = await getContacts();
      setContacts(contactsList);
      
      // If no active chat is selected and we have contacts, select the first one
      if (!activeChat && contactsList.length > 0) {
        setActiveChat(contactsList[0].id);
        setActiveChatName(contactsList[0].full_name || contactsList[0].username || "Contact");
        setActiveChatAvatar(contactsList[0].avatar_url);
      }
    } catch (error) {
      console.error("Failed to load contacts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadConversation = async (userId: string) => {
    setIsLoading(true);
    try {
      // Get user info
      const userInfo = await getUserById(userId);
      if (userInfo) {
        setActiveChatName(userInfo.full_name || userInfo.username || "Contact");
        setActiveChatAvatar(userInfo.avatar_url);
      }

      // Get conversation
      const conversation = await getConversation(userId);
      
      // Transform API data to our component's format
      const formattedMessages = conversation.map(msg => ({
        id: msg.id,
        sender: msg.sender_id === currentUser?.id ? "You" : "Contact",
        content: msg.content,
        time: new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        attachments: msg.attachment_url ? [{
          type: (msg.attachment_type || "document") as "image" | "audio" | "video" | "document",
          url: msg.attachment_url,
          filename: msg.attachment_name || "attachment"
        }] : undefined
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to load conversation:", error);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const startCall = (video: boolean) => {
    setIsInCall(true);
    setIsVideoCall(video);
    setIsChatVisible(false);
    toast.success(`${video ? "Video" : "Audio"} call started`);
  };

  const endCall = () => {
    setIsInCall(false);
    setIsVideoCall(false);
    setIsChatVisible(true);
    toast.info("Call ended");
  };

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };

  const handleCreateGroup = (groupId: string, groupName: string) => {
    toast.success(`Group "${groupName}" created successfully!`);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl">Please sign in to access messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="h-screen flex flex-col md:flex-row">
        <div className="md:w-80 flex flex-col">
          <ChatSidebar
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            contacts={contacts}
            onCreateGroup={handleCreateGroup}
            isLoading={isLoading}
          />
        </div>

        <div className="flex-1 flex flex-col">
          {activeChat ? (
            <>
              <ChatHeader
                activeChat={activeChat}
                activeChatName={activeChatName}
                activeChatAvatar={activeChatAvatar}
                isInCall={isInCall}
                startCall={startCall}
                endCall={endCall}
                showStudyTools={showStudyTools}
                setShowStudyTools={setShowStudyTools}
              />

              {isInCall && (
                <CallView
                  isVideoCall={isVideoCall}
                  activeChat={activeChat}
                  getChatName={() => activeChatName}
                  endCall={endCall}
                  toggleChat={toggleChat}
                />
              )}

              {showStudyTools && !isInCall && (
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-900/30">
                  <StudyPomodoroTimer />
                  <CollaborativeNotes sessionId={activeChat} />
                  <div className="md:col-span-2">
                    <StudyFileSharing />
                  </div>
                </div>
              )}

              {(!isInCall || isChatVisible) && (
                <MessageList messages={messages} isLoading={isLoading} />
              )}

              {(!isInCall || isChatVisible) && (
                <MessageInput
                  activeChat={activeChat}
                  isRecording={isRecording}
                  setIsRecording={setIsRecording}
                  onMessageSent={loadConversation}
                />
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center p-8">
                <h2 className="text-2xl font-semibold mb-4 gradient-text">Select a conversation</h2>
                <p className="text-gray-400">Choose a contact from the left sidebar or start a new conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
