import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import {
  createChatController,
  getSingleChatController,
  getUserChatsController,
  markChatAsReadController,
  addMemberToChatController,
  removeMemberFromChatController,
  promoteToGroupAdminController,
  deleteChatController,
} from "../controllers/chat.controller";
import { sendMessageController } from "../controllers/message.controller";

const chatRoutes = Router()
  .use(passportAuthenticateJwt)
  .post("/create", createChatController)
  .get("/all", getUserChatsController)
  .post("/message/send", sendMessageController)
  .post("/:id/mark-as-read", markChatAsReadController)
  .post("/:id/add-member", addMemberToChatController)
  .post("/:id/remove-member", removeMemberFromChatController)
  .post("/:id/promote-member", promoteToGroupAdminController)
  .delete("/:id", deleteChatController)
  .get("/:id", getSingleChatController);

export default chatRoutes;
