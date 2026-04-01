export async function getAuthMe(req) {
  const authMeUrl = process.env.AUTH_ME_URL || "http://localhost:3001/auth/me";
  const cookieHeader = req.headers.cookie || "";

  console.log("=== getAuthMe ===");
  console.log("AUTH_ME_URL =", authMeUrl);
  console.log("COOKIE HEADER =", cookieHeader || "<none>");

  const response = await fetch(authMeUrl, {
    method: "GET",
    headers: {
      cookie: cookieHeader,
      accept: "application/json",
    },
  });

  const text = await response.text();

  console.log("AUTH STATUS =", response.status);
  console.log("AUTH BODY =", text);

  if (!response.ok) {
    return null;
  }

  return JSON.parse(text);
}

export function hasBlogRole(authMe, allowedRoles = []) {
  const appRoles = authMe?.appRoles || [];

  return appRoles.some(
    (r) => r.app === "BLOG_APP" && allowedRoles.includes(r.role)
  );
}