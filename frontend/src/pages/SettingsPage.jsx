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
    themeAccent: "#c96b3b",
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
              themeAccent: profile.themeAccent || "#c96b3b",
            });
          } else {
            setForm((prev) => ({
              ...prev,
              themeAccent: "#c96b3b",
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
        themeAccent: savedProfile.themeAccent || "#c96b3b",
      });

      setSavedMsg("Your blog settings have been saved.");
    } catch (error) {
      setErr(error.message || "Could not save your settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell bg-[linear-gradient(180deg,#fff7ed_0%,#fafaf9_42%,#ffffff_100%)]">
      <SiteHeader me={me} />

      <main className="py-3 sm:py-4">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
                    Settings
                  </p>

                  <h1 className="text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
                    Build your public blog identity
                  </h1>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-stone-600">
                    Choose how your blog looks to readers and shape its
                    travel-inspired personality.
                  </p>
                </div>

                <img
                  src={logoImg}
                  alt="Stefandodds.ie Full Stack AI"
                  className="h-auto w-full max-w-[180px]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                Preview identity
              </p>

              <div className="mt-3 flex items-center gap-3">
                <div className="h-16 w-16 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt="Profile avatar preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-stone-400">
                      No photo
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-base font-semibold text-stone-950">
                    {form.siteTitle || form.displayName || "Your blog title"}
                  </p>
                  <p className="mt-0.5 text-sm text-stone-600">
                    {form.username ? `@${form.username}` : "@your-username"}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm leading-6 text-stone-600">
                Upload your own image or choose one of the preset avatars below.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="grid gap-4 xl:grid-cols-[1fr_320px]"
          >
            <section className="rounded-2xl border border-orange-100 bg-white/95 p-4 shadow-sm sm:p-5">


              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="field-label">Username</span>
                  <input
                    name="username"
                    value={form.username}
                    onChange={updateField}
                    className="field-input focus:border-orange-500 focus:ring-orange-100"
                    placeholder="stefan"
                  />
                </label>

                <label>
                  <span className="field-label">Display name</span>
                  <input
                    name="displayName"
                    value={form.displayName}
                    onChange={updateField}
                    className="field-input focus:border-orange-500 focus:ring-orange-100"
                    placeholder="Stefan Dodds"
                  />
                </label>
              </div>

             

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="field-label">Site title</span>
                  <input
                    name="siteTitle"
                    value={form.siteTitle}
                    onChange={updateField}
                    className="field-input focus:border-orange-500 focus:ring-orange-100"
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
                    className="h-11 w-full rounded-xl border border-orange-200 bg-white px-2"
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className="field-label">Site description</span>
                <input
                  name="siteDescription"
                  value={form.siteDescription}
                  onChange={updateField}
                  className="field-input focus:border-orange-500 focus:ring-orange-100"
                  placeholder="Stories, travel notes, places, people, and ideas."
                />
              </label>

              <label className="mt-4 block">
                <span className="field-label">Bio</span>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={updateField}
                  rows={5}
                  className="field-textarea focus:border-orange-500 focus:ring-orange-100"
                  placeholder="Tell readers about your background, travels, and writing."
                />
              </label>
              <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4 sm:p-5">
                <h2 className="text-lg font-semibold text-stone-950">
                  Profile photo
                </h2>

                <p className="mt-1 text-sm text-stone-600">
                  Upload your own photo or choose a preset avatar.
                </p>

                <div className="mt-4 flex flex-col gap-4 lg:flex-row">
                  <div className="lg:w-56">
                    <div className="mx-auto h-28 w-28 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                      {form.avatarUrl ? (
                        <img
                          src={form.avatarUrl}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm text-stone-400">
                          No photo
                        </div>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap justify-center gap-2">
                      <button
                        type="button"
                        onClick={handleBrowseAvatar}
                        className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-900 transition hover:bg-orange-50"
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
                          className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-950"
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
                    <p className="text-sm font-semibold text-stone-700">
                      Choose a preset avatar
                    </p>

                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {PRESET_AVATARS.map((url) => {
                        const active = form.avatarUrl === url;

                        return (
                          <button
                            key={url}
                            type="button"
                            onClick={() => handleChoosePresetAvatar(url)}
                            className={`overflow-hidden rounded-xl border bg-white transition ${
                              active
                                ? "border-orange-500 ring-2 ring-orange-200"
                                : "border-stone-200 hover:border-orange-200"
                            }`}
                            aria-label="Choose avatar"
                          >
                            <img
                              src={url}
                              alt="Preset avatar"
                              className="h-16 w-full object-cover sm:h-20"
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>               

              {loading && (
                <div className="mt-4 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-600">
                  Loading settings...
                </div>
              )}

              {err && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {err}
                </div>
              )}

              {savedMsg && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {savedMsg}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl bg-[#c96b3b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#b55a2d] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save settings"}
                </button>

                {form.username && (
                  <Link
                    to={`/blog/${form.username}`}
                    className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-white px-4 py-2 text-sm font-semibold text-orange-900 transition hover:bg-orange-50"
                  >
                    View public profile
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-stone-950"
                >
                  Back to dashboard
                </Link>
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-950">
                  Branding notes
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  You can use either a custom uploaded profile photo or one of
                  the preset avatars, while still keeping your blog branding and
                  theme accent.
                </p>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-white/90 p-4 shadow-sm">
                <h2 className="text-lg font-semibold text-stone-950">
                  Mobile-friendly
                </h2>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  The layout stacks naturally on smaller screens, with clear tap
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