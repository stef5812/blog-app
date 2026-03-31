// backend/src/routes/me.js

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { slugify } from "../lib/slugify.js";

const router = Router();

// All /me routes require login, but not AUTHOR/ADMIN
router.use(requireAuth);

router.get("/profile", async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.blogProfile.findUnique({
      where: { userId },
    });

    return res.json(profile || null);
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
        siteTitle: siteTitle || "",
        siteDescription: siteDescription || "",
        themeAccent: themeAccent || "#65a30d",
      },
      create: {
        userId,
        username: cleanUsername,
        displayName: displayName || "",
        bio: bio || "",
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
    const { title, excerpt, coverImageUrl, contentJson } = req.body;

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

    const post = await prisma.post.create({
      data: {
        userId,
        blogProfileId: profile.id,
        title: title || "",
        slug,
        excerpt: excerpt || "",
        coverImageUrl: coverImageUrl || "",
        contentJson: contentJson ?? {},
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
    const { title, excerpt, coverImageUrl, contentJson, status } = req.body;

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

export default router;