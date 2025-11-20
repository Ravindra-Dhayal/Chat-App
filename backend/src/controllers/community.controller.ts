import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  createCommunityService,
  addChatToCommunityService,
  removeChatFromCommunityService,
  addMemberToCommunityService,
  removeMemberFromCommunityService,
  getCommunityService,
  getUserCommunitiesService,
  getPublicCommunitiesService,
} from "../services/community.service";

export const createCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { name, description, icon, isPublic } = req.body;

    const community = await createCommunityService(userId, {
      name,
      description,
      icon,
      isPublic,
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Community created successfully",
      community,
    });
  }
);

export const getUserCommunitiesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const communities = await getUserCommunitiesService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User communities retrieved successfully",
      communities,
    });
  }
);

export const getPublicCommunitiesController = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getPublicCommunitiesService(page, limit);

    return res.status(HTTPSTATUS.OK).json({
      message: "Public communities retrieved successfully",
      ...result,
    });
  }
);

export const getCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    const { communityId } = req.params;

    const community = await getCommunityService(communityId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Community retrieved successfully",
      community,
    });
  }
);

export const addChatToCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { communityId } = req.params;
    const { chatId, chatType } = req.body;

    const community = await addChatToCommunityService(
      communityId,
      chatId,
      chatType,
      userId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Chat added to community successfully",
      community,
    });
  }
);

export const removeChatFromCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { communityId, chatId } = req.params;

    const community = await removeChatFromCommunityService(
      communityId,
      chatId,
      userId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Chat removed from community successfully",
      community,
    });
  }
);

export const addMemberToCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { communityId, memberId } = req.params;

    const community = await addMemberToCommunityService(
      communityId,
      memberId,
      userId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Member added to community successfully",
      community,
    });
  }
);

export const removeMemberFromCommunityController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { communityId, memberId } = req.params;

    const community = await removeMemberFromCommunityService(
      communityId,
      memberId,
      userId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Member removed from community successfully",
      community,
    });
  }
);
