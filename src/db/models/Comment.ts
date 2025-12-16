import { Schema, model, Document, Types } from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks.js";

export interface CommentDocument extends Document {
  post: Types.ObjectId;
  user: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<CommentDocument>(
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
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

CommentSchema.post("save", handleSaveError);
CommentSchema.pre("findOneAndUpdate" as any, setUpdateSettings);
CommentSchema.post("findOneAndUpdate" as any, handleSaveError);

const Comment = model<CommentDocument>("Comment", CommentSchema);

export default Comment;
