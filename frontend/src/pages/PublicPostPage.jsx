// frontend/src/pages/PublicPostPage.jsx

import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch, authMe } from "../lib/api";
import SiteHeader from "../components/SiteHeader";

function renderMarks(text, marks = []) {
  return marks.reduce((acc, mark, index) => {
    if (mark.type === "bold") return <strong key={index}>{acc}</strong>;
    if (mark.type === "italic") return <em key={index}>{acc}</em>;
    if (mark.type === "underline") return <u key={index}>{acc}</u>;
    if (mark.type === "strike") return <s key={index}>{acc}</s>;

    if (mark.type === "code") {
      return (
        <code
          key={index}
          className="rounded-lg bg-slate-100 px-1.5 py-0.5 text-[0.95em] text-sky-800"
        >
          {acc}
        </code>
      );
    }

    if (mark.type === "link") {
      return (
        <a
          key={index}
          href={mark.attrs?.href}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-sky-700 underline underline-offset-4"
        >
          {acc}
        </a>
      );
    }

    if (mark.type === "textStyle") {
      return (
        <span
          key={index}
          style={{
            color: mark.attrs?.color || undefined,
            fontFamily: mark.attrs?.fontFamily || undefined,
          }}
        >
          {acc}
        </span>
      );
    }

    if (mark.type === "highlight") {
      return (
        <mark
          key={index}
          className="rounded px-1"
          style={{ backgroundColor: mark.attrs?.color || "#fef08a" }}
        >
          {acc}
        </mark>
      );
    }

    return acc;
  }, text);
}

function renderNode(node, key) {
  if (!node) return null;

  switch (node.type) {
    case "doc":
      return (
        <div key={key} className="space-y-6 sm:space-y-8">
          {node.content?.map((child, index) => renderNode(child, index))}
        </div>
      );

    case "paragraph":
      return (
        <p
          key={key}
          className="text-base leading-8 text-slate-700 sm:text-lg"
          style={{ textAlign: node.attrs?.textAlign || undefined }}
        >
          {node.content?.map((child, index) => renderNode(child, index))}
        </p>
      );

    case "text":
      return <span key={key}>{renderMarks(node.text || "", node.marks)}</span>;

    case "heading": {
      const level = node.attrs?.level || 2;
      const classMap = {
        1: "text-4xl font-semibold tracking-tight text-slate-950",
        2: "text-3xl font-semibold tracking-tight text-slate-950",
        3: "text-2xl font-semibold tracking-tight text-slate-950",
        4: "text-xl font-semibold tracking-tight text-slate-950",
      };
      const Tag = `h${level}`;
      return (
        <Tag
          key={key}
          className={classMap[level] || classMap[2]}
          style={{ textAlign: node.attrs?.textAlign || undefined }}
        >
          {node.content?.map((child, index) => renderNode(child, index))}
        </Tag>
      );
    }

    case "bulletList":
      return (
        <ul key={key} className="list-disc space-y-2 pl-6 text-slate-700">
          {node.content?.map((child, index) => renderNode(child, index))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="list-decimal space-y-2 pl-6 text-slate-700">
          {node.content?.map((child, index) => renderNode(child, index))}
        </ol>
      );

    case "listItem":
      return (
        <li key={key} className="leading-8">
          {node.content?.map((child, index) => renderNode(child, index))}
        </li>
      );

    case "blockquote":
      return (
        <blockquote
          key={key}
          className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-5 text-lg italic leading-8 text-slate-700"
          style={{ textAlign: node.attrs?.textAlign || undefined }}
        >
          {node.content?.map((child, index) => renderNode(child, index))}
        </blockquote>
      );

    case "horizontalRule":
      return <hr key={key} className="border-slate-200" />;

    case "image":
      if (!node.attrs?.src) return null;

      return (
        <figure key={key} className="my-8">
          <img
            src={node.attrs.src}
            alt={node.attrs.alt || ""}
            className="w-full rounded-2xl border border-slate-200"
          />
          {node.attrs.title && (
            <figcaption className="mt-2 text-sm text-slate-500">
              {node.attrs.title}
            </figcaption>
          )}
        </figure>
      );

    default:
      return null;
  }
}

export default function PublicPostPage() {
  const { username, slug } = useParams();
  const cleanUsername = (username || "").trim();

  const [me, setMe] = useState(null);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    authMe()
      .then((auth) => {
        if (!ignore) setMe(auth);
      })
      .catch(() => {
        if (!ignore) setMe(null);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const result = await apiFetch(
          `/public/blogs/${cleanUsername}/posts/${slug}`
        );

        if (!ignore) setData(result);
      } catch {
        if (!ignore) setErr("Could not load this post.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (cleanUsername && slug) load();

    return () => {
      ignore = true;
    };
  }, [cleanUsername, slug]);

  if (loading) {
    return (
      <div className="app-shell">
        <SiteHeader me={me} />
        <main className="page-section">
          <div className="page-wrap max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-5 w-40 rounded-xl bg-slate-200" />
              <div className="h-12 w-3/4 rounded-xl bg-slate-200" />
              <div className="h-6 w-2/3 rounded-xl bg-slate-200" />
              <div className="h-72 rounded-3xl bg-slate-200" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (err || !data?.post) {
    return (
      <div className="app-shell">
        <SiteHeader me={me} />
        <main className="page-section">
          <div className="page-wrap max-w-3xl">
            <div className="card p-6 sm:p-8">
              <h1 className="text-2xl font-semibold text-slate-950">
                Post not found
              </h1>
              <p className="mt-3 text-slate-600">
                {err || "This post does not exist."}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { profile, post } = data;
  const accent = profile?.themeAccent || "#0f172a";

  return (
    <div className="app-shell">
      <SiteHeader me={me} />

      <main className="page-section">
        <div className="page-wrap max-w-4xl">
          <div className="mb-6">
            <Link to={`/blog/${cleanUsername}`} className="btn-secondary">
              ← Back to @{cleanUsername}
            </Link>
          </div>

          <article className="card overflow-hidden">
          {post.coverImageUrl ? (
            post.coverMediaType === "video" ? (
              <video
                src={post.coverImageUrl}
                className="h-56 w-full border-b border-slate-200 object-cover sm:h-72"
                poster={post.coverThumbnailUrl || undefined}
                muted
                playsInline
                autoPlay
                loop
                controls
                preload="metadata"
              />
            ) : (
              <img
                src={post.coverImageUrl}
                alt={post.title || "Cover image"}
                className="h-56 w-full border-b border-slate-200 object-cover sm:h-72"
              />
            )
          ) : (
            <div
              className="h-56 w-full border-b border-slate-200 sm:h-72"
              style={{
                background: `linear-gradient(135deg, ${accent}22, #e2e8f0 75%)`,
              }}
            />
          )}

            <div className="p-6 sm:p-8 lg:p-10">
              <header>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                  {profile?.siteTitle || `@${cleanUsername}`}
                </p>

                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="mt-5 text-lg leading-8 text-slate-600 sm:text-xl">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                  <span className="font-medium">@{cleanUsername}</span>
                  <span>•</span>
                  <span>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString()
                      : "Draft"}
                  </span>
                </div>
                <div className="mt-6">
                  <Link
                    to={`/blog/${cleanUsername}/post/${slug}/gallery`}
                    className="btn-secondary"
                  >
                    Open Gallery
                  </Link>
                </div>
              </header>

              <div className="mt-10">
                {renderNode(post.contentJson, "root")}
              </div>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}