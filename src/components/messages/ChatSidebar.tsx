
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatPreview from "./ChatPreview";
import CreateGroupDialog from "./CreateGroupDialog";
import { MessageProps } from "./types";

interface ChatSidebarProps {
  activeChat: string;
  setActiveChat: (chatId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  messages: Record<string, MessageProps[]>;
  onCreateGroup: (groupId: string, groupName: string) => void;
}

const ChatSidebar = ({ 
  activeChat, 
  setActiveChat, 
  searchQuery, 
  setSearchQuery, 
  messages,
  onCreateGroup
}: ChatSidebarProps) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const getFilteredChats = () => {
    const allChats = [
      { id: "study-group-a", name: "Study Group A", lastMessage: messages["study-group-a"]?.slice(-1)[0] },
      { id: "math-squad", name: "Math Squad", lastMessage: messages["math-squad"]?.slice(-1)[0] },
      { id: "science-team", name: "Science Team", lastMessage: messages["science-team"]?.slice(-1)[0] }
    ];
    
    // Add any custom groups that might have been created during the session
    Object.keys(messages).forEach(chatId => {
      if (!allChats.some(chat => chat.id === chatId)) {
        allChats.push({
          id: chatId,
          name: chatId.startsWith("group-") ? localStorage.getItem(`group-name-${chatId}`) || chatId : chatId,
          lastMessage: messages[chatId]?.slice(-1)[0]
        });
      }
    });
    
    if (!searchQuery) return allChats;
    
    return allChats.filter(chat => 
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.lastMessage?.content && chat.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const handleCreateGroup = (groupId: string, groupName: string) => {
    // Store the group name in localStorage for this demo
    localStorage.setItem(`group-name-${groupId}`, groupName);
    
    // Call the parent handler to create the group in the messages state
    onCreateGroup(groupId, groupName);
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
      
      <div className="space-y-2 mb-6">
        <Button 
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
          onClick={() => setCreateDialogOpen(true)}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Create Study Group
        </Button>
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
      
      <CreateGroupDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onGroupCreated={handleCreateGroup}
      />
    </motion.div>
  );
};

export default ChatSidebar;
