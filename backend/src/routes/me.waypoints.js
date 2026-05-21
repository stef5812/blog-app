// backend/src/routes/me.waypoints.js

import express from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  try {
    const authUserId =
      req.user?.id ||
      req.user?.authUserId ||
      req.authUser?.id ||
      req.auth?.userId;

    if (!authUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    console.log("WAYPOINT authUserId:", authUserId);

    const blogProfile = await prisma.blogProfile.findUnique({
      where: { userId: authUserId },
    });

    console.log("WAYPOINT blogProfile:", blogProfile);

    if (!blogProfile) {
      return res.status(404).json({ error: "Blog profile not found." });
    }

    const waypoints = await prisma.blogWaypoint.findMany({
      where: { blogProfileId: blogProfile.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ waypoints });
  } catch (error) {
    console.error("Failed to load waypoints:", error);
    res.status(500).json({ error: "Failed to load waypoints." });
  }
});

router.post("/", async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      title,
      fromName,
      fromLat,
      fromLng,
      toName,
      toLat,
      toLng,
      travelMode,
      customMode,
      travelGroup,
      startedAt,
      notes,
      postIds = [],
    } = req.body;

    const blogProfile = await prisma.blogProfile.findUnique({
      where: { userId },
    });

    if (!blogProfile) {
      return res.status(404).json({ error: "Blog profile not found." });
    }

    if (
      !fromName ||
      !toName ||
      fromLat == null ||
      fromLng == null ||
      toLat == null ||
      toLng == null
    ) {
      return res.status(400).json({
        error: "Start and destination are required.",
      });
    }

    const waypoint = await prisma.blogWaypoint.create({
      data: {
        blogProfileId: blogProfile.id,
        title: title || null,

        fromName,
        fromLat: Number(fromLat),
        fromLng: Number(fromLng),

        toName,
        toLat: Number(toLat),
        toLng: Number(toLng),

        travelMode,
        customMode: travelMode === "OTHER" ? customMode || null : null,
        travelGroup,
        startedAt: startedAt ? new Date(startedAt) : null,
        notes: notes || null,

        posts: {
          create: postIds.map((postId) => ({
            postId,
          })),
        },
      },
      include: {
        posts: {
          include: {
            post: true,
          },
        },
      },
    });

    res.status(201).json({ waypoint });
  } catch (error) {
    console.error("POST /api/me/waypoints error:", error);
    res.status(500).json({ error: "Failed to create waypoint." });
  }
});

export default router;