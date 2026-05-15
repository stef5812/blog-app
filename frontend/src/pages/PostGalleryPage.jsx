// frontend/src/pages/PostGalleryPage.jsx

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function PostGalleryPage() {
  const { username, slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [post, setPost] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let ignore = false;

    async function loadGallery() {
      try {
        setLoading(true);
        setErr("");

        const data = await apiFetch(
          `/public/blogs/${username}/posts/${slug}/gallery`
        );

        if (!ignore) {
          setPost(data.post || null);
          setItems(data.items || []);
        }
      } catch (error) {
        if (!ignore) {
          setErr(error.message || "Failed to load gallery.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadGallery();

    return () => {
      ignore = true;
    };
  }, [username, slug]);

  return (
    <main className="page-section">
      <div className="page-wrap max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to={`/blog/${username}/post/${slug}`}
            className="btn-secondary"
          >
            ← Back to Post
          </Link>
        </div>

        {loading && (
          <div className="card p-8">
            <p>Loading gallery...</p>
          </div>
        )}

        {err && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            {err}
          </div>
        )}

        {!loading && !err && (
          <>
            <div className="mb-10">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
                {post?.title || "Gallery"}
              </h1>

              <p className="mt-3 text-slate-600">
                Photos and videos from this post.
              </p>
            </div>

            {items.length === 0 ? (
              <div className="card p-8">
                <p className="text-slate-600">
                  No gallery items found.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                  const mediaType =
                    item.mediaType ||
                    (/\.(mp4|webm|mov|ogg)$/i.test(item.url || "")
                      ? "video"
                      : "image");

                  return (
                    <article
                      key={item.id || item.url}
                      className="card overflow-hidden"
                    >
                      {mediaType === "video" ? (
                        <video
                          src={item.url}
                          controls
                          className="h-72 w-full bg-black object-cover"
                          poster={item.thumbnailUrl || undefined}
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={item.caption || "Gallery image"}
                          className="h-72 w-full object-cover"
                          loading="lazy"
                        />
                      )}

                      {(item.caption || item.source) && (
                        <div className="space-y-2 p-5">
                          {item.caption && (
                            <p className="text-sm text-slate-700">
                              {item.caption}
                            </p>
                          )}

                          <div className="text-xs uppercase tracking-wide text-slate-400">
                            {item.source}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}