// backend/src/routes/admin.js

import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

function isBlogAdmin(authMe) {
  const roles = authMe?.appRoles || [];

  return roles.some(
    (r) =>
      r.app === "BLOG_APP" &&
      (r.role === "ADMIN" || r.role === "SUPERADMIN")
  );
}

router.use(requireAuth);

router.use((req, res, next) => {
  if (!isBlogAdmin(req.authMe)) {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
});

router.get("/blogs", async (req, res) => {
  try {
    const blogs = await prisma.blogProfile.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        posts: {
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            updatedAt: true,
            publishedAt: true,
          },
        },
      },
    });

    const result = blogs.map((blog) => ({
      id: blog.id,
      userId: blog.userId,
      username: blog.username,
      displayName: blog.displayName,
      siteTitle: blog.siteTitle,
      siteDescription: blog.siteDescription,
      themeAccent: blog.themeAccent,
      postCount: blog.posts.length,
      posts: blog.posts,
      updatedAt: blog.updatedAt,
      createdAt: blog.createdAt,
    }));

    return res.json(result);
  } catch (err) {
    console.error("GET /api/admin/blogs failed:", err);
    return res.status(500).json({ error: "Failed to load blogs" });
  }
});

router.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.post.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Post not found" });
    }

    await prisma.post.delete({
      where: { id },
    });

    return res.json({
      ok: true,
      deletedPostId: id,
      title: existing.title,
    });
  } catch (err) {
    console.error("DELETE /api/admin/posts/:id failed:", err);
    return res.status(500).json({ error: "Failed to delete post" });
  }
});

router.delete("/blogs/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const blog = await prisma.blogProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        userId: true,
        username: true,
        siteTitle: true,
      },
    });

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    await prisma.blogProfile.delete({
      where: { userId },
    });

    return res.json({
      ok: true,
      deletedBlogUserId: userId,
      username: blog.username,
      siteTitle: blog.siteTitle,
    });
  } catch (err) {
    console.error("DELETE /api/admin/blogs/:userId failed:", err);
    return res.status(500).json({ error: "Failed to delete blog" });
  }
});

export default router;