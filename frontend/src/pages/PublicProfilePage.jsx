// frontend/src/pages/PublicProfilePage.jsx

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch, authMe } from "../lib/api";
import SiteHeader from "../components/SiteHeader";

export default function PublicProfilePage() {
  const { username } = useParams();

  const cleanUsername = useMemo(
    () => (username || "").replace(/^@/, "").trim(),
    [username]
  );

  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const isOwner =
    !!me?.user &&
    !!profile &&
    (
      (profile.userId && me.user.id === profile.userId) ||
      (profile.username &&
        String(profile.username).toLowerCase() ===
          String(cleanUsername).toLowerCase())
    );

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const [auth, profileData, postsData] = await Promise.all([
          authMe().catch(() => null),
          apiFetch(`/public/blogs/${cleanUsername}`),
          apiFetch(`/public/blogs/${cleanUsername}/posts`).catch(() => []),
        ]);

        if (ignore) return;

        setMe(auth || null);
        setProfile(profileData || null);
        setPosts(Array.isArray(postsData) ? postsData : []);
      } catch (error) {
        if (ignore) return;

        setErr(error.message || "Could not load blog.");
        setProfile(null);
        setPosts([]);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    if (cleanUsername) {
      load();
    } else {
      setLoading(false);
      setErr("No username provided.");
    }

    return () => {
      ignore = true;
    };
  }, [cleanUsername]);

  return (
    <div className="app-shell bg-[linear-gradient(180deg,#f8f1ea_0%,#f5efe8_42%,#ffffff_100%)]">
      <SiteHeader me={me} />

      <main className="page-section">
        <div className="page-wrap">
          {loading && (
            <div className="card border-amber-100 p-6">
              <p className="text-stone-600">Loading blog...</p>
            </div>
          )}

          {!loading && err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          )}

          {!loading && !err && !profile && (
            <div className="card border-amber-100 p-6 sm:p-8">
              <h1 className="text-2xl font-semibold text-stone-950">
                Blog not found
              </h1>

              <p className="mt-3 text-stone-600">
                We could not find a public blog for @{cleanUsername}.
              </p>
            </div>
          )}

          {!loading && !err && profile && (
            <>
              <section className="relative overflow-hidden rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-sm sm:p-8">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-amber-200/30 blur-3xl" />

                <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-orange-200/30 blur-3xl" />

                <div className="relative z-10">
                  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-medium uppercase tracking-[0.2em] text-amber-700">
                        @{profile.username}
                      </p>

                      <h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-950 sm:text-5xl">
                        {profile.siteTitle ||
                          profile.displayName ||
                          profile.username}
                      </h1>

                      {profile.siteDescription && (
                        <p className="mt-4 max-w-2xl text-lg leading-8 text-stone-600">
                          {profile.siteDescription}
                        </p>
                      )}

                      {profile.bio && (
                        <p className="mt-4 max-w-3xl leading-7 text-stone-600">
                          {profile.bio}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-3">
                      <Link
                        to={`/blog/${profile.username}/journey`}
                        className="rounded-xl bg-amber-700 px-5 py-3 text-center font-medium text-white shadow transition hover:bg-amber-800"
                      >
                        🗺 Open Journey Map
                      </Link>

                      <Link
                        to={`/blog/${profile.username}`}
                        className="rounded-xl border border-amber-200 bg-white px-5 py-3 text-center font-medium text-amber-800 transition hover:bg-amber-50"
                      >
                        ✈ Travel Timeline
                      </Link>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm">
                      🌍 Travel Blog
                    </div>

                    <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm">
                      📝 {posts.length} post{posts.length === 1 ? "" : "s"}
                    </div>

                    <div className="rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm">
                      🚆 Journey Routes
                    </div>
                  </div>

                  {isOwner && (
                    <div className="mt-8 flex flex-wrap gap-3">
                      <Link
                        to="/dashboard"
                        className="btn-secondary border-amber-200 text-amber-800 hover:bg-amber-50"
                      >
                        Dashboard
                      </Link>

                      <Link
                        to="/dashboard/settings"
                        className="rounded-xl border border-amber-200 bg-white px-4 py-2 font-medium text-amber-800 transition hover:bg-amber-50"
                      >
                        Edit settings
                      </Link>

                      <Link
                        to="/dashboard/waypoints"
                        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 font-medium text-amber-800 transition hover:bg-amber-100"
                      >
                        Manage Journey Map
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              <section className="mt-6 rounded-3xl border border-amber-100 bg-white p-5 shadow-sm sm:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-xl font-semibold text-stone-950">
                    Published posts
                  </h2>

                  <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                    {posts.length} post{posts.length === 1 ? "" : "s"}
                  </span>
                </div>

                {posts.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-amber-200 p-6 text-stone-600">
                    No published posts yet.
                  </div>
                ) : (
                  <div className="mt-6 space-y-4">
                    {posts.map((post) => (
                      <article
                        key={post.id}
                        className="rounded-2xl border border-stone-200 bg-white p-4 transition hover:border-amber-200 hover:shadow-sm sm:p-5"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row">
                          {post.coverImageUrl ? (
                            <Link
                              to={`/blog/${profile.username}/post/${post.slug}`}
                              className="shrink-0 self-center sm:self-start"
                            >
                              {post.coverMediaType === "video" ? (
                                <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-stone-200 sm:h-28 sm:w-28">
                                  {post.coverThumbnailUrl ? (
                                    <img
                                      src={post.coverThumbnailUrl}
                                      alt={post.title || "Video thumbnail"}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <video
                                      src={post.coverImageUrl}
                                      className="h-full w-full object-cover"
                                      muted
                                      playsInline
                                      autoPlay
                                      loop
                                      preload="metadata"
                                    />
                                  )}

                                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-black">
                                      ▶
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <img
                                  src={post.coverImageUrl}
                                  alt={post.title || "Post cover"}
                                  className="h-24 w-24 rounded-xl border border-stone-200 object-cover sm:h-28 sm:w-28"
                                />
                              )}
                            </Link>
                          ) : null}

                          <div className="min-w-0 flex-1">
                            <h3 className="break-words text-lg font-semibold text-stone-950">
                              {post.title}
                            </h3>

                            {post.excerpt && (
                              <p className="mt-2 text-sm leading-relaxed text-stone-600 sm:text-base">
                                {post.excerpt}
                              </p>
                            )}

                            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-sm text-stone-500">
                                {post.publishedAt
                                  ? new Date(
                                      post.publishedAt
                                    ).toLocaleDateString()
                                  : ""}
                              </p>

                              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                                <Link
                                  to={`/blog/${profile.username}/post/${post.slug}`}
                                  className="btn-primary bg-amber-700 text-center hover:bg-amber-800"
                                >
                                  Read post
                                </Link>

                                <Link
                                  to={`/blog/${profile.username}/post/${post.slug}/gallery`}
                                  className="btn-secondary border-amber-200 text-center text-amber-800 hover:bg-amber-50"
                                >
                                  Gallery
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}