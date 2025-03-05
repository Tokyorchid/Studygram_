
import { useState } from "react";
import { toast } from "sonner";
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
  
  const [isInCall, setIsInCall] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [showStudyTools, setShowStudyTools] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);

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

  const getChatName = (chatId: string): string => {
    switch (chatId) {
      case "study-group-a": return "Study Group A";
      case "math-squad": return "Math Squad";
      case "science-team": return "Science Team";
      default: return chatId;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="h-screen flex flex-col md:flex-row">
        <ChatSidebar
          activeChat={activeChat}
          setActiveChat={setActiveChat}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          messages={messages}
        />

        <div className="flex-1 flex flex-col">
          <ChatHeader
            activeChat={activeChat}
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
              getChatName={getChatName}
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
            <MessageList messages={messages[activeChat]} />
          )}

          {(!isInCall || isChatVisible) && (
            <MessageInput
              activeChat={activeChat}
              messages={messages}
              setMessages={setMessages}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
