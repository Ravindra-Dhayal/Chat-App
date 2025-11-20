import mongoose from "mongoose";
import CommunityModel from "../models/community.model";
import ChatModel, { ChatType } from "../models/chat.model";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../utils/app-error";

export const createCommunityService = async (
  userId: string,
  data: {
    name: string;
    description?: string;
    icon?: string;
    isPublic?: boolean;
  }
) => {
  const { name, description, icon, isPublic = false } = data;

  if (!name || name.trim().length === 0) {
    throw new BadRequestException("Community name is required");
  }

  const community = await CommunityModel.create({
    name,
    description: description || "",
    icon: icon || null,
    creator: userId,
    admins: [userId],
    members: [userId],
    isPublic,
    groups: [],
    channels: [],
  });

  const populatedCommunity = await community.populate([
    { path: "creator", select: "name avatar _id" },
    { path: "admins", select: "name avatar _id" },
    { path: "members", select: "name avatar _id" },
  ]);

  return populatedCommunity;
};

export const addChatToCommunityService = async (
  communityId: string,
  chatId: string,
  chatType: ChatType,
  userId: string
) => {
  const community = await CommunityModel.findById(communityId);

  if (!community) {
    throw new NotFoundException("Community not found");
  }

  // Verify user is admin of community
  const isAdmin = community.admins.some((id) => id.toString() === userId);
  if (!isAdmin) {
    throw new ForbiddenException("Only community admins can add chats");
  }

  const chat = await ChatModel.findById(chatId);
  if (!chat) {
    throw new NotFoundException("Chat not found");
  }

  if (chatType === ChatType.GROUP) {
    if (community.groups.some((id) => id.toString() === chatId)) {
      throw new BadRequestException("This group is already in the community");
    }
    community.groups.push(new mongoose.Types.ObjectId(chatId));
  } else if (chatType === ChatType.CHANNEL) {
    if (community.channels.some((id) => id.toString() === chatId)) {
      throw new BadRequestException("This channel is already in the community");
    }
    community.channels.push(new mongoose.Types.ObjectId(chatId));
  } else {
    throw new BadRequestException("Cannot add direct chats to communities");
  }

  await community.save();

  const populatedCommunity = await community.populate([
    { path: "groups", select: "groupName participants _id" },
    { path: "channels", select: "groupName participants _id" },
  ]);

  return populatedCommunity;
};

export const removeChatFromCommunityService = async (
  communityId: string,
  chatId: string,
  userId: string
) => {
  const community = await CommunityModel.findById(communityId);

  if (!community) {
    throw new NotFoundException("Community not found");
  }

  // Verify user is admin of community
  const isAdmin = community.admins.some((id) => id.toString() === userId);
  if (!isAdmin) {
    throw new ForbiddenException("Only community admins can remove chats");
  }

  community.groups = community.groups.filter((id) => id.toString() !== chatId);
  community.channels = community.channels.filter(
    (id) => id.toString() !== chatId
  );

  await community.save();

  const populatedCommunity = await community.populate([
    { path: "groups", select: "groupName participants _id" },
    { path: "channels", select: "groupName participants _id" },
  ]);

  return populatedCommunity;
};

export const addMemberToCommunityService = async (
  communityId: string,
  memberId: string,
  userId: string
) => {
  const community = await CommunityModel.findById(communityId);

  if (!community) {
    throw new NotFoundException("Community not found");
  }

  // Verify user is admin of community
  const isAdmin = community.admins.some((id) => id.toString() === userId);
  if (!isAdmin) {
    throw new ForbiddenException("Only community admins can add members");
  }

  const isAlreadyMember = community.members.some(
    (id) => id.toString() === memberId
  );

  if (isAlreadyMember) {
    throw new BadRequestException("User is already a member of this community");
  }

  community.members.push(new mongoose.Types.ObjectId(memberId));
  await community.save();

  const populatedCommunity = await community.populate([
    { path: "members", select: "name avatar _id" },
  ]);

  return populatedCommunity;
};

export const removeMemberFromCommunityService = async (
  communityId: string,
  memberId: string,
  userId: string
) => {
  const community = await CommunityModel.findById(communityId);

  if (!community) {
    throw new NotFoundException("Community not found");
  }

  // Verify user is admin of community or removing themselves
  const isAdmin = community.admins.some((id) => id.toString() === userId);
  const isRemovingOwnself = userId === memberId;

  if (!isAdmin && !isRemovingOwnself) {
    throw new ForbiddenException("You cannot remove this member");
  }

  const memberIndex = community.members.findIndex(
    (id) => id.toString() === memberId
  );

  if (memberIndex === -1) {
    throw new BadRequestException("User is not a member of this community");
  }

  community.members.splice(memberIndex, 1);

  // Remove from admins if applicable
  const adminIndex = community.admins.findIndex(
    (id) => id.toString() === memberId
  );
  if (adminIndex !== -1) {
    community.admins.splice(adminIndex, 1);
  }

  await community.save();

  const populatedCommunity = await community.populate([
    { path: "members", select: "name avatar _id" },
    { path: "admins", select: "name avatar _id" },
  ]);

  return populatedCommunity;
};

export const getCommunityService = async (communityId: string) => {
  const community = await CommunityModel.findById(communityId).populate([
    { path: "creator", select: "name avatar _id" },
    { path: "admins", select: "name avatar _id" },
    { path: "members", select: "name avatar _id" },
    {
      path: "groups",
      select: "groupName participants _id type",
      populate: { path: "participants", select: "name avatar _id" },
    },
    {
      path: "channels",
      select: "groupName channelDescription participants admins _id type",
      populate: [
        { path: "participants", select: "name avatar _id" },
        { path: "admins", select: "name avatar _id" },
      ],
    },
  ]);

  if (!community) {
    throw new NotFoundException("Community not found");
  }

  return community;
};

export const getUserCommunitiesService = async (userId: string) => {
  const communities = await CommunityModel.find({
    members: { $in: [userId] },
  })
    .populate({ path: "creator", select: "name avatar _id" })
    .populate({ path: "admins", select: "name avatar _id" })
    .populate({ path: "members", select: "name avatar _id" })
    .sort({ createdAt: -1 });

  return communities;
};

export const getPublicCommunitiesService = async (
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const communities = await CommunityModel.find({
    isPublic: true,
  })
    .select("name description icon creator members isPublic createdAt")
    .populate({ path: "creator", select: "name avatar _id" })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await CommunityModel.countDocuments({
    isPublic: true,
  });

  return {
    communities,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};
