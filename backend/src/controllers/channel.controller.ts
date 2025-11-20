import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import {
  createChannelService,
  subscribeToChannelService,
  unsubscribeFromChannelService,
  promoteToAdminService,
  demoteAdminService,
  getChannelInfoService,
  getPublicChannelsService,
  getUserChannelsService,
  markChannelAsReadService,
} from "../services/channel.service";

export const createChannelController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { name, description, isPublic } = req.body;

    const channel = await createChannelService(userId, {
      name,
      description,
      isPublic,
    });

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Channel created successfully",
      channel,
    });
  }
);

export const getPublicChannelsController = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await getPublicChannelsService(page, limit);

    return res.status(HTTPSTATUS.OK).json({
      message: "Public channels retrieved successfully",
      ...result,
    });
  }
);

export const getUserChannelsController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;

    const channels = await getUserChannelsService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User channels retrieved successfully",
      channels,
    });
  }
);

export const subscribeToChannelController = asyncHandler(
  async (req: Request, res: Response) => {
    // If userId is in body, use it (admin adding subscriber), otherwise use logged-in user
    const userId = req.body.userId || req.user?._id;
    const { channelId } = req.params;

    const channel = await subscribeToChannelService(channelId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Subscribed to channel successfully",
      channel,
    });
  }
);

export const unsubscribeFromChannelController = asyncHandler(
  async (req: Request, res: Response) => {
    // If userId is in body, use it (admin removing subscriber), otherwise use logged-in user
    const userId = req.body.userId || req.user?._id;
    const { channelId } = req.params;

    const channel = await unsubscribeFromChannelService(channelId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Unsubscribed from channel successfully",
      channel,
    });
  }
);

export const promoteToAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const promoterId = req.user?._id;
    const { channelId, userId } = req.params;

    const channel = await promoteToAdminService(channelId, userId, promoterId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User promoted to admin successfully",
      channel,
    });
  }
);

export const demoteAdminController = asyncHandler(
  async (req: Request, res: Response) => {
    const demoterId = req.user?._id;
    const { channelId, userId } = req.params;

    const channel = await demoteAdminService(channelId, userId, demoterId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User demoted from admin successfully",
      channel,
    });
  }
);

export const getChannelInfoController = asyncHandler(
  async (req: Request, res: Response) => {
    const { channelId } = req.params;

    const channel = await getChannelInfoService(channelId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Channel info retrieved successfully",
      channel,
    });
  }
);

export const markChannelAsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?._id;
    const { channelId } = req.params;

    const channel = await markChannelAsReadService(channelId, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Channel marked as read",
      channel,
    });
  }
);
