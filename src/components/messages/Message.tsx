
import React from "react";
import { Star } from "lucide-react";
import MessageAttachment from "./MessageAttachment";
import { MessageProps } from "./types";
import "../../styles/gradientText.css";

const Message = ({ id, sender, content, time, isStarred = false, attachments = [] }: MessageProps) => (
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

export default Message;
