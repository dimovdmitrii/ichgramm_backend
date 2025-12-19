import { Schema, model, Document, Types } from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks.js";

export interface FollowDocument extends Document {
  follower: Types.ObjectId;
  following: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FollowSchema = new Schema<FollowDocument>(
  {
    follower: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    following: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Уникальный индекс: один пользователь не может подписаться на другого дважды
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
// Отдельные индексы для быстрого поиска по follower и following
FollowSchema.index({ follower: 1 });
FollowSchema.index({ following: 1 });

// Предотвращение самоподписки
FollowSchema.pre("save", function (this: any, next: any) {
  if (typeof next !== "function") {
    return;
  }
  if (this.follower && this.following && this.follower.toString() === this.following.toString()) {
    const error = new Error("Cannot follow yourself");
    return next(error);
  }
  next();
});

FollowSchema.post("save", handleSaveError);
FollowSchema.pre("findOneAndUpdate" as any, setUpdateSettings);
FollowSchema.post("findOneAndUpdate" as any, handleSaveError);

const Follow = model<FollowDocument>("Follow", FollowSchema);

export default Follow;

