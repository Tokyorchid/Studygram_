
export interface MessageProps {
  id: string;
  sender: string;
  content: string;
  time: string;
  isStarred?: boolean;
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
