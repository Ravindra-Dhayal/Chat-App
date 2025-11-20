import mongoose, { Document, Schema } from "mongoose";

export interface FileMetadata {
  url: string;
  name: string;
  type: string; // MIME type
  size: number; // bytes
}

export interface MessageDocument extends Document {
  chatId: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  content?: string;
  image?: string;
  file?: FileMetadata;
  replyTo?: mongoose.Types.ObjectId;
  messageType?: "USER" | "SYSTEM";
  createdAt: Date;
  updatedAt: Date;
  hasFile?: boolean;
}

const fileMetadataSchema = new Schema<FileMetadata>(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
    type: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false }
);

const messageSchema = new Schema<MessageDocument>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: { type: String },
    image: { type: String },
    file: fileMetadataSchema,
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    messageType: {
      type: String,
      enum: ["USER", "SYSTEM"],
      default: "USER",
    },
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property to check if message has file
messageSchema.virtual("hasFile").get(function () {
  return !!this.file;
});

const MessageModel = mongoose.model<MessageDocument>("Message", messageSchema);

export default MessageModel;
