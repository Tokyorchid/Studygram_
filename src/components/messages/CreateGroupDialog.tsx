
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Check, Plus, Search, UserPlus, X } from "lucide-react";
import { GroupMember } from "./types";

interface CreateGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGroupCreated: (groupId: string, groupName: string) => void;
}

const CreateGroupDialog = ({ open, onOpenChange, onGroupCreated }: CreateGroupDialogProps) => {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<GroupMember[]>([]);
  
  // Mock users - in a real app, this would come from your database
  const mockUsers: GroupMember[] = [
    { id: "user1", name: "Alex Johnson", avatar: "/placeholder.svg" },
    { id: "user2", name: "Taylor Swift", avatar: "/placeholder.svg" },
    { id: "user3", name: "Morgan Freeman", avatar: "/placeholder.svg" },
    { id: "user4", name: "Emma Watson", avatar: "/placeholder.svg" },
    { id: "user5", name: "Keanu Reeves", avatar: "/placeholder.svg" },
  ];
  
  const filteredUsers = mockUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedMembers.some(member => member.id === user.id)
  );
  
  const handleSelectMember = (member: GroupMember) => {
    setSelectedMembers([...selectedMembers, member]);
  };
  
  const handleRemoveMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter(member => member.id !== memberId));
  };
  
  const handleCreateGroup = () => {
    if (!groupName.trim()) return;
    
    const groupId = `group-${Date.now()}`;
    onGroupCreated(groupId, groupName);
    
    // Reset form
    setGroupName("");
    setDescription("");
    setSelectedMembers([]);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border border-purple-500/20 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold gradient-text">Create Study Group</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input 
              id="group-name" 
              placeholder="Enter group name..." 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-gray-800 border-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea 
              id="description" 
              placeholder="What's this group about?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-gray-800 border-gray-700 min-h-[100px]"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Add Members</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search for classmates..."
                className="pl-10 bg-gray-800 border-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Selected members */}
            {selectedMembers.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedMembers.map(member => (
                  <div 
                    key={member.id}
                    className="bg-purple-500/20 rounded-full px-3 py-1 flex items-center gap-2"
                  >
                    <span className="text-sm">{member.name}</span>
                    <button 
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* User search results */}
            {searchTerm && (
              <ScrollArea className="h-[150px] mt-2 rounded-md border border-gray-700 bg-gray-800/50">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-gray-400 text-center">No users found</div>
                ) : (
                  <div className="p-2">
                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        className="w-full text-left p-2 hover:bg-gray-700/50 rounded-md flex items-center gap-3"
                        onClick={() => handleSelectMember(user)}
                      >
                        <Avatar>
                          <img src={user.avatar} alt={user.name} />
                        </Avatar>
                        <span>{user.name}</span>
                        <Plus size={16} className="ml-auto text-gray-400" />
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="border-gray-700 text-gray-300"
          >
            Cancel
          </Button>
          <Button 
            disabled={!groupName.trim()} 
            onClick={handleCreateGroup}
            className="bg-gradient-to-r from-purple-500 to-pink-500"
          >
            Create Group
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
