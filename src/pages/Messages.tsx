
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { toast } from "sonner";
import ChatSidebar from "@/components/messages/ChatSidebar";
import MessageList from "@/components/messages/MessageList";
import MessageInput from "@/components/messages/MessageInput";
import ChatHeader from "@/components/messages/ChatHeader";
import CollaborativeNotes from "@/components/messages/CollaborativeNotes";
import StudyFileSharing from "@/components/messages/StudyFileSharing";
import StudyPomodoroTimer from "@/components/messages/StudyPomodoroTimer";
import StudyTips from "@/components/messages/StudyTips";
import CallView from "@/components/messages/CallView";
import { MessageProps } from "@/components/messages/types";
import { DirectMessaging } from "@/components/messages/DirectMessaging";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSearch } from "@/components/UserSearch";

const Messages = () => {
  const [activeChat, setActiveChat] = useState("study-group-a");
  const [isInCall, setIsInCall] = useState(false);
  const [showStudyTools, setShowStudyTools] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDM, setActiveDM] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("chats");
  const location = useLocation();
  
  // Track messages state for demo
  const [messages, setMessages] = useState<Record<string, MessageProps[]>>({
    "study-group-a": [
      { id: '1', sender: 'Kai', content: 'Hey everyone! Ready to tackle algebra?', time: '10:30 AM', avatar: '' },
      { id: '2', sender: 'Maya', content: 'Yes! I have some questions about quadratic equations', time: '10:32 AM', avatar: '' },
      { id: '3', sender: 'Taylor', content: 'I found this great reference sheet, let me share it', time: '10:33 AM', avatar: '', attachment: { name: 'algebra_formulas.pdf', type: 'pdf' } },
    ],
    "math-squad": [
      { id: '1', sender: 'Alex', content: 'Did anyone start the calculus assignment yet?', time: '9:15 AM', avatar: '' },
      { id: '2', sender: 'Jordan', content: "I'm halfway through. The integrals are tricky!", time: '9:20 AM', avatar: '' },
    ],
    "science-team": [
      { id: '1', sender: 'Robin', content: 'Lab report due tomorrow - who needs help?', time: '2:45 PM', avatar: '' },
      { id: '2', sender: 'Casey', content: 'Me! Still working on the discussion section', time: '2:50 PM', avatar: '' },
      { id: '3', sender: 'Robin', content: "Let's have a quick call in 15 minutes?", time: '2:52 PM', avatar: '' },
    ]
  });

  useEffect(() => {
    // Check for direct message request from URL params
    const userId = new URLSearchParams(location.search).get('userId');
    if (userId) {
      setActiveDM(userId);
      setActiveTab("direct");
    }
  }, [location]);

  const handleIncomingMessage = (chatId: string, message: MessageProps) => {
    setMessages(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), message]
    }));
  };

  const startCall = (video: boolean) => {
    setIsInCall(true);
    toast.success(`Starting ${video ? "video" : "audio"} call`);
  };

  const endCall = () => {
    setIsInCall(false);
    toast.info("Call ended");
  };

  const handleCreateGroup = (groupId: string, groupName: string) => {
    // Initialize empty message array for new group
    setMessages(prev => ({
      ...prev,
      [groupId]: []
    }));
    
    // Switch to the newly created group
    setActiveChat(groupId);
    toast.success(`Group "${groupName}" created successfully!`);
  };

  const renderChatContent = () => {
    if (activeTab === "direct" && activeDM) {
      return <DirectMessaging />;
    }
    
    if (activeTab === "find") {
      return <UserSearch />;
    }

    if (isInCall) {
      return <CallView endCall={endCall} />;
    }

    return (
      <>
        <div className="flex-grow overflow-y-auto">
          <MessageList messages={messages[activeChat] || []} />
        </div>
        <MessageInput onSendMessage={(content) => {
          const newMessage: MessageProps = {
            id: Date.now().toString(),
            sender: 'You',
            content,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            avatar: '',
            isUser: true
          };
          handleIncomingMessage(activeChat, newMessage);
        }} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-black/90">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto p-4 h-[calc(100vh-4rem)]"
      >
        <div className="flex h-full gap-4 flex-col md:flex-row">
          <ChatSidebar
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            messages={messages}
            onCreateGroup={handleCreateGroup}
          />
          
          <div className="flex-1 flex flex-col h-full">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab} 
              className="w-full"
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="chats">Study Groups</TabsTrigger>
                <TabsTrigger value="direct">Direct Messages</TabsTrigger>
                <TabsTrigger value="find">Find Users</TabsTrigger>
              </TabsList>
              
              <TabsContent value="chats" className="flex flex-col h-full">
                <ChatHeader
                  activeChat={activeChat}
                  isInCall={isInCall}
                  startCall={startCall}
                  endCall={endCall}
                  showStudyTools={showStudyTools}
                  setShowStudyTools={setShowStudyTools}
                />
                
                <div className="flex flex-grow overflow-hidden">
                  <div className="flex-1 flex flex-col">
                    {renderChatContent()}
                  </div>
                  
                  {showStudyTools && (
                    <motion.div
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 300, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="w-[300px] bg-gray-900/50 backdrop-blur-xl border-l border-purple-500/20 p-4 overflow-y-auto"
                    >
                      <div className="space-y-6">
                        <CollaborativeNotes />
                        <StudyPomodoroTimer />
                        <StudyFileSharing />
                        <StudyTips />
                      </div>
                    </motion.div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="direct" className="flex-1 h-full">
                <DirectMessaging />
              </TabsContent>
              
              <TabsContent value="find" className="flex-1">
                <UserSearch />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Messages;
