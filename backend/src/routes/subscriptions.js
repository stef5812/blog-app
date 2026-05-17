// backend/src/routes/subscriptions.js

import express from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

async function findBlogProfile(username) {
  return prisma.blogProfile.findUnique({
    where: { username },
  });
}

/**
 * GET
 * /api/public/blogs/:username/subscription
 */
router.get("/:username/subscription", requireAuth, async (req, res) => {
  try {
    const authUser = req.user;

    const blog = await findBlogProfile(req.params.username);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    const sub = await prisma.blogSubscription.findUnique({
      where: {
        authUserId_blogId: {
          authUserId: authUser.id,
          blogId: blog.id,
        },
      },
    });

    res.json({
      subscribed: !!sub?.active,
    });
  } catch (error) {
    console.error("GET subscription error:", error);
    res.status(500).json({
      error: "Failed to load subscription",
    });
  }
});

/**
 * POST
 * /api/public/blogs/:username/subscribe
 */
router.post("/:username/subscribe", requireAuth, async (req, res) => {
  try {
    const authUser = req.user;

    console.log(
      "SUBSCRIBE ROUTE HIT:",
      req.params.username,
      authUser?.email
    );

    const blog = await findBlogProfile(req.params.username);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

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

    res.json({
      subscribed: true,
    });
  } catch (error) {
    console.error("POST subscribe error:", error);

    res.status(500).json({
      error: "Subscription failed",
    });
  }
});

/**
 * DELETE
 * /api/public/blogs/:username/subscribe
 */
router.delete("/:username/subscribe", requireAuth, async (req, res) => {
  try {
    const authUser = req.user;

    const blog = await findBlogProfile(req.params.username);

    if (!blog) {
      return res.status(404).json({ error: "Blog not found" });
    }

    await prisma.blogSubscription.updateMany({
      where: {
        authUserId: authUser.id,
        blogId: blog.id,
      },
      data: {
        active: false,
      },
    });

    res.json({
      subscribed: false,
    });
  } catch (error) {
    console.error("DELETE subscribe error:", error);

    res.status(500).json({
      error: "Unsubscribe failed",
    });
  }
});

export default router;