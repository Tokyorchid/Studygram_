import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatPreview from "./ChatPreview";
import CreateGroupDialog from "./CreateGroupDialog";
import { UserContact } from "./types";

interface ChatSidebarProps {
  activeChat: string | null;
  setActiveChat: (chatId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  contacts: UserContact[];
  onCreateGroup: (groupId: string, groupName: string) => void;
  isLoading: boolean;
}

const ChatSidebar = ({ 
  activeChat, 
  setActiveChat, 
  searchQuery, 
  setSearchQuery, 
  contacts,
  onCreateGroup,
  isLoading
}: ChatSidebarProps) => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  const getFilteredContacts = () => {
    if (!searchQuery) return contacts;
    
    return contacts.filter(contact => {
      const fullName = contact.full_name?.toLowerCase() || '';
      const username = contact.username?.toLowerCase() || '';
      const lastMessageContent = contact.lastMessage?.content.toLowerCase() || '';
      const searchTerm = searchQuery.toLowerCase();
      
      return fullName.includes(searchTerm) || 
             username.includes(searchTerm) ||
             lastMessageContent.includes(searchTerm);
    });
  };

  const formatTime = (timestamp: string | undefined) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Same day, return time
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }
    
    // Yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    
    // This week (last 7 days)
    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return date.toLocaleDateString(undefined, { weekday: 'short' });
    }
    
    // Otherwise return date
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
          </div>
        ) : getFilteredContacts().length > 0 ? (
          getFilteredContacts().map(contact => (
            <ChatPreview
              key={contact.id}
              name={contact.full_name || contact.username || "User"}
              lastMessage={contact.lastMessage?.content || "Start chatting..."}
              time={formatTime(contact.lastMessage?.created_at)}
              active={activeChat === contact.id}
              onClick={() => setActiveChat(contact.id)}
            />
          ))
        ) : (
          <div className="text-center py-6 text-gray-400">
            {searchQuery ? (
              <p>No results found for "{searchQuery}"</p>
            ) : (
              <p>No conversations yet. Use the search to find users.</p>
            )}
          </div>
        )}
      </div>
      
      <CreateGroupDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onGroupCreated={onCreateGroup}
      />
    </motion.div>
  );
};

export default ChatSidebar;
