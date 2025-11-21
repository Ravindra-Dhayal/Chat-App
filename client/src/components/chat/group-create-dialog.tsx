import { memo, useEffect, useState, type ReactNode } from "react";
import { useChat } from "@/hooks/use-chat";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Button } from "../ui/button";
import { Search, UsersIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import type { UserType } from "../../types/auth.type";
import AvatarWithBadge from "../avatar-with-badge";
import { Checkbox } from "../ui/checkbox";
import { useNavigate } from "react-router-dom";

interface GroupCreateDialogProps {
  children: ReactNode;
  onGroupCreated?: (groupId?: string) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const GroupCreateDialog = memo(({ children, onGroupCreated, isOpen: controlledIsOpen, onOpenChange }: GroupCreateDialogProps) => {
  const navigate = useNavigate();
  const { fetchAllUsers, users, isUsersLoading, createChat, isCreatingChat } = useChat();

  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchAllUsers();
    }
  }, [isOpen, fetchAllUsers]);

  const toggleUserSelection = (id: string) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const resetState = () => {
    setGroupName("");
    setSelectedUsers([]);
    setSearchQuery("");
  };

  const handleOpenChange = (open: boolean) => {
    if (controlledIsOpen !== undefined) {
      onOpenChange?.(open);
    } else {
      setInternalIsOpen(open);
    }
    if (!open) {
      resetState();
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUsers?.length === 0) return;
    
    try {
      const response = await createChat({
        isGroup: true,
        participants: selectedUsers,
        groupName: groupName,
      });
      
      setIsOpen(false);
      resetState();
      
      if (response?._id) {
        onGroupCreated?.(response._id);
        navigate(`/groups/${response._id}`);
      }
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const filteredUsers = users?.filter((user) =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        align="start" 
        className="w-[450px] z-[999] p-0 rounded-xl max-h-[80vh] flex flex-col"
      >
        <div className="border-b p-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            Create New Group
          </h3>
        </div>

        <div className="space-y-4 p-4 flex-1 overflow-hidden flex flex-col">
          {/* Group Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Group Name</label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              maxLength={50}
            />
          </div>

          {/* User Search */}
          <div className="space-y-2 flex-1 flex flex-col overflow-hidden">
            <label className="text-sm font-medium">
              Add Members ({selectedUsers.length} selected)
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-10"
              />
            </div>

            {/* Users List */}
            <div className="flex-1 overflow-y-auto border rounded-lg p-2 space-y-1">
              {isUsersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spinner className="w-6 h-6" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <GroupUserItem
                    key={user._id}
                    user={user}
                    isSelected={selectedUsers.includes(user._id)}
                    onToggle={toggleUserSelection}
                  />
                ))
              )}
            </div>
          </div>

          {/* Create Button */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              className="flex-1"
              disabled={isCreatingChat}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGroup}
              className="flex-1"
              disabled={
                isCreatingChat ||
                !groupName.trim() ||
                selectedUsers.length === 0
              }
            >
              {isCreatingChat && <Spinner className="w-4 h-4 mr-2" />}
              Create Group
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
});

GroupCreateDialog.displayName = "GroupCreateDialog";

const GroupUserItem = memo(
  ({
    user,
    isSelected,
    onToggle,
  }: {
    user: UserType;
    isSelected: boolean;
    onToggle: (id: string) => void;
  }) => (
    <label
      role="button"
      className="w-full flex items-center gap-3 p-2
      rounded-md hover:bg-accent
       transition-colors text-left cursor-pointer
      "
    >
      <AvatarWithBadge name={user.name} src={user.avatar ?? ""} />
      <div className="flex-1 min-w-0">
        <h5 className="text-sm font-medium truncate">{user.name}</h5>
        <p className="text-xs text-muted-foreground truncate">
          {user.email || "Hey there! I'm using chat"}
        </p>
      </div>
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(user._id)}
      />
    </label>
  )
);

GroupUserItem.displayName = "GroupUserItem";
