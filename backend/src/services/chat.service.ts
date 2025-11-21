import mongoose from "mongoose";
import { emitNewChatToParticpants, emitNewMessageToChatRoom } from "../lib/socket";
import ChatModel from "../models/chat.model";
import MessageModel from "../models/message.model";
import UserModel from "../models/user.model";
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "../services/utils/app-error";

export const createChatService = async (
  userId: string,
  body: {
    participantId?: string;
    isGroup?: boolean;
    participants?: string[];
    groupName?: string;
  }
) => {
  const { participantId, isGroup, participants, groupName } = body;

  let chat;
  let allParticipantIds: string[] = [];

  if (isGroup && participants?.length && groupName) {
    allParticipantIds = [userId, ...participants];
    chat = await ChatModel.create({
      participants: allParticipantIds,
      isGroup: true,
      groupName,
      createdBy: userId,
    });
  } else if (participantId) {
    const otherUser = await UserModel.findById(participantId);
    if (!otherUser) throw new NotFoundException("User not found");

    allParticipantIds = [userId, participantId];
    const existingChat = await ChatModel.findOne({
      participants: {
        $all: allParticipantIds,
        $size: 2,
      },
    }).populate("participants", "name avatar");

    if (existingChat) return existingChat;

    chat = await ChatModel.create({
      participants: allParticipantIds,
      isGroup: false,
      createdBy: userId,
    });
  }

  // Implement websocket
  const populatedChat = await chat?.populate(
    "participants",
    "name avatar isAI"
  );
  const particpantIdStrings = populatedChat?.participants?.map((p) => {
    return p._id?.toString();
  });

  emitNewChatToParticpants(particpantIdStrings, populatedChat);

  return chat;
};

export const getUserChatsService = async (userId: string) => {
  const chats = await ChatModel.find({
    participants: {
      $in: [userId],
    },
    type: { $ne: "CHANNEL" }, // Exclude channels from regular chats
  })
    .populate("participants", "name avatar")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    })
    .sort({ updatedAt: -1 });

  // Add unreadCount for each chat
  const chatsWithUnread = chats.map((chat) => {
    const unreadCount = chat.unreadBy?.filter(
      (id) => id.toString() === userId
    ).length || 0;
    return {
      ...chat.toObject(),
      unreadCount,
    };
  });

  return chatsWithUnread;
};

export const getSingleChatService = async (chatId: string, userId: string) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  }).populate("participants", "name avatar");

  if (!chat)
    throw new BadRequestException(
      "Chat not found or you are not authorized to view this chat"
    );

  const messages = await MessageModel.find({ chatId })
    .populate("sender", "name avatar")
    .populate({
      path: "replyTo",
      select: "content image sender",
      populate: {
        path: "sender",
        select: "name avatar",
      },
    })
    .sort({ createdAt: 1 });

  return {
    chat,
    messages,
  };
};

export const validateChatParticipant = async (
  chatId: string,
  userId: string
) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  });
  if (!chat) throw new BadRequestException("User not a participant in chat");
  return chat;
};

export const markChatAsReadService = async (
  chatId: string,
  userId: string
) => {
  const chat = await ChatModel.findOne({
    _id: chatId,
    participants: {
      $in: [userId],
    },
  });

  if (!chat) throw new BadRequestException("Chat not found or unauthorized");

  // Remove user from unreadBy array
  chat.unreadBy = chat.unreadBy.filter((id) => id.toString() !== userId);
  await chat.save();

  return chat;
};

export const addMemberToChatService = async (
  chatId: string,
  memberId: string,
  userId: string
) => {
  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new BadRequestException("Chat not found");

  // Verify it's a group chat
  if (!chat.isGroup) throw new BadRequestException("This is not a group chat");

  // Verify the requester is the creator or an admin
  const isCreator = chat.createdBy.toString() === userId;
  const isAdmin = chat.admins.some((id) => id.toString() === userId);
  
  if (!isCreator && !isAdmin) {
    throw new ForbiddenException("Only group creator or admins can add members");
  }

  // Check if member already exists
  if (chat.participants.some((id) => id.toString() === memberId)) {
    throw new BadRequestException("Member already in group");
  }

  // Add member
  chat.participants.push(new mongoose.Types.ObjectId(memberId));
  
  // Get user info for system message
  const newMember = await UserModel.findById(memberId);
  const adder = await UserModel.findById(userId);
  
  await chat.save();

  // Create system message
  const systemMessage = await MessageModel.create({
    chatId,
    content: `${adder?.name || "Admin"} added ${newMember?.name || "User"} to the group`,
    messageType: "SYSTEM",
  });

  // Update last message
  chat.lastMessage = systemMessage._id as mongoose.Types.ObjectId;
  await chat.save();

  // Emit system message to all participants
  emitNewMessageToChatRoom(userId, chatId, systemMessage);

  return await chat.populate("participants", "name avatar");
};

export const removeMemberFromChatService = async (
  chatId: string,
  memberId: string,
  userId: string
) => {
  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new BadRequestException("Chat not found");

  // Verify it's a group chat
  if (!chat.isGroup) throw new BadRequestException("This is not a group chat");

  // Verify the requester is the creator OR the member leaving
  if (chat.createdBy.toString() !== userId && userId !== memberId) {
    throw new ForbiddenException("You cannot remove this member");
  }

  // Remove member
  const memberIndex = chat.participants.findIndex(
    (id) => id.toString() === memberId
  );

  if (memberIndex === -1) {
    throw new BadRequestException("Member not found in group");
  }

  // Get user info for system message
  const user = await UserModel.findById(memberId);
  
  chat.participants.splice(memberIndex, 1);
  await chat.save();

  // Create system message
  const isLeavingVoluntarily = userId === memberId;
  const systemMessage = await MessageModel.create({
    chatId,
    content: isLeavingVoluntarily 
      ? `${user?.name || "User"} left the group`
      : `${user?.name || "User"} was removed from the group`,
    messageType: "SYSTEM",
  });

  // Update last message
  chat.lastMessage = systemMessage._id as mongoose.Types.ObjectId;
  await chat.save();

  // Emit system message to all participants (including the one who left for real-time update)
  emitNewMessageToChatRoom(userId, chatId, systemMessage);

  return await chat.populate("participants", "name avatar");
};

export const promoteToGroupAdminService = async (
  chatId: string,
  memberId: string,
  userId: string
) => {
  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new BadRequestException("Chat not found");

  // Verify it's a group chat
  if (!chat.isGroup) throw new BadRequestException("This is not a group chat");

  // Verify the requester is the creator or an admin
  const isCreator = chat.createdBy.toString() === userId;
  const isAdmin = chat.admins.some((id) => id.toString() === userId);
  
  if (!isCreator && !isAdmin) {
    throw new ForbiddenException("Only group creator or admins can promote members");
  }

  // Check if member exists
  if (!chat.participants.some((id) => id.toString() === memberId)) {
    throw new BadRequestException("Member not found in group");
  }

  // Check if already admin
  if (chat.admins.some((id) => id.toString() === memberId)) {
    throw new BadRequestException("Member is already an admin");
  }

  // Add to admins
  chat.admins.push(new mongoose.Types.ObjectId(memberId));
  
  // Get user info for system message
  const promotedUser = await UserModel.findById(memberId);
  const promoter = await UserModel.findById(userId);
  
  await chat.save();

  // Create system message
  const systemMessage = await MessageModel.create({
    chatId,
    content: `${promoter?.name || "Admin"} promoted ${promotedUser?.name || "User"} to admin`,
    messageType: "SYSTEM",
  });

  // Update last message
  chat.lastMessage = systemMessage._id as mongoose.Types.ObjectId;
  await chat.save();

  // Emit system message to all participants
  emitNewMessageToChatRoom(userId, chatId, systemMessage);

  return await chat.populate("participants", "name avatar");
};

export const deleteChatService = async (chatId: string, userId: string) => {
  const chat = await ChatModel.findById(chatId);

  if (!chat) throw new BadRequestException("Chat not found");

  // If it's a group chat, verify the requester is the creator or an admin
  if (chat.isGroup) {
    const isCreator = chat.createdBy.toString() === userId;
    const isAdmin = chat.admins.some((id) => id.toString() === userId);
    
    if (!isCreator && !isAdmin) {
      throw new ForbiddenException("Only group creator or admins can delete the group");
    }
  }

  // Delete the chat and all associated messages
  await ChatModel.findByIdAndDelete(chatId);
  await MessageModel.deleteMany({ chatId });

  return { message: "Chat deleted successfully" };
};

