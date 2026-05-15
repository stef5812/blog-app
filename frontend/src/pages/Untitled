import { useEffect, useState } from "react";

const API_BASE = import.meta.env.DEV ? "/api" : "/blog-app/api";

export default function MediaLibraryPage() {
  const [media, setMedia] = useState([]);
  const [file, setFile] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function loadMedia() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API_BASE}/media`, {
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to load media.");
      }

      setMedia(data.media || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, []);

  async function handleUpload(e) {
    e.preventDefault();

    if (!file) return;

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/media/upload`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Upload failed.");
      }

      setFile(null);
      await loadMedia();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(filename) {
    const ok = window.confirm("Delete this media file?");
    if (!ok) return;

    try {
      setError("");

      const res = await fetch(
        `${API_BASE}/media/${encodeURIComponent(filename)}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Delete failed.");
      }

      setMedia((current) =>
        current.filter((item) => item.filename !== filename)
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function copyUrl(url) {
    await navigator.clipboard.writeText(url);
    alert("URL copied");
  }

  const filteredMedia =
    filter === "all"
      ? media
      : media.filter((item) => item.mediaType === filter);

  return (
    <main style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Media Library</h1>

      <form
        onSubmit={handleUpload}
        style={{
          margin: "1rem 0",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h2>Upload photo or video</h2>

        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <button
          type="submit"
          disabled={!file || uploading}
          style={{ marginLeft: "1rem" }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>

      {error && (
        <p style={{ color: "crimson", fontWeight: "bold" }}>
          {error}
        </p>
      )}

      <div style={{ margin: "1rem 0" }}>
        <button onClick={() => setFilter("all")}>All</button>{" "}
        <button onClick={() => setFilter("image")}>Images</button>{" "}
        <button onClick={() => setFilter("video")}>Videos</button>
      </div>

      {loading ? (
        <p>Loading media...</p>
      ) : filteredMedia.length === 0 ? (
        <p>No media found.</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "1rem",
          }}
        >
          {filteredMedia.map((item) => (
            <article
              key={item.filename}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "0.75rem",
                background: "#fff",
              }}
            >
              {item.mediaType === "video" ? (
                <video
                  src={item.url}
                  controls
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    background: "#000",
                  }}
                />
              ) : (
                <img
                  src={item.url}
                  alt={item.filename}
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                  }}
                />
              )}

              <p
                style={{
                  fontSize: "0.85rem",
                  wordBreak: "break-all",
                  marginTop: "0.5rem",
                }}
              >
                {item.filename}
              </p>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="button" onClick={() => copyUrl(item.url)}>
                  Copy URL
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.filename)}
                  style={{ color: "crimson" }}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}