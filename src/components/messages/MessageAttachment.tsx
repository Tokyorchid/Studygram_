
import React from "react";
import { FileText, Image, Mic, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

type AttachmentType = "image" | "audio" | "video" | "document";

interface MessageAttachmentProps {
  type: AttachmentType;
  url: string;
  filename: string;
}

const MessageAttachment = ({ type, url, filename }: MessageAttachmentProps) => {
  // Icon mapping based on attachment type
  const getIcon = () => {
    switch (type) {
      case "image":
        return <Image className="w-5 h-5" />;
      case "audio":
        return <Mic className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "document":
        return <FileText className="w-5 h-5" />;
    }
  };

  // Content rendering based on attachment type
  const renderContent = () => {
    switch (type) {
      case "image":
        return (
          <div className="relative group">
            <img
              src={url}
              alt={filename}
              className="w-full max-h-64 object-contain rounded-md cursor-pointer"
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
              <Button variant="ghost" size="sm" className="text-white">
                View Full
              </Button>
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="p-2 bg-gray-800/50 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              {getIcon()}
              <span className="text-sm truncate">{filename}</span>
            </div>
            <audio controls className="w-full" src={url} />
          </div>
        );
      case "video":
        return (
          <div className="rounded-md overflow-hidden">
            <video controls className="w-full max-h-64" src={url} />
          </div>
        );
      case "document":
        return (
          <div className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-md hover:bg-gray-700/50 transition-colors cursor-pointer">
            {getIcon()}
            <span className="truncate">{filename}</span>
          </div>
        );
    }
  };

  return <div className="mb-2">{renderContent()}</div>;
};

export default MessageAttachment;
