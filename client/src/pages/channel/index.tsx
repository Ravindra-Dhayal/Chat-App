import { useState, useEffect } from "react";
import { useChannel } from "@/hooks/use-channel";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChannelCreateDialog } from "@/components/channel/channel-create-dialog";
import EmptyState from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import SectionHeader from "@/components/section-header";
import { Search, Plus } from "lucide-react";
import ChannelInviteDialog from "@/components/channel/channel-invite-dialog";

const Channel = () => {
  const {
    channels,
    publicChannels,
    fetchUserChannels,
    fetchPublicChannels,
    isChannelsLoading,
    subscribeToChannel,
    createChannel,
    isCreatingChannel,
  } = useChannel();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [showPublic, setShowPublic] = useState(false);
  const [inviteChannelId, setInviteChannelId] = useState<string | null>(null);

  useEffect(() => {
    fetchUserChannels();
  }, [fetchUserChannels]);

  useEffect(() => {
    if (showPublic) {
      fetchPublicChannels();
    }
  }, [showPublic, fetchPublicChannels]);

  // Handle invite parameter from URL
  useEffect(() => {
    const inviteId = searchParams.get("invite");
    if (inviteId) {
      setInviteChannelId(inviteId);
    }
  }, [searchParams]);

  const handleCloseInvite = () => {
    setInviteChannelId(null);
    // Remove invite param from URL
    searchParams.delete("invite");
    setSearchParams(searchParams);
  };

  const displayChannels = showPublic ? publicChannels?.channels || [] : channels || [];
  const filteredChannels = displayChannels.filter((channel) =>
    (channel.groupName || channel.name || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-screen overflow-y-auto pb-20 bg-background">
      <div className="p-4">
        {/* Header */}
        <SectionHeader
          title="Channels"
          className="mb-6"
          actions={
            <ChannelCreateDialog
              onCreateChannel={createChannel}
              isLoading={isCreatingChannel}
            >
              <button
                className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition-opacity"
                title="Create Channel"
              >
                <Plus className="h-5 w-5" />
              </button>
            </ChannelCreateDialog>
          }
        />

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowPublic(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !showPublic
                ? "bg-primary text-primary-foreground"
                : "bg-base-200 text-base-content/70"
            }`}
          >
            My Channels
          </button>
          <button
            onClick={() => setShowPublic(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showPublic
                ? "bg-primary text-primary-foreground"
                : "bg-base-200 text-base-content/70"
            }`}
          >
            Discover
          </button>
        </div>

        {/* Channels List */}
        {isChannelsLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading channels...</p>
          </div>
        ) : filteredChannels.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {filteredChannels.map((channel) => (
              <div
                key={channel._id}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-base-200"
                onClick={() => !showPublic && navigate(`/channel/${channel._id}`)}
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 relative">
                  <span className="text-lg font-bold text-primary">#</span>
                  {channel.unreadCount && channel.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 bg-primary text-primary-foreground">
                      {channel.unreadCount > 100 ? "99+" : channel.unreadCount}
                    </span>
                  )}
                </div>
                <div
                  className="flex-1 min-w-0"
                  onClick={() => showPublic && navigate(`/channel/${channel._id}`)}
                >
                  <h3 className="font-medium truncate">
                    {channel.groupName || channel.name || "Channel"}
                  </h3>
                  {(channel.lastMessage?.image || channel.lastMessage?.content) && (
                    <p className="text-sm truncate flex items-center gap-1 text-muted-foreground">
                      {channel.lastMessage?.image ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>Image</span>
                        </>
                      ) : (
                        <span>{channel.lastMessage.content}</span>
                      )}
                    </p>
                  )}
                </div>
                {showPublic && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      await subscribeToChannel(channel._id);
                    }}
                    className="text-xs font-medium px-3 py-1 rounded bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  >
                    Subscribe
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Dialog */}
      {inviteChannelId && (
        <ChannelInviteDialog
          channelId={inviteChannelId}
          onClose={handleCloseInvite}
        />
      )}
    </div>
  );
};

export default Channel;
