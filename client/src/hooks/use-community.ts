import { create } from "zustand";
import { API } from "@/lib/axios-client";
import { toast } from "sonner";

export interface CommunityType {
  _id: string;
  name: string;
  description?: string;
  members: string[];
  admins: string[];
  groups: string[];
  channels: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CommunityState {
  communities: CommunityType[];
  publicCommunities: { communities: CommunityType[]; total: number } | null;
  currentCommunity: CommunityType | null;

  isCommunitiesLoading: boolean;
  isCreatingCommunity: boolean;

  // Actions
  fetchUserCommunities: () => Promise<void>;
  fetchPublicCommunities: (page?: number, limit?: number) => Promise<void>;
  createCommunity: (data: {
    name: string;
    description?: string;
    isPublic: boolean;
  }) => Promise<CommunityType | null>;
  getCommunityService: (communityId: string) => Promise<CommunityType | null>;
  addChatToCommunity: (communityId: string, chatId: string, chatType: "GROUP" | "CHANNEL") => Promise<void>;
  removeChatFromCommunity: (communityId: string, chatId: string) => Promise<void>;
  setCurrentCommunity: (community: CommunityType | null) => void;

  // Socket listeners
  addCommunity: (community: CommunityType) => void;
}

export const useCommunity = create<CommunityState>()((set, get) => ({
  communities: [],
  publicCommunities: null,
  currentCommunity: null,

  isCommunitiesLoading: false,
  isCreatingCommunity: false,

  fetchUserCommunities: async () => {
    set({ isCommunitiesLoading: true });
    try {
      const response = await API.get("/community/my");
      set({ communities: response.data.communities });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch communities"
      );
    } finally {
      set({ isCommunitiesLoading: false });
    }
  },

  fetchPublicCommunities: async (page = 1, limit = 20) => {
    set({ isCommunitiesLoading: true });
    try {
      const response = await API.get("/community/public", {
        params: { page, limit },
      });
      set({ publicCommunities: response.data });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch public communities"
      );
    } finally {
      set({ isCommunitiesLoading: false });
    }
  },

  createCommunity: async (data) => {
    set({ isCreatingCommunity: true });
    try {
      const response = await API.post("/community/create", data);
      get().addCommunity(response.data.community);
      toast.success("Community created successfully");
      return response.data.community;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to create community"
      );
      return null;
    } finally {
      set({ isCreatingCommunity: false });
    }
  },

  getCommunityService: async (communityId) => {
    try {
      const response = await API.get(`/community/${communityId}`);
      set({ currentCommunity: response.data.community });
      return response.data.community;
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to fetch community"
      );
      return null;
    }
  },

  addChatToCommunity: async (communityId, chatId, chatType) => {
    try {
      const response = await API.post(`/community/${communityId}/chat/add`, {
        chatId,
        chatType,
      });
      set({ currentCommunity: response.data.community });
      toast.success("Chat added to community successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add chat");
    }
  },

  removeChatFromCommunity: async (communityId, chatId) => {
    try {
      const response = await API.post(`/community/${communityId}/remove-chat`, {
        chatId,
      });
      set({ currentCommunity: response.data.community });
      toast.success("Chat removed from community successfully");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove chat");
    }
  },

  setCurrentCommunity: (community) => {
    set({ currentCommunity: community });
  },

  addCommunity: (community) => {
    set((state) => {
      if (state.communities.some((c) => c._id === community._id)) {
        return state;
      }
      return {
        communities: [community, ...state.communities],
      };
    });
  },
}));
