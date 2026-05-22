import express from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

function getAuthUserId(req) {
  return (
    req.user?.id ||
    req.user?.authUserId ||
    req.authUser?.id ||
    req.auth?.userId
  );
}

router.get("/", async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);

    if (!authUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const blogProfile = await prisma.blogProfile.findUnique({
      where: { userId: authUserId },
    });

    if (!blogProfile) {
      return res.status(404).json({ error: "Blog profile not found." });
    }

    const waypoints = await prisma.blogWaypoint.findMany({
      where: { blogProfileId: blogProfile.id },
      include: {
        posts: {
          include: {
            post: {
              select: {
                id: true,
                title: true,
                slug: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: [{ startedAt: "asc" }, { createdAt: "asc" }],
    });

    res.json({ waypoints });
  } catch (error) {
    console.error("GET /api/me/waypoints error:", error);
    res.status(500).json({ error: "Failed to load waypoints." });
  }
});

router.post("/", async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);

    if (!authUserId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

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
      bookingStatus,
      startedAt,
      notes,
      postIds = [],
    } = req.body;

    const blogProfile = await prisma.blogProfile.findUnique({
      where: { userId: authUserId },
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

        travelMode: travelMode || "FOOT",
        customMode: travelMode === "OTHER" ? customMode || null : null,
        travelGroup: travelGroup || "ALONE",
        bookingStatus: bookingStatus || "BOOKED",
        startedAt: startedAt ? new Date(startedAt) : null,
        notes: notes || null,

        posts: {
          create: Array.isArray(postIds)
            ? postIds.map((postId) => ({ postId }))
            : [],
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
    res.status(500).json({ error: "Failed to save waypoint." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    const { id } = req.params;

    const blogProfile = await prisma.blogProfile.findUnique({
      where: { userId: authUserId },
    });

    if (!blogProfile) {
      return res.status(404).json({ error: "Blog profile not found." });
    }

    const waypoint = await prisma.blogWaypoint.findFirst({
      where: {
        id,
        blogProfileId: blogProfile.id,
      },
      include: {
        posts: {
          include: {
            post: true,
          },
        },
      },
    });

    if (!waypoint) {
      return res.status(404).json({ error: "Waypoint not found." });
    }

    return res.json({ waypoint });
  } catch (error) {
    console.error("GET /api/me/waypoints/:id error:", error);
    return res.status(500).json({ error: "Failed to load waypoint." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    const { id } = req.params;

    const blogProfile = await prisma.blogProfile.findUnique({
      where: { userId: authUserId },
    });

    if (!blogProfile) {
      return res.status(404).json({ error: "Blog profile not found." });
    }

    const waypoint = await prisma.blogWaypoint.findFirst({
      where: {
        id,
        blogProfileId: blogProfile.id,
      },
    });

    if (!waypoint) {
      return res.status(404).json({ error: "Waypoint not found." });
    }

    await prisma.blogWaypoint.delete({
      where: { id: waypoint.id },
    });

    return res.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/me/waypoints/:id error:", error);
    return res.status(500).json({ error: "Failed to delete waypoint." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const authUserId = getAuthUserId(req);
    const { id } = req.params;

    const blogProfile = await prisma.blogProfile.findUnique({
      where: { userId: authUserId },
    });

    if (!blogProfile) {
      return res.status(404).json({ error: "Blog profile not found." });
    }

    const existing = await prisma.blogWaypoint.findFirst({
      where: {
        id,
        blogProfileId: blogProfile.id,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: "Waypoint not found." });
    }

    const updated = await prisma.blogWaypoint.update({
      where: { id: existing.id },
      data: {
        title: req.body.title || null,
        fromName: req.body.fromName,
        fromLat: Number(req.body.fromLat),
        fromLng: Number(req.body.fromLng),
        toName: req.body.toName,
        toLat: Number(req.body.toLat),
        toLng: Number(req.body.toLng),
        travelMode: req.body.travelMode || "FOOT",
        customMode: req.body.travelMode === "OTHER" ? req.body.customMode || null : null,
        travelGroup: req.body.travelGroup || "ALONE",
        bookingStatus: req.body.bookingStatus || "BOOKED",
        startedAt: req.body.startedAt ? new Date(req.body.startedAt) : null,
        notes: req.body.notes || null,
      },
    });

    return res.json({ waypoint: updated });
  } catch (error) {
    console.error("PUT /api/me/waypoints/:id error:", error);
    return res.status(500).json({ error: "Failed to update waypoint." });
  }
});

export default router;