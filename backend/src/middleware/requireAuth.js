import { getAuthMe } from "../lib/auth.js";

export async function requireAuth(req, res, next) {
  try {
    console.log("=== requireAuth ===");
    console.log("REQ URL =", req.originalUrl);
    console.log("REQ COOKIE =", req.headers.cookie || "<none>");

    const authMe = await getAuthMe(req);

    console.log("AUTHME OBJECT =", authMe);

    if (!authMe?.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    req.authMe = authMe;
    req.user = authMe.user;
    req.appRoles = authMe.appRoles || [];

    next();
  } catch (err) {
    console.error("requireAuth error:", err);
    res.status(500).json({ error: "Authentication check failed" });
  }
}