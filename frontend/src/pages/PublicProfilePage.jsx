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
    <div className="app-shell bg-[linear-gradient(180deg,#f7fff7_0%,#f8fafc_28%,#ffffff_100%)]">
      <SiteHeader me={me} />

      <main className="page-section">
        <div className="page-wrap">
          {loading && (
            <div className="card border-lime-100 p-6">
              <p className="text-slate-600">Loading blog...</p>
            </div>
          )}

          {!loading && err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          )}

          {!loading && !err && !profile && (
            <div className="card border-lime-100 p-6 sm:p-8">
              <h1 className="text-2xl font-semibold text-slate-950">
                Blog not found
              </h1>
              <p className="mt-3 text-slate-600">
                We could not find a public blog for @{cleanUsername}.
              </p>
            </div>
          )}

          {!loading && !err && profile && (
            <>
              <section className="card border-lime-100 p-6 sm:p-8">
                <p className="text-sm text-slate-500">@{profile.username}</p>

                <h1 className="section-title">
                  {profile.siteTitle || profile.displayName || profile.username}
                </h1>

                {profile.siteDescription && (
                  <p className="mt-3 text-slate-600">{profile.siteDescription}</p>
                )}

                {profile.bio && (
                  <p className="mt-4 text-slate-600">{profile.bio}</p>
                )}

                {isOwner && (
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/dashboard"
                      className="btn-secondary border-lime-200 text-lime-800 hover:bg-lime-50"
                    >
                      Dashboard
                    </Link>

                    <Link
                      to="/dashboard/settings"
                      className="btn-ghost"
                    >
                      Edit settings
                    </Link>
                  </div>
                )}
              </section>

              <section className="mt-6 card border-lime-100 p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-950">
                    Published posts
                  </h2>
                  <span className="rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-800">
                    {posts.length} post{posts.length === 1 ? "" : "s"}
                  </span>
                </div>

                {posts.length === 0 ? (
                  <div className="mt-6 rounded-2xl border border-dashed border-lime-200 p-6 text-slate-600">
                    No published posts yet.
                  </div>
                ) : (
<div className="mt-6 space-y-4">
  {posts.map((post) => (
    <article
      key={post.id}
      className="rounded-2xl border border-slate-200 bg-white p-5"
    >
      <div className="flex gap-4">
      {post.coverImageUrl ? (
  <Link
    to={`/blog/${profile.username}/post/${post.slug}`}
    className="shrink-0"
  >
    {post.coverMediaType === "video" ? (
      <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-200 sm:h-28 sm:w-28">
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
        className="h-24 w-24 rounded-xl border border-slate-200 object-cover sm:h-28 sm:w-28"
      />
    )}
  </Link>
) : null}

        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-slate-950">
            {post.title}
          </h3>

          {post.excerpt && (
            <p className="mt-2 text-slate-600">{post.excerpt}</p>
          )}

          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString()
                : ""}
            </p>

            <div className="flex gap-2">
  <Link
    to={`/blog/${profile.username}/post/${post.slug}`}
      className="btn-primary bg-lime-600 hover:bg-lime-700"
    >
      Read post
    </Link>

    <Link
      to={`/blog/${profile.username}/post/${post.slug}/gallery`}
      className="btn-secondary border-lime-200 text-lime-800 hover:bg-lime-50"
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