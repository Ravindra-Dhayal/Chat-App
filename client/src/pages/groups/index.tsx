import { useMemo, useEffect, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import EmptyState from "@/components/empty-state";
import { useTheme } from "@/components/theme-provider";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GroupCreateDialog } from "@/components/chat/group-create-dialog";
import SectionHeader from "@/components/section-header";
import GroupInviteDialog from "@/components/group/group-invite-dialog";

const Groups = () => {
  const { chats, fetchChats, isChatsLoading } = useChat();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteGroupId, setInviteGroupId] = useState<string | null>(null);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Handle invite parameter from URL
  useEffect(() => {
    const inviteId = searchParams.get("invite");
    if (inviteId) {
      setInviteGroupId(inviteId);
    }
  }, [searchParams]);

  const handleCloseInvite = () => {
    setInviteGroupId(null);
    // Remove invite param from URL
    searchParams.delete("invite");
    setSearchParams(searchParams);
  };

  // Filter only group chats (exclude channels)
  const groupChats = useMemo(() => {
    return chats?.filter((chat) => chat.isGroup && (chat as any).type !== "CHANNEL") || [];
  }, [chats]);

  // Filter groups by search query
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groupChats;
    return groupChats.filter((chat) =>
      (chat.name || chat.groupName || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [groupChats, searchQuery]);

  return (
    <div className={`h-screen overflow-y-auto pb-20 ${theme === "dark" ? "bg-slate-900" : "bg-white"}`}>
      <div className="p-4">
        {/* Header */}
        <SectionHeader
          title="Groups"
          className="mb-6"
          actions={
            <GroupCreateDialog onGroupCreated={fetchChats}>
              <button
                className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition-opacity"
                title="Create Group"
              >
                <Plus className="h-5 w-5" />
              </button>
            </GroupCreateDialog>
          }
        />

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {isChatsLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading groups...</p>
          </div>
        ) : filteredGroups.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {filteredGroups.map((chat) => (
              <button
                key={chat._id}
                onClick={() => navigate(`/groups/${chat._id}`)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors
                  ${theme === "dark" ? "hover:bg-slate-800" : "hover:bg-gray-100"}`}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-500">👥</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{chat.name || chat.groupName || "Group"}</h3>
                  <p className={`text-sm truncate ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                    {chat.lastMessage?.content || `${chat.participants?.length || 0} members`}
                  </p>
                </div>
                {chat.unreadCount !== undefined && chat.unreadCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                    {chat.unreadCount > 100 ? "99+" : chat.unreadCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Invite Dialog */}
      {inviteGroupId && (
        <GroupInviteDialog groupId={inviteGroupId} onClose={handleCloseInvite} />
      )}
    </div>
  );
};

export default Groups;
