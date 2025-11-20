import mongoose, { Document, Schema } from "mongoose";

export enum ChatType {
  DIRECT = "DIRECT",
  GROUP = "GROUP",
  CHANNEL = "CHANNEL",
}

export interface ChatDocument extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
  type: ChatType;
  isGroup?: boolean; // Deprecated, use type instead
  groupName?: string;
  channelDescription?: string;
  admins: mongoose.Types.ObjectId[];
  isPublic: boolean;
  subscriberCount: number;
  createdBy: mongoose.Types.ObjectId;
  unreadBy: mongoose.Types.ObjectId[]; // Users who have unread messages
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<ChatDocument>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    type: {
      type: String,
      enum: Object.values(ChatType),
      default: ChatType.DIRECT,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
    },
    channelDescription: {
      type: String,
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublic: {
      type: Boolean,
      default: false,
    },
    subscriberCount: {
      type: Number,
      default: 0,
    },
    unreadBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ChatModel = mongoose.model<ChatDocument>("Chat", chatSchema);
export default ChatModel;
