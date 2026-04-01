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

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const [auth, publicBlogs] = await Promise.all([
          authMe().catch(() => null),
          apiFetch("/public/blogs").catch(() => []),
        ]);

        if (!ignore) {
          setMe(auth || null);
          setBlogs(Array.isArray(publicBlogs) ? publicBlogs : []);
          setErr("");
        }
      } catch (error) {
        if (!ignore) {
          setErr(error.message || "Could not load blogs.");
          setBlogs([]);
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

  return (
    <div className="app-shell bg-[linear-gradient(180deg,#f7fff7_0%,#f8fafc_28%,#ffffff_100%)]">
      <SiteHeader me={me} />

      <main className="page-section">
        <div className="page-wrap">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-lime-700">Directory</p>
              <h1 className="section-title">Browse public blogs</h1>
              <p className="mt-2 text-slate-600">
                Explore writers, themes, and published travel stories.
              </p>
            </div>

            {!loading && !err && (
              <span className="rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-800">
                {blogs.length} blog{blogs.length === 1 ? "" : "s"}
              </span>
            )}
          </div>

          {loading && (
            <div className="card border-lime-100 p-6">
              <p className="text-slate-600">Loading blogs...</p>
            </div>
          )}

          {!loading && err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          )}

          {!loading && !err && blogs.length === 0 && (
            <div className="card border-lime-100 p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-slate-950">No public blogs yet</h2>
              <p className="mt-3 text-slate-600">
                No one has published a blog profile yet. You could be the first.
              </p>
              <div className="mt-6">
                <Link
                  to="/dashboard/settings"
                  className="btn-primary bg-lime-600 hover:bg-lime-700"
                >
                  Create your blog
                </Link>
              </div>
            </div>
          )}

          {!loading && !err && blogs.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="card border-lime-100 p-6 transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
                        {blog.siteTitle || blog.displayName || blog.username}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">@{blog.username}</p>
                    </div>

                    <span
                      className="h-4 w-4 rounded-full border border-slate-200"
                      style={{ backgroundColor: blog.themeAccent || "#65a30d" }}
                    />
                  </div>

                  <p className="mt-4 text-sm leading-6 text-slate-600">
                    {blog.siteDescription || blog.bio || "No description yet."}
                  </p>

                  <div className="mt-5 text-sm text-slate-500">
                    {blog.postCount} published post{blog.postCount === 1 ? "" : "s"}
                  </div>

                  <div className="mt-6">
                    <Link
                      to={`/@${blog.username}`}
                      className="btn-primary bg-lime-600 hover:bg-lime-700"
                    >
                      Open blog
                    </Link>
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