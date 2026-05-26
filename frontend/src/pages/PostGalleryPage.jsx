// frontend/src/pages/PostGalleryPage.jsx

import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../lib/api";
import SiteHeader from "../components/SiteHeader";

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
        
          const sortedItems = [...(data.items || [])].sort((a, b) => {
            const dateA = new Date(
              a.takenAt || a.createdAt || a.uploadedAt || 0
            ).getTime();
        
            const dateB = new Date(
              b.takenAt || b.createdAt || b.uploadedAt || 0
            ).getTime();
        
            return dateA - dateB;
          });
        
          setItems(sortedItems);
        
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

  function goNext() {
    setActiveIndex((current) => (current + 1) % items.length);
  }

  function goPrevious() {
    setActiveIndex((current) =>
      current === 0 ? items.length - 1 : current - 1
    );
  }

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

    const timer = setTimeout(goNext, 4500);
    return () => clearTimeout(timer);
  }, [playing, activeIndex, activeMediaType, items.length]);

  return (
    <div className="app-shell bg-gradient-to-br from-slate-50 via-white to-lime-50">
      <SiteHeader />

      <main className="page-section">
        <div className="page-wrap max-w-7xl">
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
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                    {post?.title || "Gallery"}
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Photos and videos from this post.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/blog/${username}/post/${slug}`}
                    className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    ← Back
                  </Link>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPlaying((value) => !value)}
                      className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      {playing ? "Pause" : "Play"}
                    </button>
                  )}
                </div>
              </div>

              {items.length === 0 ? (
                <div className="card p-8">
                  <p className="text-slate-600">No gallery items found.</p>
                </div>
              ) : (
                <>
                  <section className="relative mb-4 overflow-hidden rounded-2xl border border-white/70 bg-slate-950 p-2 shadow-xl md:p-4">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(132,204,22,0.25),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_35%)]" />

                    <div className="relative grid items-center gap-4 md:grid-cols-[120px_1fr_120px]">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={goPrevious}
                          className="hidden overflow-hidden rounded-2xl border border-white/20 opacity-60 transition hover:scale-105 hover:opacity-100 md:block"
                        >
                          <PreviewItem
                            item={
                              items[
                                activeIndex === 0
                                  ? items.length - 1
                                  : activeIndex - 1
                              ]
                            }
                          />
                        </button>
                      )}

                      <div className="relative overflow-hidden rounded-[1.5rem] bg-black shadow-2xl">
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
                              if (playing) goNext();
                            }}
                            className="h-[62vh] w-full object-contain"
                          />
                        ) : (
                          <img
                            key={activeItem.url}
                            src={activeItem.url}
                            alt={activeItem.caption || "Gallery image"}
                            className="h-[62vh] w-full object-contain"
                          />
                        )}

                        {items.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={goPrevious}
                              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-2xl shadow-lg transition hover:bg-white"
                            >
                              ‹
                            </button>

                            <button
                              type="button"
                              onClick={goNext}
                              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-4 py-3 text-2xl shadow-lg transition hover:bg-white"
                            >
                              ›
                            </button>
                          </>
                        )}
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={goNext}
                          className="hidden overflow-hidden rounded-2xl border border-white/20 opacity-60 transition hover:scale-105 hover:opacity-100 md:block"
                        >
                          <PreviewItem
                            item={items[(activeIndex + 1) % items.length]}
                          />
                        </button>
                      )}
                    </div>

                    <div className="relative mt-5 flex flex-col gap-4 text-white md:flex-row md:items-end md:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-lime-200">
                          {activeMediaType === "video" ? "Video" : "Photo"} ·{" "}
                          {activeIndex + 1} of {items.length}
                        </p>

                        {activeItem.caption && (
                          <p className="mt-2 max-w-3xl text-lg text-white/90">
                            {activeItem.caption}
                          </p>
                        )}

                        {activeItem.source && (
                          <p className="mt-1 text-xs uppercase tracking-wide text-white/45">
                            {activeItem.source}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {items.map((item, index) => (
                          <button
                            key={item.id || item.url}
                            type="button"
                            onClick={() => setActiveIndex(index)}
                            className={`h-2.5 rounded-full transition-all ${
                              index === activeIndex
                                ? "w-10 bg-lime-300"
                                : "w-2.5 bg-white/35 hover:bg-white/70"
                            }`}
                            aria-label={`Go to gallery item ${index + 1}`}
                          />
                        ))}
                      </div>
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
                          className={`group overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                            isActive
                              ? "border-slate-950 ring-2 ring-slate-950"
                              : "border-slate-200"
                          }`}
                        >
                          <div className="relative">
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

                            {mediaType === "video" && (
                              <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                                ▶ Video
                              </span>
                            )}
                          </div>

                          <div className="p-3">
                            <p className="truncate text-xs text-slate-500">
                              {item.caption || `${mediaType} ${index + 1}`}
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
    </div>
  );
}

function PreviewItem({ item }) {
  const mediaType = getMediaType(item);

  if (mediaType === "video") {
    return (
      <video
        src={item.url}
        poster={item.thumbnailUrl || undefined}
        muted
        preload="metadata"
        className="h-40 w-full bg-black object-cover"
      />
    );
  }

  return (
    <img
      src={item.url}
      alt={item.caption || "Gallery preview"}
      className="h-40 w-full object-cover"
      loading="lazy"
    />
  );
}