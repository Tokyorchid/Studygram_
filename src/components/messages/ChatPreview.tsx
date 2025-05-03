
import React from "react";
import { ChatPreviewProps } from "./types";
import { User } from "lucide-react";

const ChatPreview = ({ name, lastMessage, time, active = false, onClick, avatar }: ChatPreviewProps) => (
  <div
    className={`p-3 rounded-lg transition-colors cursor-pointer ${
      active
        ? "bg-purple-500/20 text-purple-400"
        : "hover:bg-purple-500/10 text-gray-400"
    }`}
    onClick={onClick}
  >
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <User className="w-4 h-4 text-gray-400" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-medium truncate">{name}</h3>
          <span className="text-xs ml-2 whitespace-nowrap">{time}</span>
        </div>
        <p className="text-sm truncate">{lastMessage}</p>
      </div>
    </div>
  </div>
);

export default ChatPreview;
