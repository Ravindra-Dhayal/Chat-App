import { Router } from "express";
import { passportAuthenticateJwt } from "../config/passport.config";
import {
  createChannelController,
  getPublicChannelsController,
  getUserChannelsController,
  subscribeToChannelController,
  unsubscribeFromChannelController,
  promoteToAdminController,
  demoteAdminController,
  getChannelInfoController,
  markChannelAsReadController,
} from "../controllers/channel.controller";

const channelRoutes = Router();

// Public routes
channelRoutes.get("/public", getPublicChannelsController);
channelRoutes.get("/:channelId/info", getChannelInfoController);

// Protected routes
channelRoutes.use(passportAuthenticateJwt);

channelRoutes.post("/create", createChannelController);
channelRoutes.get("/user/my-channels", getUserChannelsController);
channelRoutes.post("/:channelId/subscribe", subscribeToChannelController);
channelRoutes.post("/:channelId/unsubscribe", unsubscribeFromChannelController);
channelRoutes.post("/:channelId/add-subscriber", subscribeToChannelController);
channelRoutes.post("/:channelId/remove-subscriber", unsubscribeFromChannelController);
channelRoutes.post("/:channelId/mark-as-read", markChannelAsReadController);
channelRoutes.post(
  "/:channelId/admin/:userId/add",
  promoteToAdminController
);
channelRoutes.post(
  "/:channelId/admin/:userId/remove",
  demoteAdminController
);

export default channelRoutes;
