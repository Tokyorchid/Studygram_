
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Users, MessageSquare } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreateGroupDialog from "./CreateGroupDialog";
import { supabase } from "@/integrations/supabase/client";
import GroupsTab from "./GroupsTab";
import DirectMessagesTab from "./DirectMessagesTab";
import { ChatSidebarProps, DirectChat, Conversation } from "./ChatSidebarTypes";

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
  
  // Fetch direct message conversations
  useEffect(() => {
    const fetchDirectChats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get users I've messaged or who have messaged me
      const { data: conversations, error } = await supabase.rpc('get_conversations') as { 
        data: Conversation[] | null, 
        error: any 
      };
      
      if (error) {
        console.error("Error fetching conversations:", error);
        return;
      }

      if (conversations && Array.isArray(conversations)) {
        // Fetch profile details for each contact
        const conversationsWithProfiles = await Promise.all(
          conversations.map(async (conv: Conversation) => {
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
              avatar_url: profile?.avatar_url || ""
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
          <GroupsTab
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            searchQuery={searchQuery}
            createDialogOpen={createDialogOpen}
            setCreateDialogOpen={setCreateDialogOpen}
            messages={messages}
          />
        </TabsContent>
        
        <TabsContent value="direct" className="space-y-2">
          <DirectMessagesTab
            searchQuery={searchQuery}
            directChats={directChats}
          />
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
