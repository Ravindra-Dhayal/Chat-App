import { useMemo, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { useChannel } from "@/hooks/use-channel";
import type { ChannelType } from "@/hooks/use-channel";
import { useNavigate } from "react-router-dom";
import EmptyState from "@/components/empty-state";
import SectionHeader from "@/components/section-header";
import { useI18n } from "@/hooks/use-i18n";
import { MessageCircle, Users, Hash } from "lucide-react";

const Home = () => {
  const { chats, fetchChats } = useChat();
  const { channels, fetchUserChannels } = useChannel();
  const navigate = useNavigate();
  const { t } = useI18n();

  // Fetch data on mount
  useEffect(() => {
    fetchChats();
    fetchUserChannels();
  }, [fetchChats, fetchUserChannels]);

  // Combine and organize chats and channels
  const combinedItems = useMemo(() => {
    const items = {
      chats: chats || [],
      channels: channels || [],
    };
    return items;
  }, [chats, channels]);

  const totalItems = combinedItems.chats.length + combinedItems.channels.length;

  return (
    <div className="h-screen overflow-y-auto pb-20 bg-background">
      <div className="p-4">
        <SectionHeader
          title={t("home.title", "Home")}
          className="mb-6"
        />

        {totalItems === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-6">
            {/* Chats Section */}
            {combinedItems.chats.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  {t("home.section.chats", "Chats")}
                </h2>
                <div className="space-y-2">
                  {combinedItems.chats.map((chat) => {
                    const isGroup = chat.isGroup;
                    const chatName =
                      chat.name ||
                      chat.groupName ||
                      chat.participants?.[0]?.name ||
                      "Chat";

                    return (
                      <button
                        key={chat._id}
                        onClick={() =>
                          navigate(
                            isGroup ? `/groups/${chat._id}` : `/chat/${chat._id}`
                          )
                        }
                        className="w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-base-200"
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isGroup ? "bg-blue-500/10" : "bg-primary/10"
                          }`}
                        >
                          {isGroup ? (
                            <Users className="h-5 w-5 text-blue-500" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {chatName[0]?.toUpperCase() || "C"}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{chatName}</h3>
                          <p className="text-sm truncate text-muted-foreground">
                            {chat.lastMessage?.content ||
                              t("home.chats.noMessages", "No messages yet")}
                          </p>
                        </div>
                        {chat.unreadCount !== undefined && chat.unreadCount > 0 && (
                          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center">
                            {chat.unreadCount > 100 ? "99+" : chat.unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Channels Section */}
            {combinedItems.channels.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  {t("home.section.channels", "Channels")}
                </h2>
                <div className="space-y-2">
                  {combinedItems.channels.map((channel: ChannelType) => (
                    <button
                      key={channel._id}
                      onClick={() => navigate(`/channel/${channel._id}`)}
                      className="w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-base-200"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 relative">
                        <Hash className="h-6 w-6 text-primary" />
                        {channel.unreadCount && channel.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1 bg-primary text-primary-foreground">
                            {channel.unreadCount > 100 ? "99+" : channel.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">
                          {channel.groupName || channel.name || "Channel"}
                        </h3>
                        <p className="text-sm truncate text-muted-foreground">
                          {channel.lastMessage?.content ||
                            `${channel.subscriberCount || 0} ${t(
                              "home.channels.subscribersSuffix",
                              "subscribers"
                            )}`}
                        </p>
                      </div>
                      {channel.isPublic && (
                        <span className="text-xs font-medium px-2 py-1 rounded bg-base-200 text-base-content/80">
                          {t("home.badge.public", "Public")}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
