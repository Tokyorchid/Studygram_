
import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ChatPreview from "./ChatPreview";
import { MessageProps } from "./types";

interface ChatSidebarProps {
  activeChat: string;
  setActiveChat: (chatId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  messages: Record<string, MessageProps[]>;
}

const ChatSidebar = ({ 
  activeChat, 
  setActiveChat, 
  searchQuery, 
  setSearchQuery, 
  messages 
}: ChatSidebarProps) => {
  
  const getFilteredChats = () => {
    const allChats = [
      { id: "study-group-a", name: "Study Group A", lastMessage: messages["study-group-a"].slice(-1)[0] },
      { id: "math-squad", name: "Math Squad", lastMessage: messages["math-squad"].slice(-1)[0] },
      { id: "science-team", name: "Science Team", lastMessage: messages["science-team"].slice(-1)[0] }
    ];
    
    if (!searchQuery) return allChats;
    
    return allChats.filter(chat => 
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.lastMessage?.content && chat.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-full md:w-80 bg-gray-900/50 backdrop-blur-xl border-r border-purple-500/20 p-4"
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 gradient-text">Messages</h1>
        <p className="text-gray-400 text-sm">"Even in the longest winter, your dreams won't freeze"</p>
      </div>
      
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search messages..."
          className="pl-10 bg-gray-800/50 border-gray-700"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        {getFilteredChats().map(chat => (
          <ChatPreview
            key={chat.id}
            name={chat.name}
            lastMessage={chat.lastMessage?.content || "Start chatting..."}
            time={chat.lastMessage?.time || ""}
            active={activeChat === chat.id}
            onClick={() => setActiveChat(chat.id)}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ChatSidebar;
