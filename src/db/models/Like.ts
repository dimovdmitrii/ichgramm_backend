import { Schema, model, Document, Types } from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks.js";

export interface LikeDocument extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<LikeDocument>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

LikeSchema.index({ post: 1, user: 1 }, { unique: true });
// Индекс на post для быстрого подсчета лайков
LikeSchema.index({ post: 1 });

LikeSchema.post("save", handleSaveError);
LikeSchema.pre("findOneAndUpdate" as any, setUpdateSettings);
LikeSchema.post("findOneAndUpdate" as any, handleSaveError);

const Like = model<LikeDocument>("Like", LikeSchema);

export default Like;
