// backend/src/routes/public.js

import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// Public blog directory
router.get("/blogs", async (req, res) => {
  try {
    const blogs = await prisma.blogProfile.findMany({
      orderBy: [
        { updatedAt: "desc" },
        { createdAt: "desc" },
      ],
      select: {
        id: true,
        userId: true,
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        bannerUrl: true,
        siteTitle: true,
        siteDescription: true,
        themeAccent: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: {
              where: {
                status: "PUBLISHED",
              },
            },
          },
        },
      },
    });

    const result = blogs.map((blog) => ({
      id: blog.id,
      userId: blog.userId,
      username: blog.username,
      displayName: blog.displayName,
      bio: blog.bio,
      avatarUrl: blog.avatarUrl,
      bannerUrl: blog.bannerUrl,
      siteTitle: blog.siteTitle,
      siteDescription: blog.siteDescription,
      themeAccent: blog.themeAccent,
      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      postCount: blog._count?.posts || 0,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load blogs" });
  }
});

// Public profile
router.get("/blogs/:username", async (req, res) => {
  try {
    const { username } = req.params;

    const profile = await prisma.blogProfile.findUnique({
      where: { username },
      select: {
        username: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        bannerUrl: true,
        siteTitle: true,
        siteDescription: true,
        themeAccent: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load profile" });
  }
});

// Public posts for a profile
router.get("/blogs/:username/posts", async (req, res) => {
  try {
    const { username } = req.params;

    const profile = await prisma.blogProfile.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const posts = await prisma.post.findMany({
      where: {
        blogProfileId: profile.id,
        status: "PUBLISHED",
      },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        coverMediaType: true,
        coverThumbnailUrl: true,
        publishedAt: true,
      },
    });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load posts" });
  }
});

// Public single post
router.get("/blogs/:username/posts/:slug", async (req, res) => {
  try {
    const { username, slug } = req.params;

    const profile = await prisma.blogProfile.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        siteTitle: true,
        themeAccent: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const post = await prisma.post.findFirst({
      where: {
        blogProfileId: profile.id,
        slug,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImageUrl: true,
        coverMediaType: true,
        coverThumbnailUrl: true,
        contentJson: true,
        publishedAt: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json({ profile, post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load post" });
  }
});

// Public post gallery
router.get("/blogs/:username/posts/:slug/gallery", async (req, res) => {
  try {
    const { username, slug } = req.params;

    const profile = await prisma.blogProfile.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        siteTitle: true,
        themeAccent: true,
      },
    });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const post = await prisma.post.findFirst({
      where: {
        blogProfileId: profile.id,
        slug,
        status: "PUBLISHED",
      },
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

    // Gallery uploads
    for (const item of post.mediaItems || []) {
      items.push({
        id: item.id,
        url: item.url,
        mediaType: item.mediaType,
        thumbnailUrl: item.thumbnailUrl || null,
        caption: item.title || item.description || "",
        source: item.source || "gallery",
      });
    }

    // Cover image/video
    if (post.coverImageUrl) {
      items.push({
        id: `cover-${post.id}`,
        url: post.coverImageUrl,
        mediaType: post.coverMediaType || "image",
        thumbnailUrl: post.coverThumbnailUrl || null,
        caption: "Cover media",
        source: "cover",
      });
    }

    // Images inside the post content
    function extractMedia(node) {
      if (!node) return;

      if (node.type === "image" && node.attrs?.src) {
        items.push({
          id: `post-${items.length}`,
          url: node.attrs.src,
          mediaType: "image",
          thumbnailUrl: null,
          caption: node.attrs.alt || node.attrs.title || "",
          source: "post",
        });
      }

      if (Array.isArray(node.content)) {
        node.content.forEach(extractMedia);
      }
    }

    extractMedia(post.contentJson);

    return res.json({
      profile,
      post: {
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        publishedAt: post.publishedAt,
      },
      items,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to load gallery" });
  }
});

export default router;