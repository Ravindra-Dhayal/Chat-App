import { memo, useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  LogOut,
  Trash2,
  X,
} from "lucide-react";
import { useTheme } from "../theme-provider";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { API } from "@/lib/axios-client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import type { ChatType } from "@/types/chat.type";
import type { UserType } from "@/types/auth.type";
import { AddMemberDialog } from "./add-member-dialog";
import { DeleteGroupDialog } from "./delete-group-dialog";
import { ViewMembersDialog } from "./view-members-dialog";

interface GroupManagementPanelProps {
  group: ChatType;
  isOpen: boolean;
  onClose: () => void;
  isAdmin?: boolean;
}

export const GroupManagementPanel = memo(
  ({ group, isOpen, onClose, isAdmin = false }: GroupManagementPanelProps) => {
    const { theme } = useTheme();
    const { user } = useAuth();
    const { deleteChat } = useChat();
    const navigate = useNavigate();
  const [showAddMember, setShowAddMember] = useState(false);
  const [showViewMembers, setShowViewMembers] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [members, setMembers] = useState<UserType[]>(group.participants || []);
  const [admins, setAdmins] = useState<string[]>(
    (group.admins || []).map((a: any) => (typeof a === 'string' ? a : a._id))
  );    // Update members when group changes
    useEffect(() => {
      setMembers(group.participants || []);
    }, [group.participants]);

    const handleRemoveMember = async (userId: string) => {
      try {
        await API.post(`/chat/${group._id}/remove-member`, { userId });
        setMembers(members.filter((m) => m._id !== userId));
        toast.success("Member removed from group");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to remove member");
      }
    };

    const handlePromoteToAdmin = async (userId: string) => {
      try {
        await API.post(`/chat/${group._id}/promote-member`, { userId });
        // Update admin list locally
        setAdmins([...admins, userId]);
        toast.success("Member promoted to admin");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to promote member");
      }
    };

    const handleDeleteGroup = async () => {
      console.log("Delete group called for:", group._id);
      setIsDeleting(true);
      try {
        const success = await deleteChat(group._id);
        console.log("Delete result:", success);
        setIsDeleting(false);
        
        if (success) {
          setShowDeleteDialog(false);
          onClose();
          navigate("/groups");
        }
      } catch (error) {
        console.error("Delete error:", error);
        setIsDeleting(false);
      }
    };

    const handleAddMembers = async () => {
      // Refetch the group to get updated members
      try {
        const { data } = await API.get(`/chat/${group._id}`);
        setMembers(data.chat.participants || []);
        setAdmins(
          (data.chat.admins || []).map((a: any) => (typeof a === 'string' ? a : a._id))
        );
      } catch (error) {
        console.error("Failed to refetch group:", error);
      }
    };

    const handleExitGroup = async () => {
      try {
        await API.post(`/chat/${group._id}/remove-member`, { userId: user?._id });
        toast.success("Left group successfully");
        onClose();
        navigate("/groups");
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Failed to leave group");
      }
    };

    if (!isOpen) return null;

    const menuItems = [
      // Show "Add members" for admins only
      ...(isAdmin ? [{
        icon: UserPlus,
        label: "Add members",
        onClick: () => {
          console.log("Add members button clicked");
          setShowAddMember(true);
        },
      }] : []),
      {
        icon: Users,
        label: "View members",
        onClick: () => {
          console.log("View members button clicked");
          setShowViewMembers(true);
        },
      },
      // Show "Exit group" for non-admins
      ...(!isAdmin ? [{
        icon: LogOut,
        label: "Exit group",
        onClick: handleExitGroup,
        danger: true,
      }] : []),
      // Show "Delete group" for admins
      ...(isAdmin ? [{
        icon: Trash2,
        label: "Delete group",
        onClick: () => {
          console.log("Delete group button clicked");
          setShowDeleteDialog(true);
        },
        danger: true,
      }] : []),
    ];

    return (
      <>
        {/* Full Screen Panel */}
        <div
          className={`fixed inset-0 z-[100] 
            animate-in slide-in-from-right duration-300
            ${theme === "dark" ? "bg-slate-900" : "bg-white"}`}
        >
          {/* Header */}
          <div className="flex items-center gap-4 p-4 border-b">
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Close panel"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-semibold">Group info</h2>
          </div>

          {/* Content */}
          <>
            {/* Group Profile Section */}
            <div className="flex flex-col items-center p-6 border-b">
              <div className="w-32 h-32 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                <span className="text-5xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-center mb-1">
                {group.name || group.groupName || "Group"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Group · {members.length} members
              </p>
            </div>

            {/* Menu Items */}
            <div className="p-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg
                      transition-colors text-left
                      ${
                        item.danger
                          ? "hover:bg-destructive/10 text-destructive"
                          : theme === "dark"
                            ? "hover:bg-slate-800"
                            : "hover:bg-gray-100"
                      }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </>
        </div>

        {/* Add Member Dialog */}
        <AddMemberDialog
          isOpen={showAddMember}
          onClose={() => setShowAddMember(false)}
          currentMembers={members}
          onMembersAdded={handleAddMembers}
          groupId={group._id}
        />

        {/* View Members Dialog */}
        <ViewMembersDialog
          isOpen={showViewMembers}
          onClose={() => setShowViewMembers(false)}
          members={members}
          admins={admins}
          currentUserId={user?._id}
          isAdmin={isAdmin}
          onRemoveMember={handleRemoveMember}
          onPromoteToAdmin={handlePromoteToAdmin}
        />

        {/* Delete Group Dialog */}
        <DeleteGroupDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteGroup}
          groupName={group.name || group.groupName || "Group"}
          isLoading={isDeleting}
        />
      </>
    );
  }
);

GroupManagementPanel.displayName = "GroupManagementPanel";
