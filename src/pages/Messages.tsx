import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { 
  Search, Send, Star, Paperclip, Mic, Video, Phone, 
  Image, FileText, X, Check, Clock, Lightbulb
} from "lucide-react";
import MessageAttachment from "@/components/messages/MessageAttachment";
import CallControls from "@/components/messages/CallControls";
import CollaborativeNotes from "@/components/messages/CollaborativeNotes";
import StudyPomodoroTimer from "@/components/messages/StudyPomodoroTimer";
import StudyFileSharing from "@/components/messages/StudyFileSharing";
import "../styles/gradientText.css";

interface MessageProps {
  id: string;
  sender: string;
  content: string;
  time: string;
  isStarred?: boolean;
  attachments?: Array<{
    type: "image" | "audio" | "video" | "document";
    url: string;
    filename: string;
  }>;
}

const Messages = () => {
  const [activeChat, setActiveChat] = useState("study-group-a");
  const [messages, setMessages] = useState<Record<string, MessageProps[]>>({
    "study-group-a": [
      {
        id: "1",
        sender: "Alex",
        content: "Hey everyone! Ready for our study session?",
        time: "2:30 PM",
        isStarred: true,
      },
      {
        id: "2",
        sender: "You",
        content: "Yes! Let's focus on chapter 5 today",
        time: "2:31 PM",
      },
      {
        id: "3",
        sender: "Sarah",
        content: "Perfect! I had some questions about that chapter",
        time: "2:32 PM",
      },
      {
        id: "4",
        sender: "Alex",
        content: "I've made some notes on the key concepts. Check them out!",
        time: "2:35 PM",
        attachments: [
          {
            type: "document",
            url: "/placeholder.svg",
            filename: "Chapter5_Notes.pdf"
          }
        ]
      }
    ],
    "math-squad": [
      {
        id: "1",
        sender: "Jordan",
        content: "Did everyone finish the homework?",
        time: "1:20 PM",
      },
      {
        id: "2",
        sender: "You",
        content: "I'm stuck on problem 7. Can someone help?",
        time: "1:25 PM",
      }
    ],
    "science-team": [
      {
        id: "1",
        sender: "Taylor",
        content: "Check out this cool experiment!",
        time: "11:30 AM",
        attachments: [
          {
            type: "video",
            url: "/placeholder.svg",
            filename: "lab_experiment.mp4"
          }
        ]
      }
    ]
  });
  
  const [newMessage, setNewMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [showStudyTools, setShowStudyTools] = useState(false);
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startRecording = () => {
    setIsRecording(true);
    console.log("Started audio recording");
  };

  const stopRecording = () => {
    setIsRecording(false);
    console.log("Stopped audio recording");
    
    const newAudioMessage: MessageProps = {
      id: Date.now().toString(),
      sender: "You",
      content: "",
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      attachments: [
        {
          type: "audio",
          url: "/sounds/ambient.mp3",
          filename: "voice_message.mp3"
        }
      ]
    };
    
    setMessages({
      ...messages,
      [activeChat]: [...messages[activeChat], newAudioMessage]
    });
  };

  const startCall = (video: boolean) => {
    setIsInCall(true);
    setIsVideoCall(video);
  };

  const endCall = () => {
    setIsInCall(false);
    setIsVideoCall(false);
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: MessageProps = {
        id: Date.now().toString(),
        sender: "You",
        content: newMessage,
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      };
      
      setMessages({
        ...messages,
        [activeChat]: [...messages[activeChat], message]
      });
      
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("File selected:", files[0].name);
      
      const file = files[0];
      const fileType = file.type.startsWith('image/') 
        ? 'image' 
        : file.type.startsWith('video/') 
          ? 'video' 
          : file.type.startsWith('audio/') 
            ? 'audio' 
            : 'document';
      
      const url = URL.createObjectURL(file);
      
      const newFileMessage: MessageProps = {
        id: Date.now().toString(),
        sender: "You",
        content: "",
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        attachments: [
          {
            type: fileType as "image" | "audio" | "video" | "document",
            url,
            filename: file.name
          }
        ]
      };
      
      setMessages({
        ...messages,
        [activeChat]: [...messages[activeChat], newFileMessage]
      });
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    setShowAttachmentOptions(false);
  };

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

  const getChatName = (chatId: string): string => {
    switch (chatId) {
      case "study-group-a": return "Study Group A";
      case "math-squad": return "Math Squad";
      case "science-team": return "Science Team";
      default: return chatId;
    }
  };

  const getChatMembers = (chatId: string): number => {
    switch (chatId) {
      case "study-group-a": return 4;
      case "math-squad": return 3;
      case "science-team": return 5;
      default: return 2;
    }
  };

  const renderStudyTips = () => {
    const tips = [
      "Use the Pomodoro technique: 25 minutes of focused study, then a 5-minute break.",
      "Share your notes after each session for group feedback.",
      "Ask questions as soon as you encounter confusion - don't wait!",
      "Create a shared vocabulary list for technical terms.",
      "Quiz each other at the end of each study session.",
      "Explain concepts in your own words to solidify understanding."
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    
    return (
      <div className="p-3 bg-purple-900/20 rounded-lg mb-4 flex items-start">
        <Lightbulb className="text-yellow-400 w-5 h-5 mr-2 shrink-0 mt-0.5" />
        <div>
          <div className="font-medium text-yellow-300 text-sm mb-1">Study Tip</div>
          <div className="text-sm text-gray-300">{randomTip}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="h-screen flex flex-col md:flex-row">
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

        <div className="flex-1 flex flex-col">
          <div className="bg-gray-900/50 backdrop-blur-xl border-b border-purple-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold gradient-text">{getChatName(activeChat)}</h2>
                <p className="text-sm text-gray-400">{getChatMembers(activeChat)} members</p>
              </div>
              {!isInCall ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => startCall(false)}>
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => startCall(true)}>
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowStudyTools(!showStudyTools)}
                    className={showStudyTools ? "bg-purple-900/30 text-purple-400" : ""}
                  >
                    Study Tools
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={endCall}>
                  <X className="h-4 w-4 mr-2" /> End Call
                </Button>
              )}
            </div>
          </div>

          {isInCall && (
            <div className="relative flex-1 bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                {isVideoCall ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="relative w-full max-w-3xl aspect-video bg-gray-800 rounded-lg overflow-hidden">
                      <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-700 rounded-lg border-2 border-gray-600 shadow-lg"></div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8">
                    <div className="w-24 h-24 rounded-full bg-purple-800/50 flex items-center justify-center mx-auto mb-4">
                      <Phone className="h-10 w-10" />
                    </div>
                    <h3 className="text-2xl font-semibold mb-2">Group Call</h3>
                    <p className="text-gray-400">Connected to {getChatName(activeChat)}</p>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <CallControls 
                  onEndCall={endCall} 
                  onToggleChat={() => {}} 
                  isVideoCall={isVideoCall}
                />
              </div>
            </div>
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

          {!isInCall && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {renderStudyTips()}
              
              {messages[activeChat].map((message) => (
                <Message
                  key={message.id}
                  id={message.id}
                  sender={message.sender}
                  content={message.content}
                  time={message.time}
                  isStarred={message.isStarred}
                  attachments={message.attachments}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {!isInCall && (
            <div className="bg-gray-900/50 backdrop-blur-xl border-t border-purple-500/20 p-4">
              {showAttachmentOptions && (
                <div className="flex gap-2 mb-3">
                  <label className="cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-purple-800/50 flex items-center justify-center hover:bg-purple-700/60">
                      <Image className="h-5 w-5" />
                    </div>
                    <input 
                      type="file" 
                      className="hidden" 
                      ref={fileInputRef}
                      accept="image/*,video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleImageUpload}
                    />
                  </label>
                  <div className="h-10 w-10 rounded-full bg-purple-800/50 flex items-center justify-center hover:bg-purple-700/60 cursor-pointer">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-purple-800/50 flex items-center justify-center hover:bg-purple-700/60 cursor-pointer">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 items-end">
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-10 w-10"
                  onClick={() => setShowAttachmentOptions(!showAttachmentOptions)}
                >
                  <Paperclip className="h-5 w-5" />
                </Button>
                
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    className="bg-gray-800/50 border-gray-700 min-h-[60px] max-h-32"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                  />
                </div>
                
                {!isRecording ? (
                  <>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full h-10 w-10"
                      onClick={startRecording}
                    >
                      <Mic className="h-5 w-5" />
                    </Button>
                    
                    <Button 
                      type="button" 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-10 w-10"
                      onClick={handleSendMessage}
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="text-red-500 animate-pulse">Recording...</div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="rounded-full"
                      onClick={stopRecording}
                    >
                      <Check className="h-5 w-5" />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      className="rounded-full"
                      onClick={() => setIsRecording(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ChatPreview = ({ name, lastMessage, time, active = false, onClick }) => (
  <div
    className={`p-3 rounded-lg transition-colors cursor-pointer ${
      active
        ? "bg-purple-500/20 text-purple-400"
        : "hover:bg-purple-500/10 text-gray-400"
    }`}
    onClick={onClick}
  >
    <div className="flex justify-between items-start mb-1">
      <h3 className="font-medium">{name}</h3>
      <span className="text-xs">{time}</span>
    </div>
    <p className="text-sm truncate">{lastMessage}</p>
  </div>
);

const Message = ({ sender, content, time, isStarred = false, attachments = [] }: MessageProps) => (
  <div className="flex items-start gap-2">
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className={`font-medium ${sender === "You" ? "gradient-text" : "text-white"}`}>{sender}</span>
        <span className="text-xs text-gray-400">{time}</span>
        {isStarred && <Star className="w-4 h-4 text-yellow-500" />}
      </div>
      {content && <p className="text-gray-300 mb-2">{content}</p>}
      
      {attachments && attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment, index) => (
            <MessageAttachment
              key={index}
              type={attachment.type}
              url={attachment.url}
              filename={attachment.filename}
            />
          ))}
        </div>
      )}
    </div>
  </div>
);

export default Messages;
