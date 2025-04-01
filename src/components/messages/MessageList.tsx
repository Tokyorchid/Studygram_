
import React, { useRef, useEffect } from "react";
import Message from "./Message";
import StudyTips from "./StudyTips";
import { MessageProps } from "./types";

interface MessageListProps {
  messages: MessageProps[];
  isLoading?: boolean;
}

const MessageList = ({ messages, isLoading = false }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400">Loading conversation...</p>
          </div>
        </div>
      ) : messages.length > 0 ? (
        <>
          {messages.map((message) => (
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
        </>
      ) : (
        <div className="h-full flex flex-col items-center justify-center">
          <StudyTips />
          <p className="text-gray-400 mt-6">No messages yet. Start the conversation!</p>
        </div>
      )}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
