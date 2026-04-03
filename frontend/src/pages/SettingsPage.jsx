// frontend/src/pages/SettingsPage.jsx

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, apiUpload, authMe } from "../lib/api";
import SiteHeader from "../components/SiteHeader";
import logoImg from "../assets/stefandodds-logo-ai.png";

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

export default function SettingsPage() {
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({
    username: "",
    displayName: "",
    bio: "",
    avatarUrl: "",
    siteTitle: "",
    siteDescription: "",
    themeAccent: "#65a30d",
  });

  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const avatarInputRef = useRef(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const auth = await authMe();

        if (!auth?.user) {
          window.location.href =
            "/auth/login?from=blog-app&next=http://localhost:5176/blog-app/dashboard/settings";
          return;
        }

        const profile = await apiFetch("/me/profile").catch(() => null);

        if (!ignore) {
          setMe(auth);

          if (profile) {
            setForm({
              username: profile.username || "",
              displayName: profile.displayName || "",
              bio: profile.bio || "",
              avatarUrl: profile.avatarUrl || "",
              siteTitle: profile.siteTitle || "",
              siteDescription: profile.siteDescription || "",
              themeAccent: profile.themeAccent || "#65a30d",
            });
          } else {
            setForm((prev) => ({
              ...prev,
              displayName:
                auth.user.displayName ||
                auth.user.firstName ||
                auth.user.email?.split("@")[0] ||
                "",
            }));
          }
        }
      } catch {
        if (!ignore) setErr("Could not load your profile settings.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleChoosePresetAvatar(url) {
    setForm((prev) => ({
      ...prev,
      avatarUrl: url,
    }));
  }

  function handleBrowseAvatar() {
    setErr("");
    avatarInputRef.current?.click();
  }

  async function handleAvatarFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      e.target.value = "";
      return;
    }

    try {
      setErr("");
      const uploaded = await apiUpload("/uploads/image", file);

      setForm((prev) => ({
        ...prev,
        avatarUrl: uploaded.url,
      }));
    } catch (error) {
      setErr(error.message || "Could not upload the profile photo.");
    } finally {
      e.target.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSavedMsg("");
    setErr("");

    try {
      const savedProfile = await apiFetch("/me/profile", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setForm({
        username: savedProfile.username || "",
        displayName: savedProfile.displayName || "",
        bio: savedProfile.bio || "",
        avatarUrl: savedProfile.avatarUrl || "",
        siteTitle: savedProfile.siteTitle || "",
        siteDescription: savedProfile.siteDescription || "",
        themeAccent: savedProfile.themeAccent || "#65a30d",
      });

      setSavedMsg("Your blog settings have been saved.");
    } catch (error) {
      setErr(error.message || "Could not save your settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell bg-[linear-gradient(180deg,#f7fff7_0%,#f8fafc_28%,#ffffff_100%)]">
      <SiteHeader me={me} />

      <main className="page-section">
        <div className="page-wrap">
          <div className="mb-8 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="card border-lime-100 p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-lime-700">Settings</p>
                  <h1 className="section-title">Build your public blog identity</h1>
                  <p className="mt-2 max-w-2xl text-slate-600">
                    Choose how your blog looks to readers and shape its travel-inspired
                    personality.
                  </p>
                </div>

                <img
                  src={logoImg}
                  alt="Stefandodds.ie Full Stack AI"
                  className="h-auto w-full max-w-[220px]"
                />
              </div>
            </div>

            <div className="card border-lime-100 p-6">
              <p className="text-sm text-slate-500">Preview identity</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-[72px] w-[72px] overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt="Profile avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      No photo
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-lg font-semibold text-slate-950">
                    {form.siteTitle || form.displayName || "Your blog title"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {form.username ? `@${form.username}` : "@your-username"}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                Upload your own image or choose one of the preset avatars below.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <section className="card border-lime-100 p-6 sm:p-8">
              <div className="rounded-3xl border border-lime-100 bg-lime-50/40 p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-slate-950">Profile photo</h2>
                <p className="mt-2 text-sm text-slate-600">
                  Upload your own photo or choose a preset avatar.
                </p>

                <div className="mt-6 flex flex-col gap-6 lg:flex-row">
                  <div className="lg:w-64">
                    <div className="mx-auto h-32 w-32 overflow-hidden rounded-full border border-slate-200 bg-white">
                      {form.avatarUrl ? (
                        <img
                          src={form.avatarUrl}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
                          No photo
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleBrowseAvatar}
                        className="btn-secondary border-lime-200 text-lime-800 hover:bg-lime-50"
                      >
                        Upload photo
                      </button>

                      {form.avatarUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              avatarUrl: "",
                            }))
                          }
                          className="btn-ghost"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">
                      Choose a preset avatar
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {PRESET_AVATARS.map((url) => {
                        const active = form.avatarUrl === url;

                        return (
                          <button
                            key={url}
                            type="button"
                            onClick={() => handleChoosePresetAvatar(url)}
                            className={`overflow-hidden rounded-2xl border bg-white ${
                              active
                                ? "border-lime-500 ring-2 ring-lime-200"
                                : "border-slate-200"
                            }`}
                            aria-label="Choose avatar"
                          >
                            <img
                              src={url}
                              alt="Preset avatar"
                              className="h-20 w-full object-cover"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="field-label">Username</span>
                  <input
                    name="username"
                    value={form.username}
                    onChange={updateField}
                    className="field-input focus:border-lime-500 focus:ring-lime-100"
                    placeholder="stefan"
                  />
                </label>

                <label>
                  <span className="field-label">Display name</span>
                  <input
                    name="displayName"
                    value={form.displayName}
                    onChange={updateField}
                    className="field-input focus:border-lime-500 focus:ring-lime-100"
                    placeholder="Stefan Dodds"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <label>
                  <span className="field-label">Site title</span>
                  <input
                    name="siteTitle"
                    value={form.siteTitle}
                    onChange={updateField}
                    className="field-input focus:border-lime-500 focus:ring-lime-100"
                    placeholder="Stefan’s Travel Blog"
                  />
                </label>

                <label>
                  <span className="field-label">Accent colour</span>
                  <input
                    type="color"
                    name="themeAccent"
                    value={form.themeAccent}
                    onChange={updateField}
                    className="h-12 w-full rounded-2xl border border-lime-200 bg-white px-2"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="field-label">Site description</span>
                <input
                  name="siteDescription"
                  value={form.siteDescription}
                  onChange={updateField}
                  className="field-input focus:border-lime-500 focus:ring-lime-100"
                  placeholder="Stories, travel notes, places, people, and ideas."
                />
              </label>

              <label className="mt-5 block">
                <span className="field-label">Bio</span>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={updateField}
                  rows={6}
                  className="field-textarea focus:border-lime-500 focus:ring-lime-100"
                  placeholder="Tell readers about your background, travels, and writing."
                />
              </label>

              {loading && (
                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-600">
                  Loading settings...
                </div>
              )}

              {err && (
                <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                  {err}
                </div>
              )}

              {savedMsg && (
                <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                  {savedMsg}
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary bg-lime-600 hover:bg-lime-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save settings"}
                </button>

                {form.username && (
                  <Link
                    to={`/blog/${form.username}`}
                    className="btn-secondary border-lime-200 text-lime-800 hover:bg-lime-50"
                  >
                    View public profile
                  </Link>
                )}

                <Link to="/dashboard" className="btn-ghost">
                  Back to dashboard
                </Link>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="card border-lime-100 p-6">
                <h2 className="text-lg font-semibold text-slate-950">
                  Branding notes
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  You can now use either a custom uploaded profile photo or one of
                  the preset avatars, while still keeping your blog branding and
                  theme accent.
                </p>
              </div>

              <div className="card border-lime-100 p-6">
                <h2 className="text-lg font-semibold text-slate-950">
                  Mobile-friendly
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  The layout stacks naturally on smaller screens, with large tap
                  targets and simplified sections for easier editing on phones.
                </p>
              </div>
            </aside>
          </form>
        </div>
      </main>
    </div>
  );
}