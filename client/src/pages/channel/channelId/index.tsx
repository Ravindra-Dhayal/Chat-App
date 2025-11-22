import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChannel } from "@/hooks/use-channel";
import { useSocket } from "@/hooks/use-socket";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { API } from "@/lib/axios-client";
import ChatBody from "@/components/chat/chat-body";
import ChatFooter from "@/components/chat/chat-footer";
import { ChannelHeader } from "@/components/channel/channel-header";
import { ChannelManagementPanel } from "@/components/channel/channel-management-panel";
import EmptyState from "@/components/empty-state";
import { Spinner } from "@/components/ui/spinner";

const SingleChannel = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const navigate = useNavigate();
  const { currentChannel, fetchChannelInfo, isFetchingSubscribers } = useChannel();
  const { fetchSingleChat, singleChat, isSingleChatLoading } = useChat();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  const currentUserId = user?._id || null;
  const messages = singleChat?.messages || [];

  // Fetch channel info
  useEffect(() => {
    if (!channelId) return;
    fetchChannelInfo(channelId);
  }, [channelId, fetchChannelInfo]);

  // Fetch channel messages (channels are stored as chats)
  useEffect(() => {
    if (!channelId) return;
    fetchSingleChat(channelId);
  }, [channelId, fetchSingleChat]);

  // Mark channel as read when opened
  useEffect(() => {
    if (!channelId) return;
    
    const markAsRead = async () => {
      try {
        await API.post(`/channel/${channelId}/mark-as-read`);
      } catch (error) {
        console.error("Failed to mark channel as read:", error);
      }
    };

    markAsRead();
  }, [channelId]);

  // Socket: Join channel room
  useEffect(() => {
    if (!channelId || !socket) return;

    socket.emit("channel:subscribe", channelId, (err?: string) => {
      if (err) {
        console.error("Failed to join channel:", err);
      }
    });

    // Also join chat room for messages
    socket.emit("chat:join", channelId);

    return () => {
      socket.emit("channel:unsubscribe", channelId);
      socket.emit("chat:leave", channelId);
    };
  }, [channelId, socket]);

  if (isFetchingSubscribers || isSingleChatLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="w-11 h-11 !text-primary" />
      </div>
    );
  }

  if (!currentChannel) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Channel not found</p>
          <button
            onClick={() => navigate("/channel")}
            className="text-primary hover:underline"
          >
            Back to Channels
          </button>
        </div>
      </div>
    );
  }

  const isAdmin = currentChannel.admins.some((admin: any) => 
    (typeof admin === 'string' ? admin : admin._id) === currentUserId
  );

  // Get channel name for saved messages context
  const channelName = currentChannel.name || currentChannel.groupName || "Channel";

  return (
    <div className="relative h-screen flex flex-col">
      <ChannelHeader 
        channel={currentChannel}
        isAdmin={isAdmin}
        onManageClick={() => setIsManagementOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-background pb-24">
        {messages.length === 0 ? (
          <EmptyState
            title="No broadcasts yet"
            description={isAdmin ? "Send your first broadcast to subscribers" : "No broadcasts in this channel yet"}
          />
        ) : (
          <ChatBody 
            chatId={channelId!} 
            messages={messages} 
            onReply={() => {}} // Channels don't support replies
            chatName={channelName}
          />
        )}
      </div>

      {isAdmin && (
        <ChatFooter
          replyTo={null}
          chatId={channelId!}
          currentUserId={currentUserId}
          onCancelReply={() => {}}
        />
      )}

      {!isAdmin && (
        <div className="p-4 border-t bg-muted/50 text-center text-sm text-muted-foreground">
          Only admins can post in this channel
        </div>
      )}

      {/* Channel Management Panel */}
      <ChannelManagementPanel
        channel={currentChannel}
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
      />
    </div>
  );
};

export default SingleChannel;
