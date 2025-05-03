import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Mic, Image, FileText, Clock, X, Check } from "lucide-react";
import { MessageProps } from "./types";

interface MessageInputProps {
  activeChat?: string;
  messages?: Record<string, MessageProps[]>;
  setMessages?: React.Dispatch<React.SetStateAction<Record<string, MessageProps[]>>>;
  isRecording?: boolean;
  setIsRecording?: React.Dispatch<React.SetStateAction<boolean>>;
  onSendMessage?: (content: string) => void; // Added this prop
}

const MessageInput = ({ 
  activeChat, 
  messages, 
  setMessages,
  isRecording = false,
  setIsRecording = () => {},
  onSendMessage
}: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      if (onSendMessage) {
        // Use the onSendMessage prop if provided
        onSendMessage(newMessage);
        setNewMessage("");
        return;
      }
      
      // Fallback to original behavior
      if (activeChat && messages && setMessages) {
        const message: MessageProps = {
          id: Date.now().toString(),
          sender: "You",
          content: newMessage,
          time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        };
        
        setMessages({
          ...messages,
          [activeChat]: [...(messages[activeChat] || []), message]
        });
        
        setNewMessage("");
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
  
  return (
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
  );
};

export default MessageInput;
