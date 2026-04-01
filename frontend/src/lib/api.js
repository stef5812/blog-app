// frontend/src/lib/api.js

const APP_BASE = import.meta.env.DEV ? "" : "/blog-app";
const API_BASE = `${APP_BASE}/api`;
const UPLOAD_BASE = `${APP_BASE}/uploads`;
const AUTH_BASE = import.meta.env.DEV ? "/auth" : "https://auth.stefandodds.ie/auth";

function buildUrl(base, path) {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(path, options = {}) {
  const response = await fetch(buildUrl(API_BASE, path), {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Request failed: ${response.status}`);
  }

  return data;
}

export async function authMe() {
  const response = await fetch(`${AUTH_BASE}/me`, {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Request failed: ${response.status}`);
  }

  return data;
}

export async function apiUpload(path, file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(buildUrl(API_BASE, path), {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.error || "Upload failed.");
  }

  return data;
}