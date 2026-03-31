import fs from "fs";
import path from "path";

export function ensureUserUploadDir(userId) {
  const root = process.env.UPLOAD_ROOT || "uploads/blog";
  const fullDir = path.join(process.cwd(), root, userId);

  fs.mkdirSync(fullDir, { recursive: true });

  return {
    root,
    fullDir,
  };
}