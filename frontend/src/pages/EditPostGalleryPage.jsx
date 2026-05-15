// frontend/src/pages/EditPostGalleryPage.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch, apiUpload, authMe } from "../lib/api";
import SiteHeader from "../components/SiteHeader";

export default function EditPostGalleryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [post, setPost] = useState(null);
  const [items, setItems] = useState([]);
  const [files, setFiles] = useState([]);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const auth = await authMe();

        if (!auth?.user) {
          window.location.href = `/auth/login?from=blog-app&next=${encodeURIComponent(
            `${window.location.origin}${import.meta.env.BASE_URL}dashboard/posts/${id}/gallery`
          )}`;
          return;
        }

        if (!ignore) setMe(auth);

        const data = await apiFetch(`/me/posts/${id}/gallery`);

        if (!ignore) {
          setPost(data.post || null);
          setItems(data.items || data.media || []);
        }
      } catch (error) {
        if (!ignore) {
          setErr(error.message || "Could not load gallery.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [id]);

  async function handleUpload(e) {
    e.preventDefault();
  
    if (files.length === 0) {
      setErr("Please choose one or more images or videos.");
      return;
    }

    
  
    try {
      setUploading(true);
      setErr("");
      setSavedMsg("");
  
      const uploadedItems = [];

      setUploadProgress(`Uploading 0 of ${files.length}...`);
  
      for (let i = 0; i < files.length; i++) {
        const selectedFile = files[i];
      
        setUploadProgress(`Uploading ${i + 1} of ${files.length}: ${selectedFile.name}`);
      
        const uploaded = await apiUpload(
          `/me/posts/${id}/gallery/upload`,
          selectedFile,
          "file",
          { caption }
        );
      
        uploadedItems.push(uploaded.item || uploaded.media || uploaded);
      }
  
      setItems((current) => [...uploadedItems, ...current]);
      setFiles([]);
      setCaption("");
      setSavedMsg(`${uploadedItems.length} gallery item(s) added.`);
    } catch (error) {
      setErr(error.message || "Could not upload gallery items.");
    } finally {
        setUploading(false);
        setUploadProgress("");
      }
  }

  async function updateCaption(itemId, nextCaption) {
    try {
      setErr("");
      setSavedMsg("");

      await apiFetch(`/me/posts/${id}/gallery/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify({
          caption: nextCaption,
        }),
      });

      setItems((current) =>
        current.map((item) =>
          item.id === itemId ? { ...item, caption: nextCaption } : item
        )
      );

      setSavedMsg("Caption updated.");
    } catch (error) {
      setErr(error.message || "Could not update caption.");
    }
  }

  async function removeItem(itemId) {
    const ok = window.confirm("Remove this item from the gallery?");
    if (!ok) return;

    try {
      setErr("");
      setSavedMsg("");

      await apiFetch(`/me/posts/${id}/gallery/${itemId}`, {
        method: "DELETE",
      });

      setItems((current) => current.filter((item) => item.id !== itemId));
      setSavedMsg("Gallery item removed.");
    } catch (error) {
      setErr(error.message || "Could not remove gallery item.");
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <SiteHeader me={me} />
        <main className="page-section">
          <div className="page-wrap">
            <p>Loading gallery...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <SiteHeader me={me} />

      <main className="page-section">
        <div className="page-wrap">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-sky-700">Gallery</p>
              <h1 className="section-title">
                Edit Gallery
              </h1>
              <p className="mt-2 text-slate-600">
                {post?.title || "Manage photos and videos for this post."}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to={`/dashboard/posts/${id}`} className="btn-secondary">
                Back to post editor
              </Link>

              {post?.slug && post?.authorUsername && (
                <Link
                  to={`/blog/${post.authorUsername}/post/${post.slug}/gallery`}
                  className="btn-secondary"
                >
                  View public gallery
                </Link>
              )}
            </div>
          </div>

          {err && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {err}
            </div>
          )}

          {savedMsg && (
            <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              {savedMsg}
            </div>
          )}

          <section className="card p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Add photo or video
            </h2>

            <form onSubmit={handleUpload} className="mt-5 space-y-4">
            <label className="inline-flex cursor-pointer items-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Browse files

            <input
                type="file"
                multiple
                accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                className="hidden"
            />
            </label>
            
            {files.length > 0 && (
            <div className="text-sm text-slate-600">
                {files.length} file(s) selected
            </div>
            )}            

              <input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Optional caption"
                className="field-input"
              />

            <button
            type="submit"
            disabled={files.length === 0 || uploading}
            className="btn-primary disabled:opacity-60"
            >
            {uploading ? "Uploading..." : "Add to gallery"}
            </button>
            </form>
          </section>

          <section className="mt-8">
            {items.length === 0 ? (
              <div className="card p-6">
                <p className="text-slate-600">
                  No gallery items yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                  <GalleryItemCard
                    key={item.id || item.url}
                    item={item}
                    onSaveCaption={updateCaption}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function GalleryItemCard({ item, onSaveCaption, onRemove }) {
    const [caption, setCaption] = useState(item.caption || "");
  
    const mediaType =
      item.mediaType ||
      item.type ||
      (/\.(mp4|webm|mov|ogg)$/i.test(item.url || "")
        ? "video"
        : "image");
  
    return (
      <article className="card overflow-hidden">
        {mediaType === "video" ? (
          <video
            src={item.url}
            controls
            className="h-56 w-full bg-black object-cover"
            poster={item.thumbnailUrl || undefined}
            preload="metadata"
          />
        ) : (
          <img
            src={item.url}
            alt={caption || "Gallery item"}
            className="h-56 w-full object-cover"
          />
        )}
  
        <div className="space-y-4 p-5">
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption"
            className="field-input"
          />
  
          {!item.locked ? (
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSaveCaption(item.id, caption)}
                className="btn-secondary"
              >
                Save caption
              </button>
  
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="btn-ghost text-red-700"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
              This item comes from the post content or cover media.
              Remove it from the post editor instead.
            </div>
          )}
  
          {item.source && (
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Source: {item.source}
            </div>
          )}
        </div>
      </article>
    );
  }