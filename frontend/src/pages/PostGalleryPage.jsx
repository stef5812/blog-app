// frontend/src/pages/PostGalleryPage.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";

function getMediaType(item) {
  return (
    item.mediaType ||
    (/\.(mp4|webm|mov|ogg)$/i.test(item.url || "") ? "video" : "image")
  );
}

export default function PostGalleryPage() {
  const { username, slug } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [post, setPost] = useState(null);
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const videoRef = useRef(null);

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
          setActiveIndex(0);
        }
      } catch (error) {
        if (!ignore) setErr(error.message || "Failed to load gallery.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadGallery();

    return () => {
      ignore = true;
    };
  }, [username, slug]);

  const activeItem = items[activeIndex];
  const activeMediaType = activeItem ? getMediaType(activeItem) : null;

  const nextItem = () => {
    setActiveIndex((current) => (current + 1) % items.length);
  };

  const previousItem = () => {
    setActiveIndex((current) =>
      current === 0 ? items.length - 1 : current - 1
    );
  };

  useEffect(() => {
    if (!playing || items.length <= 1) return;

    if (activeMediaType === "video") {
      const video = videoRef.current;
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
      }
      return;
    }

    const timer = setTimeout(nextItem, 4000);
    return () => clearTimeout(timer);
  }, [playing, activeIndex, activeMediaType, items.length]);

  return (
    <main className="page-section">
      <div className="page-wrap max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <Link to={`/blog/${username}/post/${slug}`} className="btn-secondary">
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
                <p className="text-slate-600">No gallery items found.</p>
              </div>
            ) : (
              <>
                <section className="card mb-8 overflow-hidden">
                  <div className="relative bg-black">
                    {activeMediaType === "video" ? (
                      <video
                        key={activeItem.url}
                        ref={videoRef}
                        src={activeItem.url}
                        controls
                        playsInline
                        poster={activeItem.thumbnailUrl || undefined}
                        preload="metadata"
                        onEnded={() => {
                          if (playing) nextItem();
                        }}
                        className="max-h-[70vh] w-full object-contain"
                      />
                    ) : (
                      <img
                        src={activeItem.url}
                        alt={activeItem.caption || "Gallery image"}
                        className="max-h-[70vh] w-full object-contain"
                      />
                    )}

                    {items.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={previousItem}
                          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-4 py-3 text-xl shadow"
                        >
                          ‹
                        </button>

                        <button
                          type="button"
                          onClick={nextItem}
                          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-4 py-3 text-xl shadow"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {activeItem.caption && (
                        <p className="text-sm text-slate-700">
                          {activeItem.caption}
                        </p>
                      )}
                      <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                        {activeItem.source} · {activeIndex + 1} of {items.length}
                      </p>
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setPlaying((value) => !value)}
                        className="btn-secondary"
                      >
                        {playing ? "Pause slideshow" : "Play slideshow"}
                      </button>
                    )}
                  </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
                  {items.map((item, index) => {
                    const mediaType = getMediaType(item);
                    const isActive = index === activeIndex;

                    return (
                      <button
                        type="button"
                        key={item.id || item.url}
                        onClick={() => setActiveIndex(index)}
                        className={`overflow-hidden rounded-2xl border bg-white text-left shadow-sm ${
                          isActive
                            ? "border-slate-900 ring-2 ring-slate-900"
                            : "border-slate-200"
                        }`}
                      >
                        {mediaType === "video" ? (
                          <video
                            src={item.url}
                            poster={item.thumbnailUrl || undefined}
                            muted
                            preload="metadata"
                            className="h-32 w-full bg-black object-cover"
                          />
                        ) : (
                          <img
                            src={item.url}
                            alt={item.caption || "Gallery image"}
                            className="h-32 w-full object-cover"
                            loading="lazy"
                          />
                        )}

                        <div className="p-3">
                          <p className="truncate text-xs text-slate-500">
                            {mediaType === "video" ? "Video" : "Photo"}
                            {item.caption ? ` · ${item.caption}` : ""}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}