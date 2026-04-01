// backend/src/server.js

import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import publicRoutes from "./routes/public.js";
import meRoutes from "./routes/me.js";
import adminRoutes from "./routes/admin.js";
import uploadRoutes from "./routes/uploads.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use((req, res, next) => {
  console.log("INCOMING:", req.method, req.url);
  next();
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/health", (req, res) => {
  res.json({ ok: true, app: "blog-app" });
});

app.get("/api/health", (req, res) => {
  res.json({ ok: true, app: "blog-app" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/me", meRoutes);
app.use("/api/uploads", uploadRoutes);

const port = Number(process.env.PORT || 3005);

app.listen(port, () => {
  console.log(`blog-app backend listening on http://localhost:${port}`);
});