import React, { useEffect } from "react";
import BottomNav from "./bottom-nav";
import { useSocket } from "@/hooks/use-socket";
import { useChannel } from "@/hooks/use-channel";
import { useChat } from "@/hooks/use-chat";
import { useAuth } from "@/hooks/use-auth";
import { useSettings } from "@/hooks/use-settings";

interface Props {
  children: React.ReactNode;
}
const AppWrapper = ({ children }: Props) => {
  const { socket, connectSocket } = useSocket();
  const { updateChannelSubscriber, updateChannelAdmin, updateChannelUnread, channels } = useChannel();
  const { updateChatUnread, chats } = useChat();
  const { user } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      connectSocket();
    }
  }, [user, connectSocket]);

  // Channel socket event listeners + notifications
  useEffect(() => {
    if (!socket) return;

    const handleSubscriberJoined = (data: { channelId: string; userId: string }) => {
      updateChannelSubscriber(data.channelId, "joined");
    };

    const handleSubscriberLeft = (data: { channelId: string; userId: string }) => {
      updateChannelSubscriber(data.channelId, "left");
    };

    const handleAdminAdded = (data: { channelId: string; userId: string }) => {
      updateChannelAdmin(data.channelId, data.userId, "added");
    };

    const handleAdminRemoved = (data: { channelId: string; userId: string }) => {
      updateChannelAdmin(data.channelId, data.userId, "removed");
    };

    // Listen for new messages in any chat/channel
    const handleNewMessage = (data: { chatId: string }) => {
      // Check if this is a channel
      const channel = channels.find((c) => c._id === data.chatId);
      if (channel) {
        // For channels, add 1 to unread (since the current user isn't in the chat view during broadcast)
        updateChannelUnread(data.chatId, (channel.unreadCount || 0) + 1);
      }

      // Check if this is a chat/group
      const chat = chats.find((c) => c._id === data.chatId);
      if (chat) {
        // For chats/groups, add 1 to unread
        updateChatUnread(data.chatId, (chat.unreadCount || 0) + 1);
      }

      // Push a notification for this activity if notifications are enabled
      const settingsState = useSettings.getState();
      if (settingsState.notificationsEnabled) {
        const chatInfo = chat as unknown as { name?: string; groupName?: string } | null;
        const channelInfo = channel as unknown as { groupName?: string } | null;

        const displayName =
          chatInfo?.name ||
          chatInfo?.groupName ||
          channelInfo?.groupName ||
          "this conversation";

        settingsState.addNotification({
          title: "New message",
          message: `New activity in ${displayName}`,
          type: "message",
        });
      }
    };

    socket.on("subscriber:joined", handleSubscriberJoined);
    socket.on("subscriber:left", handleSubscriberLeft);
    socket.on("admin:added", handleAdminAdded);
    socket.on("admin:removed", handleAdminRemoved);
    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("subscriber:joined", handleSubscriberJoined);
      socket.off("subscriber:left", handleSubscriberLeft);
      socket.off("admin:added", handleAdminAdded);
      socket.off("admin:removed", handleAdminRemoved);
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, updateChannelSubscriber, updateChannelAdmin, updateChannelUnread, updateChatUnread, channels, chats]);

  return (
    <div className="h-full">
      <main className="h-full">{children}</main>
      <BottomNav />
    </div>
  );
};

export default AppWrapper;
