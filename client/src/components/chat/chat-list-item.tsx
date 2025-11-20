import { getOtherUserAndGroup } from "@/lib/helper";
import type { ChatType } from "@/types/chat.type";
import AvatarWithBadge from "../avatar-with-badge";
import { useTheme } from "../theme-provider";

interface PropsType {
  chat: ChatType;
  currentUserId: string | null;
  onClick?: () => void;
}
const ChatListItem = ({ chat, currentUserId, onClick }: PropsType) => {
  const { lastMessage } = chat;

  const { name, avatar, isOnline, isGroup } = getOtherUserAndGroup(
    chat,
    currentUserId
  );

  const getLastMessageText = () => {
    if (!lastMessage) {
      return isGroup
        ? chat.createdBy === currentUserId
          ? "Group created"
          : "You were added"
        : "Send a message";
    }
    if (lastMessage.image) return "📷 Photo";

    if (isGroup && lastMessage.sender) {
      return `${
        lastMessage.sender._id === currentUserId
          ? "You"
          : lastMessage.sender.name
      }: ${lastMessage.content}`;
    }

    return lastMessage.content;
  };

  const unreadCount = chat.unreadCount || 0;
  const { theme } = useTheme();

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors
        ${theme === "dark" ? "hover:bg-slate-800" : "hover:bg-gray-100"}`}
    >
      <AvatarWithBadge
        name={name}
        src={avatar}
        isGroup={isGroup}
        isOnline={isOnline}
        size="w-10 h-10"
      />
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{name}</h3>
        <p className={`text-sm truncate ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
          {getLastMessageText()}
        </p>
      </div>
      {unreadCount > 0 && (
        <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default ChatListItem;
