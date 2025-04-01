
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

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
  is_read: boolean;
}

export interface UserContact {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  lastMessage?: DirectMessage;
}
