// backend/src/routes/ai.routes.js
import express from "express";
import { rewriteText, generateTitles } from "../services/ai.service.js";

const router = express.Router();

router.post("/rewrite", async (req, res) => {
  try {
    const { text, instruction } = req.body || {};

    const rewritten = await rewriteText({ text, instruction });

    res.json({
      ok: true,
      result: rewritten,
    });
  } catch (error) {
    console.error("AI rewrite error:", error);
    res.status(400).json({
      ok: false,
      error: error.message || "AI rewrite failed.",
    });
  }
});

router.post("/title", async (req, res) => {
  try {
    const { content } = req.body || {};

    const titles = await generateTitles(content);

    res.json({
      ok: true,
      titles,
    });
  } catch (error) {
    console.error("AI title error:", error);
    res.status(400).json({
      ok: false,
      error: error.message || "AI title generation failed.",
    });
  }
});

export default router;