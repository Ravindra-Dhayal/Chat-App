import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import SectionHeader from "@/components/section-header";
import { BookmarkIcon, Search, Image, FileText, Link as LinkIcon, Trash2, MessageCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSavedMessages } from "@/hooks/use-saved-messages";
import { formatChatTime } from "@/lib/helper";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AvatarWithBadge from "@/components/avatar-with-badge";

const Saved = () => {
  const navigate = useNavigate();
  const { savedMessages, unsaveMessage } = useSavedMessages();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "text" | "media" | "links">("all");

  const filteredMessages = useMemo(() => {
    return savedMessages
      .filter((msg) => {
        if (filterType === "all") return true;
        if (filterType === "media") return msg.image;
        if (filterType === "links") {
          // Check if content contains URLs
          const urlRegex = /(https?:\/\/[^\s]+)/g;
          return urlRegex.test(msg.content || "");
        }
        return msg.content && !msg.image; // text
      })
      .filter((msg) =>
        (msg.content?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
        (msg.chatName?.toLowerCase() || "").includes(searchQuery.toLowerCase())
      );
  }, [savedMessages, filterType, searchQuery]);

  const handleUnsave = (messageId: string) => {
    unsaveMessage(messageId);
    toast.success("Message removed from saved");
  };

  const handleGoToChat = (chatId?: string) => {
    if (chatId) {
      navigate(`/chat/${chatId}`);
    }
  };

  const getMessageIcon = (message: typeof savedMessages[0]) => {
    if (message.image) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(message.content || "")) {
      return <LinkIcon className="w-4 h-4 text-orange-500" />;
    }
    return <FileText className="w-4 h-4 text-green-500" />;
  };

  const formatDate = (timestamp: string) => {
    return formatChatTime(timestamp);
  };

  return (
    <div className="min-h-screen overflow-y-auto pb-20 bg-background">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <SectionHeader title="Saved Messages" className="mb-6" />

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search saved messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "all", label: "All" },
            { id: "text", label: "Text" },
            { id: "media", label: "Media" },
            { id: "links", label: "Links" },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                filterType === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-base-200 text-base-content/70 hover:bg-base-300"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Saved Messages List */}
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BookmarkIcon className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Saved Messages</h3>
            <p className="text-muted-foreground max-w-sm">
              {searchQuery || filterType !== "all"
                ? "No messages match your search or filter"
                : "Save important messages to access them here anytime"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMessages.map((message) => (
              <div
                key={message._id}
                className="p-4 rounded-lg transition-colors hover:bg-base-200 bg-card border border-border group"
              >
                <div className="flex items-start gap-3">
                  <AvatarWithBadge
                    name={message.sender?.name || "Unknown"}
                    src={message.sender?.avatar || ""}
                    isOnline={false}
                    className="!w-10 !h-10 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">
                        {message.sender?.name || "Unknown"}
                      </span>
                      {message.chatName && (
                        <>
                          <span className="text-muted-foreground text-xs">in</span>
                          <span className="text-sm text-primary font-medium">
                            {message.chatName}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      {getMessageIcon(message)}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(message.savedAt)}
                      </span>
                    </div>
                    {message.image && (
                      <div className="mb-2 rounded-lg overflow-hidden bg-base-300 max-w-xs">
                        <img 
                          src={message.image} 
                          alt="Saved" 
                          className="w-full h-auto"
                        />
                      </div>
                    )}
                    {message.content && (
                      <p className="text-base-content break-words whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {message.chatId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleGoToChat(message.chatId)}
                        className="rounded-lg min-h-[36px] min-w-[36px]"
                        title="Go to chat"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnsave(message._id)}
                      className="rounded-lg min-h-[36px] min-w-[36px] text-destructive hover:text-destructive"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
