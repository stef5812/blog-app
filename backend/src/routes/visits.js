import express from "express";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { visitorId, path, title, referrer } = req.body || {};

    await prisma.pageVisit.create({
      data: {
        visitorId: visitorId || null,
        path: path || "/",
        title: title || null,
        referrer: referrer || null,
        userAgent: req.headers["user-agent"] || null,
        ipAddress:
          req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
          req.socket.remoteAddress ||
          null,
      },
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Page visit tracking failed:", err);
    res.status(500).json({ error: "Failed to record visit" });
  }
});

export default router;