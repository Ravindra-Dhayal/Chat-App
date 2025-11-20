import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import {
  createCommunityController,
  getUserCommunitiesController,
  getPublicCommunitiesController,
  getCommunityController,
  addChatToCommunityController,
  removeChatFromCommunityController,
  addMemberToCommunityController,
  removeMemberFromCommunityController,
} from "../controllers/community.controller";

const communityRoutes = Router();

// Public routes
communityRoutes.get("/public", getPublicCommunitiesController);

// Protected routes
communityRoutes.use(passportAuthenticateJwt);

communityRoutes.post("/create", createCommunityController);
communityRoutes.get("/my", getUserCommunitiesController);
communityRoutes.get("/user/my-communities", getUserCommunitiesController);

// This must come after specific routes to avoid conflicts
communityRoutes.get("/:communityId", getCommunityController);

communityRoutes.post("/:communityId/chat/add", addChatToCommunityController);
communityRoutes.delete(
  "/:communityId/chat/:chatId",
  removeChatFromCommunityController
);

communityRoutes.post(
  "/:communityId/member/:memberId/add",
  addMemberToCommunityController
);
communityRoutes.delete(
  "/:communityId/member/:memberId",
  removeMemberFromCommunityController
);

export default communityRoutes;
