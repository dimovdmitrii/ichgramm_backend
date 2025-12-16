import { Schema, model, Document, Types } from "mongoose";

import { handleSaveError, setUpdateSettings } from "../hooks.js";

export interface PostDocument extends Document {
  author: Types.ObjectId;
  image: string;
  content: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<PostDocument>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    image: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

PostSchema.post("save", handleSaveError);
PostSchema.pre("findOneAndUpdate" as any, setUpdateSettings);
PostSchema.post("findOneAndUpdate" as any, handleSaveError);

const Post = model<PostDocument>("Post", PostSchema);

export default Post;
