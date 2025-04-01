
import { supabase } from "@/integrations/supabase/client";
import { DirectMessage, UserContact } from "@/components/messages/types";
import { toast } from "sonner";

export const getContacts = async (): Promise<UserContact[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Get all users the current user has had conversations with
    const { data: sentMessages, error: sentError } = await supabase
      .from('direct_messages')
      .select('recipient_id')
      .eq('sender_id', user.id)
      .order('created_at', { ascending: false });

    const { data: receivedMessages, error: receivedError } = await supabase
      .from('direct_messages')
      .select('sender_id')
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false });

    if (sentError || receivedError) throw new Error("Failed to fetch contacts");

    // Extract unique user IDs
    const uniqueContactIds = [...new Set([
      ...(sentMessages || []).map(msg => msg.recipient_id),
      ...(receivedMessages || []).map(msg => msg.sender_id)
    ])];

    // Fetch user profiles for these contacts
    const { data: contacts, error: contactsError } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', uniqueContactIds);

    if (contactsError) throw new Error("Failed to fetch contact profiles");

    // For each contact, fetch the latest message
    const contactsWithLastMessage: UserContact[] = [];
    
    for (const contact of contacts || []) {
      const { data: latestMessage, error: messageError } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .or(`sender_id.eq.${contact.id},recipient_id.eq.${contact.id}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!messageError && latestMessage) {
        contactsWithLastMessage.push({
          ...contact,
          lastMessage: latestMessage
        });
      } else {
        contactsWithLastMessage.push(contact);
      }
    }

    return contactsWithLastMessage;
  } catch (error: any) {
    console.error("Error fetching contacts:", error);
    return [];
  }
};

export const getConversation = async (otherUserId: string): Promise<DirectMessage[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from('direct_messages')
      .select('*')
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Mark all unread messages as read
    const { error: updateError } = await supabase
      .from('direct_messages')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('sender_id', otherUserId)
      .eq('is_read', false);

    if (updateError) console.error("Error marking messages as read:", updateError);

    return data || [];
  } catch (error: any) {
    console.error("Error fetching conversation:", error.message);
    toast.error("Failed to load messages");
    return [];
  }
};

export const sendDirectMessage = async (
  recipientId: string, 
  content: string, 
  attachment?: { url: string; type: string; name: string }
): Promise<DirectMessage | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const newMessage = {
      sender_id: user.id,
      recipient_id: recipientId,
      content,
      attachment_url: attachment?.url || null,
      attachment_type: attachment?.type || null,
      attachment_name: attachment?.name || null,
    };

    const { data, error } = await supabase
      .from('direct_messages')
      .insert(newMessage)
      .select('*')
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error sending message:", error.message);
    toast.error("Failed to send message");
    return null;
  }
};

export const subscribeToMessages = (
  userId: string,
  callback: (message: DirectMessage) => void
) => {
  return supabase
    .channel('public:direct_messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `recipient_id=eq.${userId}`
      },
      (payload) => callback(payload.new as DirectMessage)
    )
    .subscribe();
};

export const getUserById = async (userId: string): Promise<UserContact | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error("Error fetching user:", error.message);
    return null;
  }
};

export const followUser = async (userId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from('user_follows')
      .insert({
        follower_id: user.id,
        following_id: userId
      });

    if (error) {
      if (error.code === '23505') { // Unique violation
        toast.info("You are already following this user");
        return true;
      }
      throw error;
    }

    toast.success("You are now following this user");
    return true;
  } catch (error: any) {
    console.error("Error following user:", error.message);
    toast.error("Failed to follow user");
    return false;
  }
};

export const unfollowUser = async (userId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId);

    if (error) throw error;

    toast.success("You have unfollowed this user");
    return true;
  } catch (error: any) {
    console.error("Error unfollowing user:", error.message);
    toast.error("Failed to unfollow user");
    return false;
  }
};

export const isFollowing = async (userId: string): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows returned"
    return !!data;
  } catch (error: any) {
    console.error("Error checking follow status:", error.message);
    return false;
  }
};

export const getUnreadMessageCount = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;

    const { data, error } = await supabase
      .from('direct_messages')
      .select('id', { count: 'exact' })
      .eq('recipient_id', user.id)
      .eq('is_read', false);

    if (error) throw error;
    return data?.length || 0;
  } catch (error: any) {
    console.error("Error fetching unread messages count:", error.message);
    return 0;
  }
};
