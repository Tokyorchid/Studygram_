
export interface MessageProps {
  id: string;
  sender: string;
  content: string;
  time: string;
  isStarred?: boolean;
  avatar?: string;
  isUser?: boolean;
  attachment?: {
    name: string;
    type: string;
  };
  attachments?: Array<{
    type: "image" | "audio" | "video" | "document";
    url: string;
    filename: string;
  }>;
}

export interface ChatPreviewProps {
  name: string;
  lastMessage: string;
  time: string;
  active?: boolean;
  onClick: () => void;
  avatar?: string;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
}

export interface GroupChat {
  id: string;
  name: string;
  description?: string;
  members: GroupMember[];
  createdBy: string;
  createdAt: string;
}
