
import React from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ChatPreview from "./ChatPreview";
import { MessageProps } from "./types";

interface GroupsTabProps {
  activeChat: string;
  setActiveChat: (chatId: string) => void;
  searchQuery: string;
  createDialogOpen: boolean;
  setCreateDialogOpen: (open: boolean) => void;
  messages: Record<string, MessageProps[]>;
}

interface ChatGroup {
  id: string;
  name: string;
  lastMessage?: MessageProps;
}

const GroupsTab = ({
  activeChat,
  setActiveChat,
  searchQuery,
  createDialogOpen,
  setCreateDialogOpen,
  messages,
}: GroupsTabProps) => {
  const getFilteredGroups = (): ChatGroup[] => {
    const allChats: ChatGroup[] = [
      { id: "study-group-a", name: "Study Group A", lastMessage: messages["study-group-a"]?.slice(-1)[0] },
      { id: "math-squad", name: "Math Squad", lastMessage: messages["math-squad"]?.slice(-1)[0] },
      { id: "science-team", name: "Science Team", lastMessage: messages["science-team"]?.slice(-1)[0] }
    ];
    
    // Add any custom groups that might have been created during the session
    Object.keys(messages).forEach(chatId => {
      if (!allChats.some(chat => chat.id === chatId) && chatId.startsWith("group-")) {
        allChats.push({
          id: chatId,
          name: localStorage.getItem(`group-name-${chatId}`) || chatId,
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

  return (
    <>
      <Button 
        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
        onClick={() => setCreateDialogOpen(true)}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Create Study Group
      </Button>
      
      <div className="space-y-2 mt-4">
        {getFilteredGroups().map(chat => (
          <ChatPreview
            key={chat.id}
            name={chat.name}
            lastMessage={chat.lastMessage?.content || "Start chatting..."}
            time={chat.lastMessage?.time || ""}
            active={activeChat === chat.id}
            onClick={() => setActiveChat(chat.id)}
            avatar=""
          />
        ))}
        
        {getFilteredGroups().length === 0 && searchQuery && (
          <p className="text-center text-gray-400 py-2">No groups found matching "{searchQuery}"</p>
        )}
      </div>
    </>
  );
};

export default GroupsTab;
