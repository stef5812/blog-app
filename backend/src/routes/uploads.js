// backend/src/routes/uploads.js

import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { getAuthMe } from "../lib/auth.js";

const router = express.Router();

const publicUploadsBase = process.env.PUBLIC_UPLOADS_BASE || "";

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

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const allowedVideoTypes = new Set([
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
]);

const allowedAudioTypes = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/webm",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
]);

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const userId = req.user?.id || req.user?.sub || "anonymous";
    const userDir = path.join(uploadRoot, String(userId));
    fs.mkdirSync(userDir, { recursive: true });
    cb(null, userDir);
  },
  filename(req, file, cb) {
    let fallbackExt = ".jpg";
    let defaultBase = "image";

    if (file.mimetype.startsWith("video/")) {
      fallbackExt = ".mp4";
      defaultBase = "video";
    } else if (file.mimetype.startsWith("audio/")) {
      fallbackExt = ".mp3";
      defaultBase = "audio";
    }

    const ext = path.extname(file.originalname || "").toLowerCase() || fallbackExt;

    const base = path
      .basename(file.originalname || defaultBase, ext)
      .replace(/[^a-z0-9-_]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .toLowerCase();

    cb(null, `${Date.now()}-${base || defaultBase}${ext}`);
  },
});

const imageUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!allowedImageTypes.has(file.mimetype)) {
      return cb(new Error("Only image uploads are allowed."));
    }
    cb(null, true);
  },
});

const videoUpload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!allowedVideoTypes.has(file.mimetype)) {
      return cb(new Error("Only video uploads are allowed."));
    }
    cb(null, true);
  },
});

const audioUpload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    if (!allowedAudioTypes.has(file.mimetype)) {
      return cb(new Error("Only audio uploads are allowed."));
    }
    cb(null, true);
  },
});

router.post("/image", requireAuth, (req, res) => {
  imageUpload.single("image")(req, res, (err) => {
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
      url: `${publicUploadsBase}/uploads/blog/${userId}/${req.file.filename}`,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      mediaType: "image",
      thumbnailUrl: null,
    });
  });
});

router.post("/video", requireAuth, (req, res) => {
  videoUpload.single("video")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: err.message || "Upload failed.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No video uploaded." });
    }

    const userId = req.user?.id || req.user?.sub || "anonymous";

    return res.json({
      ok: true,
      url: `${publicUploadsBase}/uploads/blog/${userId}/${req.file.filename}`,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      mediaType: "video",
      thumbnailUrl: null,
    });
  });
});

router.post("/audio", requireAuth, (req, res) => {
  audioUpload.single("audio")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        error: err.message || "Upload failed.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No audio uploaded." });
    }

    const userId = req.user?.id || req.user?.sub || "anonymous";

    return res.json({
      ok: true,
      url: `${publicUploadsBase}/uploads/blog/${userId}/${req.file.filename}`,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      mediaType: "audio",
    });
  });
});

export default router;