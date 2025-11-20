import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCommunity } from "@/hooks/use-community";
import { useChannel } from "@/hooks/use-channel";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import EmptyState from "@/components/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Users, Hash, ArrowLeft, Plus } from "lucide-react";
import { GroupCreateDialog } from "@/components/chat/group-create-dialog";
import { ChannelCreateDialog } from "@/components/channel/channel-create-dialog";

const SingleCommunity = () => {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentCommunity, getCommunityService, addChatToCommunity } = useCommunity();
  const { createChannel } = useChannel();
  const { theme } = useTheme();

  useEffect(() => {
    if (!communityId) return;
    getCommunityService(communityId);
  }, [communityId, getCommunityService]);

  const isAdmin = currentCommunity?.admins?.some((admin: any) => {
    const adminId = typeof admin === 'string' ? admin : admin?._id;
    return adminId === user?._id;
  });

  const handleCreateChannel = async (data: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => {
    if (!communityId) return null;
    
    const channel = await createChannel(data);
    if (channel) {
      // Add the channel to the community
      await addChatToCommunity(communityId, channel._id, "CHANNEL");
      // Refresh community data
      await getCommunityService(communityId);
    }
    return channel;
  };

  const handleGroupCreated = async (groupId?: string) => {
    if (!communityId || !groupId) return;
    
    // Add the group to the community
    await addChatToCommunity(communityId, groupId, "GROUP");
    // Refresh community data
    await getCommunityService(communityId);
  };

  if (!currentCommunity) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="w-11 h-11 !text-primary" />
      </div>
    );
  }

  const groupChats = currentCommunity.groups || [];
  const channelChats = currentCommunity.channels || [];

  return (
    <div className={`h-screen overflow-y-auto pb-20 ${theme === "dark" ? "bg-slate-900" : "bg-white"}`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/community")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{currentCommunity.name}</h1>
            {currentCommunity.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentCommunity.description}
              </p>
            )}
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <GroupCreateDialog onGroupCreated={handleGroupCreated}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Group
                </Button>
              </GroupCreateDialog>
              <ChannelCreateDialog onCreateChannel={handleCreateChannel}>
                <Button size="sm" variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Channel
                </Button>
              </ChannelCreateDialog>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-slate-800" : "bg-gray-100"}`}>
            <div className="text-2xl font-bold">{currentCommunity.members?.length || 0}</div>
            <div className="text-xs text-muted-foreground">Members</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-slate-800" : "bg-gray-100"}`}>
            <div className="text-2xl font-bold">{groupChats.length}</div>
            <div className="text-xs text-muted-foreground">Groups</div>
          </div>
          <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-slate-800" : "bg-gray-100"}`}>
            <div className="text-2xl font-bold">{channelChats.length}</div>
            <div className="text-xs text-muted-foreground">Channels</div>
          </div>
        </div>

        {/* Groups Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Users className="h-5 w-5" />
            Groups
          </h2>
          {groupChats.length > 0 && (
            <div className="space-y-2">
              {groupChats.map((groupId) => (
                <button
                  key={groupId}
                  onClick={() => navigate(`/chat/${groupId}`)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors
                    ${theme === "dark" ? "hover:bg-slate-800" : "hover:bg-gray-100"}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Users className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">Group {groupId.slice(-6)}</h3>
                    <p className="text-sm text-muted-foreground">Tap to open</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Channels Section */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-3">
            <Hash className="h-5 w-5" />
            Channels
          </h2>
          {channelChats.length > 0 && (
            <div className="space-y-2">
              {channelChats.map((channelId) => (
                <button
                  key={channelId}
                  onClick={() => navigate(`/channel/${channelId}`)}
                  className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors
                    ${theme === "dark" ? "hover:bg-slate-800" : "hover:bg-gray-100"}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Hash className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">Channel {channelId.slice(-6)}</h3>
                    <p className="text-sm text-muted-foreground">Tap to open</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {groupChats.length === 0 && channelChats.length === 0 && (
          <EmptyState
            title="No content yet"
            description="This community doesn't have any groups or channels yet"
          />
        )}
      </div>
    </div>
  );
};

export default SingleCommunity;
