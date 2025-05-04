
import React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatPreview from "./ChatPreview";
import { useNavigate } from "react-router-dom";
import { DirectChat } from "./ChatSidebarTypes";

interface DirectMessagesTabProps {
  searchQuery: string;
  directChats: DirectChat[];
}

const DirectMessagesTab = ({ searchQuery, directChats }: DirectMessagesTabProps) => {
  const navigate = useNavigate();

  const getFilteredDirectChats = () => {
    if (!searchQuery) return directChats;
    
    return directChats.filter(chat => 
      (chat.username && chat.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (chat.full_name && chat.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (chat.last_message && chat.last_message.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const handleDirectChatClick = (userId: string) => {
    navigate(`/messages?userId=${userId}`);
  };

  return (
    <>
      <Button 
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        onClick={() => navigate('/messages?tab=find')}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Find Users
      </Button>
      
      {getFilteredDirectChats().length > 0 ? (
        <div className="space-y-2 mt-4">
          {getFilteredDirectChats().map((chat) => (
            <ChatPreview
              key={chat.user_id}
              name={chat.full_name || chat.username || "User"}
              lastMessage={chat.last_message || "Start a conversation..."}
              time={chat.last_message_time ? new Date(chat.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
              active={false}
              onClick={() => handleDirectChatClick(chat.user_id)}
              avatar={chat.avatar_url || ""}
            />
          ))}
        </div>
      ) : searchQuery ? (
        <p className="text-center text-gray-400 py-2 mt-4">No direct messages found matching "{searchQuery}"</p>
      ) : (
        <p className="text-center text-gray-400 py-2 mt-4">No direct messages yet. Find users to start chatting!</p>
      )}
    </>
  );
};

export default DirectMessagesTab;
