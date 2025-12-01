import { Schema, model, Document } from "mongoose";

import { emailRegexp, usernameRegexp } from "../../constants/auth.constants.js";

import { handleSaveError, setUpdateSettings } from "../hooks.js";

export interface UserDocument extends Document {
  email: string;
  fullName: string;
  username: string;
  password: string;
  verify: boolean;
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
    verify: {
      type: Boolean,
      default: false,
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

userSchema.pre("findOneAndUpdate", setUpdateSettings);

userSchema.post("findOneAndUpdate", handleSaveError);

const User = model<UserDocument>("user", userSchema);

export default User;
