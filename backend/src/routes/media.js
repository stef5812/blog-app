// backend/src/routes/media.js

import express from "express";
import fs from "fs";
import path from "path";
import { getAuthMe } from "../lib/auth.js";
import multer from "multer";

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user?.id || req.user?.sub;
    const userDir = path.join(uploadRoot, String(userId));

    fs.mkdirSync(userDir, { recursive: true });

    cb(null, userDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    cb(null, safeName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 250 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Unsupported file type"));
    }

    cb(null, true);
  },
});

const router = express.Router();

const publicUploadsBase = process.env.PUBLIC_UPLOADS_BASE || "";

const uploadRoot = path.join(process.cwd(), "uploads", "blog");

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

/*
|--------------------------------------------------------------------------
| GET /api/media
|--------------------------------------------------------------------------
| Return all uploaded media for current user
|--------------------------------------------------------------------------
*/

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.sub;

    const userDir = path.join(uploadRoot, String(userId));

    if (!fs.existsSync(userDir)) {
      return res.json({
        ok: true,
        media: [],
      });
    }

    const files = fs.readdirSync(userDir);

    const media = files.map((filename) => {
      const ext = path.extname(filename).toLowerCase();

      let mediaType = "image";

      if (
        [".mp4", ".webm", ".mov", ".ogg"].includes(ext)
      ) {
        mediaType = "video";
      }

      if (
        [".mp3", ".wav", ".m4a", ".aac"].includes(ext)
      ) {
        mediaType = "audio";
      }

      return {
        filename,
        mediaType,
        url: `${publicUploadsBase}/uploads/blog/${userId}/${filename}`,
        thumbnailUrl: null,
      };
    });

    return res.json({
      ok: true,
      media,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to load media.",
    });
  }
});

router.post("/upload", requireAuth, upload.single("file"), async (req, res) => {
    try {
      const userId = req.user?.id || req.user?.sub;
  
      if (!req.file) {
        return res.status(400).json({
          error: "No file uploaded.",
        });
      }
  
      const ext = path.extname(req.file.filename).toLowerCase();
  
      const mediaType = [".mp4", ".webm", ".mov"].includes(ext)
        ? "video"
        : "image";
  
      return res.json({
        ok: true,
        media: {
          filename: req.file.filename,
          mediaType,
          url: `${publicUploadsBase}/uploads/blog/${userId}/${req.file.filename}`,
          thumbnailUrl: null,
        },
      });
    } catch (err) {
      console.error(err);
  
      return res.status(500).json({
        error: "Failed to upload media.",
      });
    }
  });

/*
|--------------------------------------------------------------------------
| DELETE /api/media/:filename
|--------------------------------------------------------------------------
| Delete uploaded media
|--------------------------------------------------------------------------
*/

router.delete("/:filename", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.sub;

    const filename = path.basename(req.params.filename);

    const filePath = path.join(
      uploadRoot,
      String(userId),
      filename
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: "File not found.",
      });
    }

    fs.unlinkSync(filePath);

    return res.json({
      ok: true,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Failed to delete media.",
    });
  }
});

export default router;