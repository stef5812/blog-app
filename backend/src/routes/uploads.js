// backend/src/routes/uploads.js

import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { getAuthMe } from "../lib/auth.js";

const router = express.Router();

const uploadRoot = path.join(process.cwd(), "uploads", "blog");
fs.mkdirSync(uploadRoot, { recursive: true });

async function requireAuth(req, res, next) {
  try {
    const authMe = await getAuthMe(req);

    if (!authMe?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.authMe = authMe;
    req.user = authMe.user;
    next();
  } catch {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const userId = req.user?.id || req.user?.sub || "anonymous";
    const userDir = path.join(uploadRoot, String(userId));
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";

    const base = path
      .basename(file.originalname || "image", ext)
      .replace(/[^a-z0-9-_]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    cb(null, `${Date.now()}-${base || "image"}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!allowedTypes.has(file.mimetype)) {
      return cb(new Error("Only image uploads are allowed."));
    }
    cb(null, true);
  },
});

router.post("/image", requireAuth, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: err.message || "Upload failed.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    const userId = req.user?.id || req.user?.sub || "anonymous";

    return res.json({
      ok: true,
      url: `/uploads/blog/${userId}/${req.file.filename}`,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  });
});

export default router;