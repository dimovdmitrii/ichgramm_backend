import { Schema, model, Document } from "mongoose";

import { emailRegexp, usernameRegexp } from "../../constants/auth.constants.js";

import { handleSaveError, setUpdateSettings } from "../hooks.js";

export interface UserDocument extends Document {
  email: string;
  fullName: string;
  username: string;
  password: string;
  avatar?: string;
  bio?: string;
  website?: string;
  verify: boolean;
  followingCount?: number;
  followersCount?: number;
  accessToken?: string;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: emailRegexp,
    },
    fullName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 50,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 3,
      maxlength: 30,
      match: usernameRegexp,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 200,
      default: "",
    },
    website: {
      type: String,
      maxlength: 200,
      default: "",
    },
    verify: {
      type: Boolean,
      default: false,
    },
    followingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    followersCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    accessToken: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { versionKey: false, timestamps: true },
);

userSchema.post("save", handleSaveError);

userSchema.pre("findOneAndUpdate" as any, setUpdateSettings);

userSchema.post("findOneAndUpdate" as any, handleSaveError);

// Индекс на username уже создается автоматически через unique: true
// Дополнительный индекс не нужен

const User = model<UserDocument>("user", userSchema);

export default User;
