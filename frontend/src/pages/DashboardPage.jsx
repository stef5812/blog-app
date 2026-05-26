// frontend/src/pages/DashboardPage.jsx

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, apiUpload, authMe } from "../lib/api";
import SiteHeader from "../components/SiteHeader";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const PRESET_AVATARS = [
  `${BASE}/avatars/avatar_circle_0_0.png`,
  `${BASE}/avatars/avatar_circle_0_1.png`,
  `${BASE}/avatars/avatar_circle_0_2.png`,
  `${BASE}/avatars/avatar_circle_1_0.png`,
  `${BASE}/avatars/avatar_circle_1_1.png`,
  `${BASE}/avatars/avatar_circle_1_2.png`,
  `${BASE}/avatars/avatar_circle_2_0.png`,
  `${BASE}/avatars/avatar_circle_2_1.png`,
  `${BASE}/avatars/avatar_circle_2_2.png`,
];

export default function DashboardPage() {
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarMsg, setAvatarMsg] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const auth = await authMe();

        if (!auth?.user) {
          window.location.href =
            "/auth/login?from=blog-app&next=http://localhost:5176/blog-app/dashboard";
          return;
        }

        if (!ignore) setMe(auth);

        const profileData = await apiFetch("/me/profile").catch(() => null);

        if (!ignore) {
          setProfile(profileData || null);
          setAvatarUrl(profileData?.avatarUrl || "");
        }

        if (!profileData) {
          if (!ignore) setPosts([]);
          return;
        }

        const postsData = await apiFetch("/me/posts");

        if (!ignore) {
          setPosts(Array.isArray(postsData) ? postsData : []);
        }
      } catch (error) {
        if (!ignore) {
          setErr(error.message || "Could not load your dashboard.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  function handlePresetSelect(url) {
    setAvatarUrl(url);
    setAvatarMsg("Avatar selected. Save settings to keep it.");
    setErr("");
  }

  function handleBrowseAvatar() {
    setErr("");
    fileInputRef.current?.click();
  }

  async function handleAvatarFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      event.target.value = "";
      return;
    }

    setAvatarBusy(true);
    setAvatarMsg("");
    setErr("");

    try {
      const uploaded = await apiUpload("/uploads/image", file);
      setAvatarUrl(uploaded.url);
      setAvatarMsg("Photo uploaded. Save settings to keep it.");
    } catch (error) {
      setErr(error.message || "Could not upload the profile photo.");
    } finally {
      setAvatarBusy(false);
      event.target.value = "";
    }
  }

  async function handleSaveAvatar() {
    if (!profile) return;

    setAvatarBusy(true);
    setAvatarMsg("");
    setErr("");

    try {
      const savedProfile = await apiFetch("/me/profile", {
        method: "POST",
        body: JSON.stringify({
          username: profile.username || "",
          displayName: profile.displayName || "",
          bio: profile.bio || "",
          avatarUrl,
          siteTitle: profile.siteTitle || "",
          siteDescription: profile.siteDescription || "",
          themeAccent: profile.themeAccent || "#0284c7",
        }),
      });

      setProfile(savedProfile);
      setAvatarUrl(savedProfile?.avatarUrl || "");
      setAvatarMsg("Profile photo saved.");
    } catch (error) {
      setErr(error.message || "Could not save profile photo.");
    } finally {
      setAvatarBusy(false);
    }
  }

  return (
    <div className="app-shell bg-[linear-gradient(180deg,#eff6ff_0%,#f8fafc_42%,#ffffff_100%)]">
      <SiteHeader me={me} />

      <main className="py-3 sm:py-4">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-sky-100 bg-white/90 p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-700">
                  Dashboard
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
                  Your blog workspace
                </h1>

                <p className="mt-1 text-sm text-stone-600">
                  Manage your blog profile and posts.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  to="/dashboard/settings"
                  className="inline-flex items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-50"
                >
                  Settings
                </Link>

                {profile && (
                  <Link
                    to="/dashboard/posts/new"
                    className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                  >
                    New post
                  </Link>
                )}
              </div>
            </div>
          </div>

          {loading && (
            <div className="mt-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm">
              <p className="text-stone-600">Loading dashboard...</p>
            </div>
          )}

          {!loading && err && (
            <div className="mt-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-700">
              {err}
            </div>
          )}

          {!loading && !err && !profile && (
            <div className="mt-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-xl font-semibold text-stone-950">
                Create your blog
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                You are logged in, but you have not created your blog profile
                yet. Go to Settings, choose your username and blog details,
                then save.
              </p>

              <div className="mt-4">
                <Link
                  to="/dashboard/settings"
                  className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-700"
                >
                  Open settings
                </Link>
              </div>
            </div>
          )}

          {!loading && !err && profile && (
            <>
              <div className="mt-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={
                              profile.displayName ||
                              profile.siteTitle ||
                              "Profile"
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                            No photo
                          </div>
                        )}
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold text-stone-950">
                          {profile.siteTitle ||
                            profile.displayName ||
                            "Your blog"}
                        </h2>

                        <p className="mt-1 text-sm text-stone-600">
                          {profile.username
                            ? `@${profile.username}`
                            : ""}
                        </p>

                        {profile.siteDescription && (
                          <p className="mt-2 text-sm leading-6 text-stone-600">
                            {profile.siteDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        to={`/blog/${profile.username}`}
                        className="inline-flex items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-50"
                      >
                        View public blog
                      </Link>

                      <Link
                        to="/dashboard/waypoints/new"
                        className="inline-flex items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-50"
                      >
                        Add waypoint
                      </Link>

                      <Link
                        to="/dashboard/waypoints"
                        className="inline-flex items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-50"
                      >
                        Edit waypoints
                      </Link>
                    </div>
                  </div>

                  <div className="w-full max-w-sm rounded-2xl border border-sky-100 bg-sky-50/40 p-4">
                    <h3 className="text-base font-semibold text-stone-950">
                      Profile photo
                    </h3>

                    <div className="mt-3 flex justify-center">
                      <div className="h-24 w-24 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                            No image
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-stone-950">
                    Your posts
                  </h2>

                  <span className="rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
                    {posts.length} post{posts.length === 1 ? "" : "s"}
                  </span>
                </div>

                {posts.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-sky-200 p-4 text-sm text-stone-600">
                    You have no posts yet.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-xl border border-stone-200 bg-white p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-base font-semibold text-stone-950">
                              {post.title || "Untitled post"}
                            </h3>

                            <p className="mt-1 text-sm text-stone-500">
                              {post.slug
                                ? `/blog/${profile.username}/post/${post.slug}`
                                : "No slug"}
                            </p>

                            <p className="mt-1 text-xs text-stone-500">
                              Updated{" "}
                              {post.updatedAt
                                ? new Date(post.updatedAt).toLocaleString()
                                : "—"}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/dashboard/posts/${post.id}`}
                              className="inline-flex items-center justify-center rounded-xl border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-800 transition hover:bg-sky-50"
                            >
                              Edit
                            </Link>

                            {post.slug && (
                              <Link
                                to={`/blog/${profile.username}/post/${post.slug}`}
                                className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-950"
                              >
                                View
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}