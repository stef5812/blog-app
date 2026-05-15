// backend/src/routes/me.js

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { slugify } from "../lib/slugify.js";

import multer from "multer";
import fs from "fs";
import path from "path";

const router = Router();

const publicUploadsBase = process.env.PUBLIC_UPLOADS_BASE || "";
const uploadRoot = path.join(process.cwd(), "uploads", "blog");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user.id;
    const userDir = path.join(uploadRoot, String(userId));

    fs.mkdirSync(userDir, { recursive: true });

    cb(null, userDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024,
  },
});

router.use(requireAuth);

router.get("/profile", async (req, res) => {
  try {
    const userId = req.user.id;

    let profile = await prisma.blogProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const baseUsername =
        req.user.displayName?.trim() ||
        req.user.email?.split("@")[0] ||
        `user-${userId.slice(-6)}`;

      let username = slugify(baseUsername) || `user-${userId.slice(-6)}`;
      let suffix = 1;

      while (await prisma.blogProfile.findUnique({ where: { username } })) {
        suffix += 1;
        username = `${slugify(baseUsername) || `user-${userId.slice(-6)}`}-${suffix}`;
      }

      profile = await prisma.blogProfile.create({
        data: {
          userId,
          username,
          avatarUrl: "",
          displayName: req.user.displayName || "",
          bio: "",
          siteTitle: "",
          siteDescription: "",
          themeAccent: "#65a30d",
        },
      });
    }

    return res.json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load profile" });
  }
});

router.post("/profile", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      username,
      displayName,
      bio,
      avatarUrl,
      siteTitle,
      siteDescription,
      themeAccent,
    } = req.body;

    const cleanUsername = slugify(username || "");

    if (!cleanUsername || cleanUsername.length < 3) {
      return res.status(400).json({
        error: "Please enter a username of at least 3 characters.",
      });
    }

    const existingUsername = await prisma.blogProfile.findUnique({
      where: { username: cleanUsername },
    });

    if (existingUsername && existingUsername.userId !== userId) {
      return res.status(409).json({ error: "That username is already taken." });
    }

    const profile = await prisma.blogProfile.upsert({
      where: { userId },
      update: {
        username: cleanUsername,
        displayName: displayName || "",
        bio: bio || "",
        avatarUrl: avatarUrl || "",
        siteTitle: siteTitle || "",
        siteDescription: siteDescription || "",
        themeAccent: themeAccent || "#65a30d",
      },
      create: {
        userId,
        username: cleanUsername,
        displayName: displayName || "",
        bio: bio || "",
        avatarUrl: avatarUrl || "",
        siteTitle: siteTitle || "",
        siteDescription: siteDescription || "",
        themeAccent: themeAccent || "#65a30d",
      },
    });

    return res.json(profile);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save profile" });
  }
});

router.get("/posts", async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.blogProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.json([]);
    }

    const posts = await prisma.post.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    return res.json(posts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load posts" });
  }
});

router.post("/posts", async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      excerpt,
      coverImageUrl,
      coverMediaType,
      coverThumbnailUrl,
      contentJson,
      status,
    } = req.body;

    const profile = await prisma.blogProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(400).json({
        error: "Please create your blog profile first in Settings.",
      });
    }

    const baseSlug = slugify(title || "untitled-post");
    let slug = baseSlug;
    let suffix = 1;

    while (
      await prisma.post.findFirst({
        where: {
          blogProfileId: profile.id,
          slug,
        },
      })
    ) {
      suffix += 1;
      slug = `${baseSlug}-${suffix}`;
    }

    const postStatus = status || "DRAFT";

    const post = await prisma.post.create({
      data: {
        userId,
        blogProfileId: profile.id,
        title: title || "",
        slug,
        excerpt: excerpt || "",
        coverImageUrl: coverImageUrl || "",
        coverMediaType: coverMediaType || (coverImageUrl ? "image" : null),
        coverThumbnailUrl: coverThumbnailUrl || "",
        contentJson: contentJson ?? {},
        status: postStatus,
        publishedAt: postStatus === "PUBLISHED" ? new Date() : null,
      },
    });

    return res.status(201).json(post);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to create post" });
  }
});

router.put("/posts/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      title,
      excerpt,
      coverImageUrl,
      coverMediaType,
      coverThumbnailUrl,
      contentJson,
      status,
    } = req.body;

    const existing = await prisma.post.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    const data = {
      title,
      excerpt,
      coverImageUrl,
      coverMediaType: coverMediaType || (coverImageUrl ? "image" : null),
      coverThumbnailUrl: coverThumbnailUrl || "",
      contentJson,
      status,
    };

    if (status === "PUBLISHED" && !existing.publishedAt) {
      data.publishedAt = new Date();
    }

    const updated = await prisma.post.update({
      where: { id },
      data,
    });

    return res.json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update post" });
  }
});

router.get("/posts/:id/gallery", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const post = await prisma.post.findFirst({
      where: { id, userId },
      include: {
        mediaItems: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const items = [];

    if (post.coverImageUrl) {
      items.push({
        id: `cover-${post.id}`,
        url: post.coverImageUrl,
        mediaType: post.coverMediaType || "image",
        thumbnailUrl: post.coverThumbnailUrl || null,
        caption: "Cover media",
        source: "cover",
        locked: true,
      });
    }

    function extractMedia(node) {
      if (!node) return;

      if (node.type === "image" && node.attrs?.src) {
        items.push({
          id: `img-${items.length}`,
          url: node.attrs.src,
          mediaType: "image",
          thumbnailUrl: null,
          caption: node.attrs.alt || "",
          source: "post",
          locked: true,
        });
      }

      if (Array.isArray(node.content)) {
        node.content.forEach(extractMedia);
      }
    }

    extractMedia(post.contentJson);

    const galleryItems = post.mediaItems.map((item) => ({
      id: item.id,
      url: item.url,
      mediaType: item.mediaType,
      thumbnailUrl: item.thumbnailUrl || null,
      caption: item.title || item.description || "",
      title: item.title || "",
      description: item.description || "",
      source: item.source || "gallery",
      locked: false,
      createdAt: item.createdAt,
    }));

    return res.json({
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        authorUsername: req.user.username || req.user.email,
      },
      items: [...galleryItems, ...items],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load gallery" });
  }
});

router.post("/posts/:id/gallery/upload", upload.single("file"), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const post = await prisma.post.findFirst({
      where: { id, userId },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const ext = path.extname(req.file.filename).toLowerCase();

    const mediaType = [".mp4", ".webm", ".mov", ".ogg"].includes(ext)
      ? "video"
      : "image";

    const url = `${publicUploadsBase}/uploads/blog/${userId}/${req.file.filename}`;

    const item = await prisma.mediaItem.create({
      data: {
        userId,
        postId: post.id,
        url,
        mediaType,
        thumbnailUrl: null,
        title: req.body.caption || "",
        description: "",
        source: "gallery",
      },
    });

    return res.status(201).json({
      item: {
        id: item.id,
        url: item.url,
        mediaType: item.mediaType,
        thumbnailUrl: item.thumbnailUrl || null,
        caption: item.title || "",
        title: item.title || "",
        description: item.description || "",
        source: item.source,
        locked: false,
        createdAt: item.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to upload gallery item" });
  }
});

router.patch("/posts/:id/gallery/:itemId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, itemId } = req.params;
    const { caption } = req.body;

    const post = await prisma.post.findFirst({
      where: { id, userId },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const item = await prisma.mediaItem.findFirst({
      where: {
        id: itemId,
        postId: id,
        userId,
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Gallery item not found" });
    }

    const updated = await prisma.mediaItem.update({
      where: { id: item.id },
      data: {
        title: caption || "",
      },
    });

    return res.json({
      item: {
        id: updated.id,
        url: updated.url,
        mediaType: updated.mediaType,
        thumbnailUrl: updated.thumbnailUrl || null,
        caption: updated.title || "",
        title: updated.title || "",
        description: updated.description || "",
        source: updated.source,
        locked: false,
        createdAt: updated.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to update gallery item" });
  }
});

router.delete("/posts/:id/gallery/:itemId", async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, itemId } = req.params;

    const item = await prisma.mediaItem.findFirst({
      where: {
        id: itemId,
        postId: id,
        userId,
      },
    });

    if (!item) {
      return res.status(404).json({ error: "Gallery item not found" });
    }

    await prisma.mediaItem.delete({
      where: { id: item.id },
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to delete gallery item" });
  }
});

export default router;