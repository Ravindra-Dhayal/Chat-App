import { useState, useEffect } from "react";
import { X, Search, Check } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { API } from "@/lib/axios-client";
import { toast } from "sonner";
import type { UserType } from "@/types/auth.type";
import { Spinner } from "@/components/ui/spinner";

interface AddSubscriberDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscribers: UserType[];
  onSubscribersAdded: () => void;
  channelId: string;
}

export const AddSubscriberDialog = ({
  isOpen,
  onClose,
  currentSubscribers,
  onSubscribersAdded,
  channelId,
}: AddSubscriberDialogProps) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAllUsers();
    }
  }, [isOpen]);

  const fetchAllUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await API.get("/user/all");
      setAllUsers(data.users || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubscribers = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setIsAdding(true);
    try {
      // Add each subscriber
      let successCount = 0;
      for (const userId of selectedUserIds) {
        try {
          await API.post(`/channel/${channelId}/add-subscriber`, { userId });
          successCount++;
        } catch (error: any) {
          // Skip if already subscribed
          if (!error?.response?.data?.message?.includes("Already subscribed")) {
            throw error;
          }
        }
      }
      toast.success(`${successCount} subscriber(s) added successfully`);
      onSubscribersAdded();
      setSelectedUserIds([]);
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add subscribers");
    } finally {
      setIsAdding(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const currentSubscriberIds = currentSubscribers.map((s) => s._id);
  const filteredUsers = allUsers.filter((u) =>
    u?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[110]" onClick={onClose} />

      <div
        className={`fixed inset-x-4 top-1/2 -translate-y-1/2 z-[110] rounded-xl shadow-lg max-w-md mx-auto
          ${theme === "dark" ? "bg-slate-800" : "bg-white"}
          flex flex-col max-h-[70vh]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Add Subscribers</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                theme === "dark"
                  ? "bg-slate-900 border-slate-700"
                  : "bg-white border-gray-300"
              }`}
            />
          </div>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-2 min-h-[200px] max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner className="w-8 h-8" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No users found
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map((u) => {
                const isAlreadySubscriber = currentSubscriberIds.includes(u._id);
                const isSelected = selectedUserIds.includes(u._id);

                return (
                  <div
                    key={u._id}
                    onClick={() =>
                      !isAlreadySubscriber && toggleUserSelection(u._id)
                    }
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isAlreadySubscriber
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">
                          {u.name[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{u.name}</p>
                        {isAlreadySubscriber && (
                          <p className="text-xs text-muted-foreground">
                            Already subscribed
                          </p>
                        )}
                      </div>
                    </div>
                    {isAlreadySubscriber ? (
                      <Check className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex gap-2">
          <button
            onClick={onClose}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              theme === "dark"
                ? "bg-slate-700 hover:bg-slate-600"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleAddSubscribers}
            disabled={selectedUserIds.length === 0 || isAdding}
            className="flex-1 py-2 px-4 rounded-lg font-medium bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {isAdding ? "Adding..." : `Add ${selectedUserIds.length || ""}`}
          </button>
        </div>
      </div>
    </>
  );
};
