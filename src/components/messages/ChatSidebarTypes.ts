
import { MessageProps } from "./types";

export interface ChatSidebarProps {
  activeChat: string;
  setActiveChat: (chatId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  messages: Record<string, MessageProps[]>;
  onCreateGroup: (groupId: string, groupName: string) => void;
}

export interface DirectChat {
  user_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  last_message?: string;
  last_message_time?: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  lastMessage?: MessageProps;
}

// Define conversation type returned from Supabase RPC
export interface Conversation {
  user_id: string;
  last_message?: string;
  last_message_time?: string;
}
