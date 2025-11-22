import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "@/hooks/use-chat";
import { useSocket } from "@/hooks/use-socket";
import { useAuth } from "@/hooks/use-auth";
import { API } from "@/lib/axios-client";
import ChatBody from "@/components/chat/chat-body";
import ChatFooter from "@/components/chat/chat-footer";
import GroupHeader from "@/components/group/group-header";
import { GroupManagementPanel } from "@/components/chat/group-management-panel";
import EmptyState from "@/components/empty-state";
import { Spinner } from "@/components/ui/spinner";
import type { MessageType } from "@/types/chat.type";

const SingleGroup = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const { fetchSingleChat, singleChat, isSingleChatLoading } = useChat();
  const { socket } = useSocket();
  const { user } = useAuth();
  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  const currentUserId = user?._id || null;
  const chat = singleChat?.chat;
  const messages = singleChat?.messages || [];
  
  // Check if current user is the creator (group admin)
  const isAdmin = chat?.createdBy === currentUserId;

  // Get group name for saved messages context
  const groupName = chat?.groupName || chat?.name || "Group";

  // Fetch group chat
  useEffect(() => {
    if (!groupId) return;
    fetchSingleChat(groupId);
  }, [groupId, fetchSingleChat]);

  // Mark group as read when opened
  useEffect(() => {
    if (!groupId) return;
    
    const markAsRead = async () => {
      try {
        await API.post(`/chat/${groupId}/mark-as-read`);
      } catch (error) {
        console.error("Failed to mark group as read:", error);
      }
    };

    markAsRead();
  }, [groupId]);

  // Socket: Join chat room
  useEffect(() => {
    if (!groupId || !socket) return;

    socket.emit("chat:join", groupId);

    return () => {
      socket.emit("chat:leave", groupId);
    };
  }, [groupId, socket]);

  if (isSingleChatLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spinner className="w-11 h-11 !text-primary" />
      </div>
    );
  }

  if (!chat || !chat.isGroup) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Group not found</p>
          <button
            onClick={() => navigate("/groups")}
            className="text-primary hover:underline"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen flex flex-col">
      <GroupHeader
        group={chat}
        isAdmin={isAdmin}
        onManageClick={() => setIsManagementOpen(true)}
      />

      <div className="flex-1 overflow-y-auto bg-background pb-24">
        {messages.length === 0 ? (
          <EmptyState
            title="Start the conversation"
            description="No messages yet. Be the first to send a message!"
          />
        ) : (
          <ChatBody 
            chatId={groupId!} 
            messages={messages} 
            onReply={setReplyTo}
            chatName={groupName}
          />
        )}
      </div>

      <ChatFooter
        replyTo={replyTo}
        chatId={groupId!}
        currentUserId={currentUserId}
        onCancelReply={() => setReplyTo(null)}
      />

      {/* Group Management Panel */}
      <GroupManagementPanel
        group={chat}
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
        isAdmin={isAdmin}
      />
    </div>
  );
};

export default SingleGroup;
