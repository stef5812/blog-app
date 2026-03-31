// backend/src/lib/auth.js

export async function getAuthMe(req) {
    const authMeUrl = process.env.AUTH_ME_URL || "http://localhost:3001/auth/me";
  
    const cookieHeader = req.headers.cookie || "";
  
    const response = await fetch(authMeUrl, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
        accept: "application/json",
      },
    });
  
    if (!response.ok) {
      return null;
    }
  
    return response.json();
  }
  
  export function hasBlogRole(authMe, allowedRoles = []) {
    const appRoles = authMe?.appRoles || [];
  
    return appRoles.some(
      (r) => r.app === "BLOG_APP" && allowedRoles.includes(r.role)
    );
  }