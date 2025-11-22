import { useChat } from "@/hooks/use-chat";
import { useSocket } from "@/hooks/use-socket";
import type { MessageType } from "@/types/chat.type";
import { useEffect, useRef } from "react";
import ChatBodyMessage from "./chat-body-message";

interface Props {
  chatId: string | null;
  messages: MessageType[];
  onReply: (message: MessageType) => void;
  chatName?: string;
}
const ChatBody = ({ chatId, messages, onReply, chatName }: Props) => {
  const { socket } = useSocket();
  const { addNewMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatId) return;
    if (!socket) return;

    const handleNewMessage = (msg: MessageType) => addNewMessage(chatId, msg);

    socket.on("message:new", handleNewMessage);
    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [socket, chatId, addNewMessage]);

  useEffect(() => {
    if (!messages.length) return;
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  return (
    <div className="w-full flex flex-col px-4 py-2">
      {messages.map((message) => {
        // Render system messages
        if (message.messageType === "SYSTEM") {
          return (
            <div
              key={message._id}
              className="flex justify-center my-2"
            >
              <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                {message.content}
              </div>
            </div>
          );
        }

        // Filter out messages without valid sender for regular messages
        if (!message.sender || !message.sender._id) {
          return null;
        }

        return (
          <ChatBodyMessage
            key={message._id}
            message={message}
            onReply={onReply}
            chatId={chatId || undefined}
            chatName={chatName}
          />
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatBody;
