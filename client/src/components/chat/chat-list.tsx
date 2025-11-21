import { useEffect, useState } from "react";
import { useChat } from "@/hooks/use-chat";
import ChatListItem from "./chat-list-item";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import ChatListHeader from "./chat-list-header";
import { useSocket } from "@/hooks/use-socket";
import type { ChatType } from "@/types/chat.type";
import type { MessageType } from "@/types/chat.type";

const ChatList = () => {
  const navigate = useNavigate();
  const { socket } = useSocket();
  const {
    fetchChats,
    chats,
    isChatsLoading,
    addNewChat,
    updateChatLastMessage,
  } = useChat();
  const { user } = useAuth();
  const currentUserId = user?._id || null;

  const [searchQuery, setSearchQuery] = useState("");

  // Filter only direct chats (exclude groups and channels)
  const directChats = chats?.filter((chat) => !chat.isGroup && chat.type !== "CHANNEL") || [];

  const filteredChats = directChats.filter(
    (chat) =>
      chat.participants?.some(
        (p) =>
          p._id !== currentUserId &&
          p.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (!socket) return;

    const handleNewChat = (newChat: ChatType) => {
      console.log("Recieved new chat", newChat);
      addNewChat(newChat);
    };

    socket.on("chat:new", handleNewChat);

    return () => {
      socket.off("chat:new", handleNewChat);
    };
  }, [addNewChat, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleChatUpdate = (data: {
      chatId: string;
      lastMessage: MessageType;
    }) => {
      console.log("Recieved update on chat", data.lastMessage);
      updateChatLastMessage(data.chatId, data.lastMessage);
    };

    socket.on("chat:update", handleChatUpdate);

    return () => {
      socket.off("chat:update", handleChatUpdate);
    };
  }, [socket, updateChatLastMessage]);

  const onRoute = (id: string) => {
    navigate(`/chat/${id}`);
  };

  return (
    <div className="h-screen overflow-y-auto pb-20 bg-background">
      <div className="p-4">
        <ChatListHeader onSearch={setSearchQuery} />

        {isChatsLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading chats...</p>
          </div>
        ) : filteredChats?.length === 0 ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
            {searchQuery ? "No chat found" : "No chats created"}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredChats?.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                currentUserId={currentUserId}
                onClick={() => onRoute(chat._id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
