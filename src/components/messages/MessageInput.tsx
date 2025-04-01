
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send, Mic, Image, FileText, Clock, X, Check } from "lucide-react";
import { sendDirectMessage } from "@/services/directMessageService";
import { toast } from "sonner";

interface MessageInputProps {
  activeChat: string;
  isRecording: boolean;
  setIsRecording: React.Dispatch<React.SetStateAction<boolean>>;
  onMessageSent: (chatId: string) => void;
}

const MessageInput = ({ 
  activeChat, 
  isRecording,
  setIsRecording,
  onMessageSent
}: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "" || isSending || !activeChat) return;

    setIsSending(true);
    try {
      const sent = await sendDirectMessage(activeChat, newMessage.trim());
      if (sent) {
        setNewMessage("");
        onMessageSent(activeChat);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
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

  const stopRecording = async () => {
    setIsRecording(false);
    console.log("Stopped audio recording");
    
    setIsSending(true);
    try {
      const sent = await sendDirectMessage(
        activeChat, 
        "Voice message",
        {
          url: "/sounds/ambient.mp3",
          type: "audio",
          name: "voice_message.mp3"
        }
      );
      
      if (sent) {
        onMessageSent(activeChat);
      }
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast.error("Failed to send voice message");
    } finally {
      setIsSending(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      
      setIsSending(true);
      try {
        const sent = await sendDirectMessage(
          activeChat,
          fileType === 'image' ? "📷 Image" : 
          fileType === 'video' ? "🎥 Video" : 
          fileType === 'audio' ? "🎵 Audio" : 
          "📄 Document",
          {
            url,
            type: fileType,
            name: file.name
          }
        );
        
        if (sent) {
          onMessageSent(activeChat);
        }
      } catch (error) {
        console.error("Error sending file:", error);
        toast.error("Failed to send file");
      } finally {
        setIsSending(false);
      }
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
          disabled={isSending}
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
            disabled={isRecording || isSending}
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
              disabled={isSending}
            >
              <Mic className="h-5 w-5" />
            </Button>
            
            <Button 
              type="button" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full h-10 w-10"
              onClick={handleSendMessage}
              disabled={newMessage.trim() === "" || isSending}
            >
              {isSending ? (
                <div className="h-4 w-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
              ) : (
                <Send className="h-5 w-5" />
              )}
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
