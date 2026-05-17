import express from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.get("/public/blogs/:username/subscription", requireAuth, async (req, res) => {
  const authUser = req.user;

  const blog = await prisma.blog.findUnique({
    where: { username: req.params.username },
  });

  if (!blog) return res.status(404).json({ error: "Blog not found" });

  const sub = await prisma.blogSubscription.findUnique({
    where: {
      authUserId_blogId: {
        authUserId: authUser.id,
        blogId: blog.id,
      },
    },
  });

  res.json({ subscribed: !!sub?.active });
});

router.post("/public/blogs/:username/subscribe", requireAuth, async (req, res) => {
  const authUser = req.user;

  const blog = await prisma.blog.findUnique({
    where: { username: req.params.username },
  });

  if (!blog) return res.status(404).json({ error: "Blog not found" });

  await prisma.blogSubscription.upsert({
    where: {
      authUserId_blogId: {
        authUserId: authUser.id,
        blogId: blog.id,
      },
    },
    update: {
      active: true,
      email: authUser.email,
    },
    create: {
      authUserId: authUser.id,
      email: authUser.email,
      blogId: blog.id,
      active: true,
    },
  });

  res.json({ subscribed: true });
});

router.delete("/public/blogs/:username/subscribe", requireAuth, async (req, res) => {
  const authUser = req.user;

  const blog = await prisma.blog.findUnique({
    where: { username: req.params.username },
  });

  if (!blog) return res.status(404).json({ error: "Blog not found" });

  await prisma.blogSubscription.updateMany({
    where: {
      authUserId: authUser.id,
      blogId: blog.id,
    },
    data: {
      active: false,
    },
  });

  res.json({ subscribed: false });
});

export default router;