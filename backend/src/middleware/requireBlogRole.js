import { hasBlogRole } from "../lib/auth.js";

export function requireBlogRole(...roles) {
  return (req, res, next) => {
    if (!req.authMe?.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!hasBlogRole(req.authMe, roles)) {
      return res.status(403).json({ error: "Insufficient role" });
    }

    next();
  };
}