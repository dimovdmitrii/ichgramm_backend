import "dotenv/config";
import mongoose from "mongoose";
import Post from "../db/models/Post.js";
import Like from "../db/models/Like.js";
import Comment from "../db/models/Comment.js";

const { MONGODB_URI } = process.env;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI not defined in environment variables");
}

const deleteAllPosts = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to database successfully");

    // Подсчитываем количество постов перед удалением
    const postsCount = await Post.countDocuments();
    console.log(`Found ${postsCount} posts in database`);

    if (postsCount === 0) {
      console.log("No posts to delete");
      await mongoose.disconnect();
      return;
    }

    // Удаляем все лайки, связанные с постами
    const likesCount = await Like.countDocuments();
    console.log(`Found ${likesCount} likes in database`);
    
    let deletedLikesCount = 0;
    if (likesCount > 0) {
      const deletedLikes = await Like.deleteMany({});
      deletedLikesCount = deletedLikes.deletedCount;
      console.log(`Deleted ${deletedLikesCount} likes`);
    }

    // Удаляем все комментарии, связанные с постами
    const commentsCount = await Comment.countDocuments();
    console.log(`Found ${commentsCount} comments in database`);
    
    let deletedCommentsCount = 0;
    if (commentsCount > 0) {
      const deletedComments = await Comment.deleteMany({});
      deletedCommentsCount = deletedComments.deletedCount;
      console.log(`Deleted ${deletedCommentsCount} comments`);
    }

    // Удаляем все посты
    const result = await Post.deleteMany({});
    console.log(`\n✅ Successfully deleted ${result.deletedCount} posts from database`);
    console.log(`✅ Deleted ${deletedLikesCount} likes`);
    console.log(`✅ Deleted ${deletedCommentsCount} comments`);

    await mongoose.disconnect();
    console.log("Disconnected from database");
    process.exit(0);
  } catch (error) {
    console.error("Error deleting posts:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

deleteAllPosts();

