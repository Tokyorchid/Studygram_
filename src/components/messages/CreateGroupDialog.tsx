
import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UsersPlus, X, Plus, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GroupMember } from "./types";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: (groupId: string, groupName: string) => void;
}

const CreateGroupDialog = ({ 
  open, 
  onOpenChange,
  onGroupCreated
}: CreateGroupDialogProps) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<GroupMember[]>([
    { id: "user-1", name: "You" },
    { id: "user-2", name: "Alex" },
  ]);
  const [newMemberName, setNewMemberName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const addMember = () => {
    if (!newMemberName.trim()) return;
    
    const newMember: GroupMember = {
      id: `user-${Date.now()}`, // In a real app, this would be a valid user ID
      name: newMemberName,
    };
    
    setMembers([...members, newMember]);
    setNewMemberName("");
  };
  
  const removeMember = (memberId: string) => {
    setMembers(members.filter(member => member.id !== memberId));
  };
  
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    
    setIsCreating(true);
    
    try {
      // In a production app, we would store this in Supabase
      const groupId = `group-${Date.now()}`;
      const timestamp = new Date().toISOString();
      
      // Create a new group in the database
      // For now, we'll just simulate this
      // In a real app with Supabase:
      /* 
      const { data, error } = await supabase
        .from('chat_groups')
        .insert({
          id: groupId,
          name: groupName,
          description: description,
          created_by: 'user-1', // Current user ID
          created_at: timestamp,
        })
        .select();
        
      if (error) throw error;
      
      // Add members to the group
      const memberInserts = members.map(member => ({
        group_id: groupId,
        user_id: member.id,
        added_at: timestamp
      }));
      
      const { error: membersError } = await supabase
        .from('group_members')
        .insert(memberInserts);
        
      if (membersError) throw membersError;
      */
      
      // For the demo, we'll just simulate success
      toast.success("Group created successfully!");
      onGroupCreated(groupId, groupName);
      onOpenChange(false);
      
      // Reset form
      setGroupName("");
      setDescription("");
      setMembers([{ id: "user-1", name: "You" }]);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group");
    } finally {
      setIsCreating(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addMember();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border border-purple-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl gradient-text">Create Study Group</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new chat group to study together with friends
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="Enter group name..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-gray-800/50 border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What will this group focus on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800/50 border-gray-700 min-h-[80px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Members</Label>
            <div className="bg-gray-800/50 border border-gray-700 rounded-md p-2 max-h-[120px] overflow-y-auto">
              {members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between py-1 px-2 rounded hover:bg-gray-700/50"
                >
                  <span>{member.name}{member.id === "user-1" ? " (You)" : ""}</span>
                  {member.id !== "user-1" && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeMember(member.id)}
                      className="h-6 w-6 rounded-full hover:bg-red-500/20 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Input
              placeholder="Add member by name..."
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              onKeyDown={handleKeyPress}
              className="bg-gray-800/50 border-gray-700"
            />
            <Button 
              onClick={addMember} 
              variant="outline"
              className="border-purple-500/50 hover:bg-purple-500/20"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="hover:bg-gray-700/50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateGroup}
            disabled={isCreating}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            {isCreating ? 
              "Creating..." : 
              <><UsersPlus className="mr-2 h-4 w-4" /> Create Group</>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
