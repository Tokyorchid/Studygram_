
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, Users, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatPreview from "./ChatPreview";
import CreateGroupDialog from "./CreateGroupDialog";
import { MessageProps } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ChatSidebarProps {
  activeChat: string;
  setActiveChat: (chatId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  messages: Record<string, MessageProps[]>;
  onCreateGroup: (groupId: string, groupName: string) => void;
}

interface DirectChat {
  user_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
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
  const [activeTab, setActiveTab] = useState<string>("groups");
  const [directChats, setDirectChats] = useState<DirectChat[]>([]);
  const navigate = useNavigate();
  
  // Fetch direct message conversations
  useEffect(() => {
    const fetchDirectChats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get users I've messaged or who have messaged me
      const { data: conversations, error } = await supabase.rpc('get_conversations');
      
      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }

      if (conversations && Array.isArray(conversations)) {
        // Fetch profile details for each contact
        const conversationsWithProfiles = await Promise.all(
          conversations.map(async (conv: any) => {
            const otherUserId = conv.user_id;
            
            const { data: profile } = await supabase
              .from('profiles')
              .select('username, full_name, avatar_url')
              .eq('id', otherUserId)
              .single();
            
            return {
              ...conv,
              username: profile?.username || 'Unknown',
              full_name: profile?.full_name || 'Unknown User',
              avatar_url: profile?.avatar_url
            };
          })
        );
        
        setDirectChats(conversationsWithProfiles);
      }
    };
    
    fetchDirectChats();
    
    // Setup subscription to refresh conversations on new messages
    const channel = supabase
      .channel('direct_messages_updates')
      .on('postgres_changes', { 
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages' 
      }, () => {
        fetchDirectChats();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const getFilteredGroups = () => {
    const allChats = [
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

  const getFilteredDirectChats = () => {
    if (!searchQuery) return directChats;
    
    return directChats.filter(chat => 
      (chat.username && chat.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (chat.full_name && chat.full_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (chat.last_message && chat.last_message.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const handleCreateGroup = (groupId: string, groupName: string) => {
    // Store the group name in localStorage for this demo
    localStorage.setItem(`group-name-${groupId}`, groupName);
    
    // Call the parent handler to create the group in the messages state
    onCreateGroup(groupId, groupName);
  };

  const handleDirectChatClick = (userId: string) => {
    navigate(`/messages?userId=${userId}`);
  };

  return (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-full md:w-80 bg-gray-900/50 backdrop-blur-xl border-r border-purple-500/20 p-4 overflow-y-auto"
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
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-2">
        <TabsList className="grid grid-cols-2 mb-4 bg-gray-800/50">
          <TabsTrigger value="groups" className="data-[state=active]:bg-purple-700">
            <Users className="mr-2 h-4 w-4" />
            Groups
          </TabsTrigger>
          <TabsTrigger value="direct" className="data-[state=active]:bg-purple-700">
            <MessageSquare className="mr-2 h-4 w-4" />
            Direct
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="groups" className="space-y-4">
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={() => setCreateDialogOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create Study Group
          </Button>
          
          <div className="space-y-2">
            {getFilteredGroups().map(chat => (
              <ChatPreview
                key={chat.id}
                name={chat.name}
                lastMessage={chat.lastMessage?.content || "Start chatting..."}
                time={chat.lastMessage?.time || ""}
                active={activeChat === chat.id}
                onClick={() => setActiveChat(chat.id)}
              />
            ))}
            
            {getFilteredGroups().length === 0 && searchQuery && (
              <p className="text-center text-gray-400 py-2">No groups found matching "{searchQuery}"</p>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="direct" className="space-y-2">
          <Button 
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={() => navigate('/messages?tab=find')}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Find Users
          </Button>
          
          {getFilteredDirectChats().length > 0 ? (
            getFilteredDirectChats().map((chat) => (
              <ChatPreview
                key={chat.user_id}
                name={chat.full_name || chat.username || "User"}
                lastMessage={chat.last_message || "Start a conversation..."}
                time={chat.last_message_time ? new Date(chat.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                active={false}
                onClick={() => handleDirectChatClick(chat.user_id)}
                avatar={chat.avatar_url}
              />
            ))
          ) : searchQuery ? (
            <p className="text-center text-gray-400 py-2">No direct messages found matching "{searchQuery}"</p>
          ) : (
            <p className="text-center text-gray-400 py-2">No direct messages yet. Find users to start chatting!</p>
          )}
        </TabsContent>
      </Tabs>
      
      <CreateGroupDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onGroupCreated={handleCreateGroup}
      />
    </motion.div>
  );
};

export default ChatSidebar;
