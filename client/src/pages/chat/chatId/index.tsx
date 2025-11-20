import ChatBody from "@/components/chat/chat-body";
import ChatFooter from "@/components/chat/chat-footer";
import ChatHeader from "@/components/chat/chat-header";
import EmptyState from "@/components/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import useChatId from "@/hooks/use-chat-id";
import { useSocket } from "@/hooks/use-socket";
import { API } from "@/lib/axios-client";
import type { MessageType } from "@/types/chat.type";
import { useEffect, useState } from "react";

const SingleChat = () => {
  const chatId = useChatId();
  const { fetchSingleChat, isSingleChatLoading, singleChat } = useChat();
  const { socket } = useSocket();
  const { user } = useAuth();

  const [replyTo, setReplyTo] = useState<MessageType | null>(null);

  const currentUserId = user?._id || null;
  const chat = singleChat?.chat;
  const messages = singleChat?.messages || [];

  useEffect(() => {
    if (!chatId) return;
    fetchSingleChat(chatId);
  }, [fetchSingleChat, chatId]);

  // Mark chat as read when opened
  useEffect(() => {
    if (!chatId) return;
    
    const markAsRead = async () => {
      try {
        await API.post(`/chat/${chatId}/mark-as-read`);
      } catch (error) {
        console.error("Failed to mark chat as read:", error);
      }
    };

    markAsRead();
  }, [chatId]);

  //Socket Chat room
  useEffect(() => {
    if (!chatId || !socket) return;

    socket.emit("chat:join", chatId);
    return () => {
      socket.emit("chat:leave", chatId);
    };
  }, [chatId, socket]);

  if (isSingleChatLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="w-11 h-11 !text-primary" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-lg">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex flex-col">
      <ChatHeader chat={chat} currentUserId={currentUserId} />

      <div className="flex-1 overflow-y-auto bg-background pb-24">
        {messages.length === 0 ? (
          <EmptyState
            title="Start a conversation"
            description="No messages yet. Send the first message"
          />
        ) : (
          <ChatBody chatId={chatId} messages={messages} onReply={setReplyTo} />
        )}
      </div>

      <ChatFooter
        replyTo={replyTo}
        chatId={chatId}
        currentUserId={currentUserId}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
};

export default SingleChat;
