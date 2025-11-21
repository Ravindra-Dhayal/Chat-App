import UserModel from "../models/user.model";
import { NotFoundException, UnauthorizedException } from "../services/utils/app-error";
import type { UpdateProfileSchemaType } from "../validators/auth.validator";

export const findByIdUserService = async (userId: string) => {
  return await UserModel.findById(userId);
};

export const getUsersService = async (userId: string) => {
  const users = await UserModel.find({ _id: { $ne: userId } }).select(
    "-password"
  );

  return users;
};

export const updateUserProfileService = async (
  userId: string,
  body: UpdateProfileSchemaType
) => {
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  if (body.email && body.email !== user.email) {
    const existing = await UserModel.findOne({ email: body.email });
    if (existing && String(existing._id) !== userId) {
      throw new UnauthorizedException("Email is already in use");
    }
  }

  user.name = body.name;
  user.email = body.email;

  if (typeof body.phone !== "undefined") {
    user.phone = body.phone;
  }

  if (typeof body.avatar !== "undefined") {
    user.avatar = body.avatar;
  }

  await user.save();
  return user;
};
