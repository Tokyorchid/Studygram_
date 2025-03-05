
import React from "react";
import { ChatPreviewProps } from "./types";

const ChatPreview = ({ name, lastMessage, time, active = false, onClick }: ChatPreviewProps) => (
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

export default ChatPreview;
