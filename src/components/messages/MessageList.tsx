
import React, { useRef, useEffect } from "react";
import Message from "./Message";
import StudyTips from "./StudyTips";
import { MessageProps } from "./types";

interface MessageListProps {
  messages: MessageProps[];
}

const MessageList = ({ messages }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <StudyTips />
      
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
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
