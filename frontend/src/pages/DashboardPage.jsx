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

        if (!ignore) {
          setMe(auth);
        }

        const profileData = await apiFetch("/me/profile").catch(() => null);

        if (!ignore) {
          setProfile(profileData || null);
          setAvatarUrl(profileData?.avatarUrl || "");
        }

        if (!profileData) {
          if (!ignore) {
            setPosts([]);
          }
          return;
        }

        const postsData = await apiFetch("/me/posts").catch(() => []);

        if (!ignore) {
          setPosts(Array.isArray(postsData) ? postsData : []);
        }
      } catch (error) {
        if (!ignore) {
          setErr(error.message || "Could not load your dashboard.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
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
          themeAccent: profile.themeAccent || "#65a30d",
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
    <div className="app-shell bg-[linear-gradient(180deg,#f7fff7_0%,#f8fafc_28%,#ffffff_100%)]">
      <SiteHeader me={me} />

      <main className="page-section">
        <div className="page-wrap">
          <div className="card border-lime-100 p-6 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-lime-700">Dashboard</p>
                <h1 className="section-title">Your blog workspace</h1>
                <p className="mt-2 text-slate-600">
                  Manage your blog profile and posts.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/dashboard/settings"
                  className="btn-secondary border-lime-200 text-lime-800 hover:bg-lime-50"
                >
                  Settings
                </Link>

                {profile && (
                  <Link
                    to="/dashboard/posts/new"
                    className="btn-primary bg-lime-600 hover:bg-lime-700"
                  >
                    New post
                  </Link>
                )}
              </div>
            </div>
          </div>

          {loading && (
            <div className="mt-6 card border-lime-100 p-6">
              <p className="text-slate-600">Loading dashboard...</p>
            </div>
          )}

          {!loading && err && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          )}

          {!loading && !err && !profile && (
            <div className="mt-6 card border-lime-100 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-950">
                Create your blog
              </h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                You are logged in, but you have not created your blog profile yet.
                Go to Settings, choose your username and blog details, then save.
              </p>

              <div className="mt-6">
                <Link
                  to="/dashboard/settings"
                  className="btn-primary bg-lime-600 hover:bg-lime-700"
                >
                  Open settings
                </Link>
              </div>
            </div>
          )}

          {!loading && !err && profile && (
            <>
              <div className="mt-6 card border-lime-100 p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                      <div className="h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={profile.displayName || profile.siteTitle || "Profile"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                            No photo
                          </div>
                        )}
                      </div>

                      <div>
                        <h2 className="text-xl font-semibold text-slate-950">
                          {profile.siteTitle || profile.displayName || "Your blog"}
                        </h2>

                        <p className="mt-2 text-slate-600">
                          {profile.username ? `@${profile.username}` : ""}
                        </p>

                        {profile.siteDescription && (
                          <p className="mt-4 text-slate-600">
                            {profile.siteDescription}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link
                        to={`/blog/${profile.username}`}
                        className="btn-secondary border-lime-200 text-lime-800 hover:bg-lime-50"
                      >
                        View public blog
                      </Link>

                      <Link to="/dashboard/settings" className="btn-ghost">
                        Edit settings
                      </Link>
                    </div>
                  </div>

                  <div className="w-full max-w-md rounded-2xl border border-lime-100 bg-white p-5">
                    <h3 className="text-lg font-semibold text-slate-950">
                      Profile photo
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Upload your own photo or choose one of the preset avatars.
                    </p>

                    <div className="mt-4 flex justify-center">
                      <div className="h-28 w-28 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                            No image
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleBrowseAvatar}
                        className="btn-secondary border-lime-200 text-lime-800 hover:bg-lime-50"
                        disabled={avatarBusy}
                      >
                        {avatarBusy ? "Working..." : "Upload photo"}
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveAvatar}
                        className="btn-primary bg-lime-600 hover:bg-lime-700"
                        disabled={avatarBusy}
                      >
                        Save photo
                      </button>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarUrl("");
                            setAvatarMsg("Photo removed. Save settings to keep the change.");
                            setErr("");
                          }}
                          className="btn-ghost"
                          disabled={avatarBusy}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />

                    <div className="mt-6">
                      <p className="text-sm font-medium text-slate-700">
                        Choose a preset
                      </p>

                      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {PRESET_AVATARS.map((url) => {
                          const active = avatarUrl === url;

                          return (
                            <button
                              key={url}
                              type="button"
                              onClick={() => handlePresetSelect(url)}
                              className={`overflow-hidden rounded-2xl border bg-white ${
                                active
                                  ? "border-lime-500 ring-2 ring-lime-200"
                                  : "border-slate-200"
                              }`}
                              title="Choose avatar"
                            >
                              <img
                                src={url}
                                alt="Preset avatar"
                                className="h-16 w-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {avatarMsg && (
                      <p className="mt-4 text-sm text-slate-600">{avatarMsg}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 card border-lime-100 p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-950">Your posts</h2>
                  <span className="rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-800">
                    {posts.length} post{posts.length === 1 ? "" : "s"}
                  </span>
                </div>

                {posts.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-lime-200 p-6 text-slate-600">
                    You have no posts yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="rounded-2xl border border-slate-200 bg-white p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-950">
                              {post.title || "Untitled post"}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {post.slug
                                ? `/blog/${profile.username}/post/${post.slug}`
                                : "No slug"}
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                              Updated{" "}
                              {post.updatedAt
                                ? new Date(post.updatedAt).toLocaleString()
                                : "—"}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Link
                              to={`/dashboard/posts/${post.id}`}
                              className="btn-secondary border-lime-200 text-lime-800 hover:bg-lime-50"
                            >
                              Edit
                            </Link>

                            {post.slug && (
                              <Link
                                to={`/blog/${profile.username}/post/${post.slug}`}
                                className="btn-ghost"
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