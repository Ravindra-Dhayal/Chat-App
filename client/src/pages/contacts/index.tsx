import { useState, useEffect } from "react";
import { useChat } from "@/hooks/use-chat";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import SectionHeader from "@/components/section-header";
import { Search, UserPlus, MessageCircle } from "lucide-react";
import AvatarWithBadge from "@/components/avatar-with-badge";
import { isUserOnline } from "@/lib/helper";

const Contacts = () => {
  const { chats, fetchChats, isChatsLoading } = useChat();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Extract unique contacts from all chats
  const contacts = chats
    ?.flatMap((chat) => chat.participants || [])
    .filter(
      (participant, index, self) =>
        index === self.findIndex((p) => p._id === participant._id)
    ) || [];

  const filteredContacts = contacts.filter((contact) =>
    contact.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartChat = (contactId: string) => {
    const existingChat = chats?.find(
      (chat) =>
        !chat.isGroup &&
        chat.participants?.some((p) => p._id === contactId)
    );

    if (existingChat) {
      navigate(`/chat/${existingChat._id}`);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto pb-20 bg-background">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <SectionHeader
          title="Contacts"
          className="mb-6"
          actions={
            <button
              className="bg-primary text-primary-foreground p-3 rounded-lg hover:opacity-90 transition-opacity min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Add Contact"
              onClick={() => {
                // TODO: Implement add contact functionality
                alert("Add contact feature coming soon!");
              }}
            >
              <UserPlus className="h-5 w-5" />
            </button>
          }
        />

        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Contacts List */}
        {isChatsLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading contacts...</p>
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <UserPlus className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Contacts Found</h3>
            <p className="text-muted-foreground max-w-sm">
              {searchQuery
                ? "Try adjusting your search"
                : "Start chatting with someone to add them to your contacts"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredContacts.map((contact) => {
              const isOnline = isUserOnline(contact._id);
              return (
                <div
                  key={contact._id}
                  className="flex items-center gap-3 p-4 rounded-lg transition-colors hover:bg-base-200 bg-card border border-border"
                >
                  <AvatarWithBadge
                    name={contact.name || "Unknown"}
                    src={contact.avatar || ""}
                    isOnline={isOnline}
                    className="!w-12 !h-12"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-base-content">
                      {contact.name || "Unknown User"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {contact.email || contact.phone || "No contact info"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartChat(contact._id)}
                    className="p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Start Chat"
                  >
                    <MessageCircle className="w-5 h-5 text-primary" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Contacts;
