import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";

const uploadsDir = path.join(process.cwd(), "uploads", "posts");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext =
      path.extname(file.originalname)?.toLowerCase() ||
      ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)
      ? ext
      : ".jpg";
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`;
    cb(null, name);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowed = /^image\/(jpeg|jpg|png|gif|webp)$/i;
  if (allowed.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpeg, png, gif, webp) are allowed"));
  }
};

const uploadPostImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}); // 5 MB

export default uploadPostImage;
