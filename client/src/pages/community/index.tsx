import { useState, useEffect } from "react";
import { useCommunity } from "@/hooks/use-community";
import { useTheme } from "@/components/theme-provider";
import { useNavigate } from "react-router-dom";
import { CommunityCreateDialog } from "@/components/community/community-create-dialog";
import EmptyState from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import SectionHeader from "@/components/section-header";
import { Search, Plus } from "lucide-react";

const Community = () => {
  const { communities, publicCommunities, fetchUserCommunities, fetchPublicCommunities, isCommunitiesLoading, createCommunity, isCreatingCommunity } = useCommunity();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showPublic, setShowPublic] = useState(false);

  useEffect(() => {
    fetchUserCommunities();
    if (showPublic) {
      fetchPublicCommunities();
    }
  }, [showPublic]);

  const displayCommunities = showPublic ? publicCommunities?.communities || [] : communities || [];
  const filteredCommunities = displayCommunities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`h-screen overflow-y-auto pb-20 ${theme === "dark" ? "bg-slate-900" : "bg-white"}`}>
      <div className="p-4">
        {/* Header */}
        <SectionHeader
          title="Communities"
          className="mb-6"
          actions={
            <CommunityCreateDialog onCreateCommunity={createCommunity} isLoading={isCreatingCommunity}>
              <button
                className="bg-primary text-primary-foreground p-2 rounded-lg hover:opacity-90 transition-opacity"
                title="Create Community"
              >
                <Plus className="h-5 w-5" />
              </button>
            </CommunityCreateDialog>
          }
        />

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setShowPublic(false)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              !showPublic
                ? "bg-primary text-primary-foreground"
                : theme === "dark"
                  ? "bg-slate-800 text-slate-400"
                  : "bg-gray-200 text-gray-600"
            }`}
          >
            My Communities
          </button>
          <button
            onClick={() => setShowPublic(true)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showPublic
                ? "bg-primary text-primary-foreground"
                : theme === "dark"
                  ? "bg-slate-800 text-slate-400"
                  : "bg-gray-200 text-gray-600"
            }`}
          >
            Discover
          </button>
        </div>

        {/* Communities List */}
        {isCommunitiesLoading ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-muted-foreground">Loading communities...</p>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {filteredCommunities.map((community) => (
              <button
                key={community._id}
                onClick={() => navigate(`/community/${community._id}`)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors
                  ${theme === "dark" ? "hover:bg-slate-800" : "hover:bg-gray-100"}`}
              >
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-purple-500">👥</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{community.name}</h3>
                  <p className={`text-sm truncate ${theme === "dark" ? "text-slate-400" : "text-gray-500"}`}>
                    {community.description || `${community.members?.length || 0} members`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
