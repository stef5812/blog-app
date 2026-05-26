// frontend/src/pages/DirectoryPage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, authMe } from "../lib/api";
import SiteHeader from "../components/SiteHeader";

export default function DirectoryPage() {
  const [me, setMe] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [auth, publicBlogs] = await Promise.all([
          authMe().catch(() => null),
          apiFetch("/public/blogs").catch(() => []),
        ]);

        if (!ignore) {
          const blogList = Array.isArray(publicBlogs) ? publicBlogs : [];

          const blogsWithPosts = blogList.filter(
            (blog) => Number(blog.postCount || 0) > 0
          );

          setMe(auth || null);

          const blogsWithSubscriptionStatus = auth
            ? await Promise.all(
                blogsWithPosts.map(async (blog) => {
                  try {
                    const status = await apiFetch(
                      `/public/blogs/${blog.username}/subscription`
                    );

                    return {
                      ...blog,
                      subscribed: !!status.subscribed,
                    };
                  } catch {
                    return {
                      ...blog,
                      subscribed: false,
                    };
                  }
                })
              )
            : blogsWithPosts.map((blog) => ({
                ...blog,
                subscribed: false,
              }));

          setBlogs(blogsWithSubscriptionStatus);
          setErr("");
        }
      } catch (error) {
        if (!ignore) {
          setErr(error.message || "Could not load blogs.");
          setBlogs([]);
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

  async function handleSubscribeClick(blog) {
    if (!me) {
      setLoginMessage(
        "You need to log in or register to receive blog notifications."
      );

      setTimeout(() => {
        const next = encodeURIComponent(window.location.href);

        const AUTH_UI_BASE = import.meta.env.DEV
          ? "http://localhost:5173"
          : "https://auth.stefandodds.ie";

        window.location.href = `${AUTH_UI_BASE}/login?from=blog-app&next=${next}`;
      }, 1200);

      return;
    }

    try {
      await apiFetch(`/public/blogs/${blog.username}/subscribe`, {
        method: "POST",
      });

      setBlogs((prev) =>
        prev.map((b) => (b.id === blog.id ? { ...b, subscribed: true } : b))
      );
    } catch (error) {
      alert(error.message || "Subscription failed");
    }
  }

  return (
    <div className="app-shell bg-[linear-gradient(180deg,#fef3c7_0%,#fef7ed_42%,#ffffff_100%)]">
      <SiteHeader me={me} />

      <main className="py-6 sm:py-8">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <section className="mb-4 rounded-3xl border border-amber-200 bg-white/85 p-5 shadow-sm backdrop-blur sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-800">
                  Blog directory
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                  Browse public blogs
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                  Explore writers, themes, travel notes, and published stories.
                </p>

                {loginMessage && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {loginMessage}
                  </div>
                )}
              </div>

              {!loading && !err && (
                <span className="w-fit rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
                  {blogs.length} blog{blogs.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
          </section>

          {loading && (
            <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
              <p className="text-stone-600">Loading blogs...</p>
            </div>
          )}

          {!loading && err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          )}

          {!loading && !err && blogs.length === 0 && (
            <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-stone-950">
                No public blogs yet
              </h2>

              <p className="mt-2 text-stone-600">
                No blogs with published posts are available yet. You could be the
                first.
              </p>

              <div className="mt-5">
                <Link
                  to="/dashboard/settings"
                  className="inline-flex items-center justify-center rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800"
                >
                  Create your blog
                </Link>
              </div>
            </div>
          )}

          {!loading && !err && blogs.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="group rounded-2xl border border-amber-100 bg-white/95 p-5 shadow-sm transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-2xl border border-amber-100 bg-amber-50">
                        {blog.avatarUrl ? (
                          <img
                            src={blog.avatarUrl}
                            alt={blog.displayName || blog.username}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-amber-300">
                            —
                          </div>
                        )}
                      </div>

                      <div>
                        <h2 className="text-base font-semibold leading-6 text-stone-950">
                          {blog.siteTitle || blog.displayName || blog.username}
                        </h2>

                        <p className="mt-0.5 text-sm text-stone-500">
                          @{blog.username}
                        </p>
                      </div>
                    </div>

                    <span
                      className="h-4 w-4 rounded-full border border-stone-200 shadow-sm"
                      style={{ backgroundColor: blog.themeAccent || "#92400e" }}
                    />
                  </div>

                  <p className="mt-4 min-h-[3rem] text-sm leading-6 text-stone-600">
                    {blog.siteDescription || blog.bio || "No description yet."}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-amber-100 pt-4">
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600">
                      {blog.postCount} published post
                      {blog.postCount === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="mt-3 space-y-2">
                    <Link
                      to={`/blog/${blog.username}`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-800"
                    >
                      Open blog
                    </Link>

                    <label className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50/60 p-3 text-sm leading-5 text-stone-700">
                      <input
                        type="checkbox"
                        checked={blog.subscribed || false}
                        onChange={() => handleSubscribeClick(blog)}
                        className="mt-0.5 rounded border-amber-300 text-amber-700 focus:ring-amber-200"
                      />
                      <span>Email me when this blog publishes new posts</span>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}