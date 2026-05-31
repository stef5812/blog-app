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
          className="rounded-lg bg-amber-100 px-1.5 py-0.5 text-[0.95em] text-[#7a4b2a]"
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
          className="font-medium text-[#7a4b2a] underline underline-offset-4"
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
          style={{ backgroundColor: mark.attrs?.color || "#fde68a" }}
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
          className="text-base leading-8 text-stone-700 sm:text-lg"
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
        1: "text-4xl font-semibold tracking-tight text-stone-950",
        2: "text-3xl font-semibold tracking-tight text-stone-950",
        3: "text-2xl font-semibold tracking-tight text-stone-950",
        4: "text-xl font-semibold tracking-tight text-stone-950",
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
        <ul key={key} className="list-disc space-y-2 pl-6 text-stone-700">
          {node.content?.map((child, index) => renderNode(child, index))}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={key} className="list-decimal space-y-2 pl-6 text-stone-700">
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
          className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-5 text-lg italic leading-8 text-stone-700"
          style={{ textAlign: node.attrs?.textAlign || undefined }}
        >
          {node.content?.map((child, index) => renderNode(child, index))}
        </blockquote>
      );

    case "horizontalRule":
      return <hr key={key} className="border-amber-200" />;

    case "image":
      if (!node.attrs?.src) return null;

      return (
        <figure key={key} className="my-8">
          <img
            src={node.attrs.src}
            alt={node.attrs.alt || ""}
            className="w-full rounded-2xl border border-amber-200"
          />

          {node.attrs.title && (
            <figcaption className="mt-2 text-sm text-stone-500">
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

  const [comments, setComments] = useState([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [commentErr, setCommentErr] = useState("");
  const [savingComment, setSavingComment] = useState(false);

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

  useEffect(() => {
    let ignore = false;
  
    async function loadComments() {
      if (!data?.post?.id) return;
  
      try {
        const result = await apiFetch(`/public/posts/${data.post.id}/comments`);
        if (!ignore) setComments(result);
      } catch {
        if (!ignore) setComments([]);
      }
    }
  
    loadComments();
  
    return () => {
      ignore = true;
    };
  }, [data?.post?.id]);

  if (loading) {
    return (
      <div className="app-shell bg-[linear-gradient(180deg,#f8f1ea_0%,#f5efe8_42%,#ffffff_100%)]">
        <SiteHeader me={me} />

        <main className="page-section">
          <div className="page-wrap max-w-4xl">
            <div className="animate-pulse space-y-6">
              <div className="h-5 w-40 rounded-xl bg-amber-100" />
              <div className="h-12 w-3/4 rounded-xl bg-amber-100" />
              <div className="h-6 w-2/3 rounded-xl bg-amber-100" />
              <div className="h-72 rounded-3xl bg-amber-100" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (err || !data?.post) {
    return (
      <div className="app-shell bg-[linear-gradient(180deg,#f8f1ea_0%,#f5efe8_42%,#ffffff_100%)]">
        <SiteHeader me={me} />

        <main className="page-section">
          <div className="page-wrap max-w-3xl">
            <div className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm sm:p-8">
              <h1 className="text-2xl font-semibold text-stone-950">
                Post not found
              </h1>

              <p className="mt-3 text-stone-600">
                {err || "This post does not exist."}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const { profile, post } = data;

  async function submitComment(e) {
    e.preventDefault();
  
    try {
      setSavingComment(true);
      setCommentErr("");
  
      const saved = await apiFetch(`/public/posts/${post.id}/comments`, {
        method: "POST",
        body: JSON.stringify({
          authorName: commentName,
          content: commentText,
        }),
      });
  
      setComments((current) => [saved, ...current]);
      setCommentText("");
    } catch {
      setCommentErr("Could not save comment.");
    } finally {
      setSavingComment(false);
    }
  }



  const accent = profile?.themeAccent || "#7a4b2a";

  return (
    <div className="app-shell bg-[linear-gradient(180deg,#f8f1ea_0%,#f5efe8_42%,#ffffff_100%)]">
      <SiteHeader me={me} />

      <main className="page-section">
        <div className="page-wrap max-w-4xl">


          <article className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-sm">
            {post.coverImageUrl ? (
              post.coverMediaType === "video" ? (
                <video
                  src={post.coverImageUrl}
                  className="h-56 w-full border-b border-amber-100 object-cover sm:h-72"
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
                  className="h-56 w-full border-b border-amber-100 object-cover sm:h-72"
                />
              )
            ) : (
              <div
                className="h-56 w-full border-b border-amber-100 sm:h-72"
                style={{
                  background: `linear-gradient(135deg, ${accent}22, #f5e7d8 75%)`,
                }}
              />
            )}

            <div className="p-4 sm:p-5 lg:p-6">
              <header>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-[#7a4b2a]">
                  {profile?.siteTitle || `@${cleanUsername}`}
                </p>

                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="mt-5 text-lg leading-8 text-stone-600 sm:text-xl">
                    {post.excerpt}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-stone-500">
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
                    className="inline-flex items-center justify-center rounded-xl bg-[#7a4b2a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#633b21]"
                  >
                    Open Gallery
                  </Link>



                  <div className="mt-3">
                    <Link
                      to={`/blog/${cleanUsername}`}
                      className="inline-flex items-center text-xs font-medium text-stone-500 transition hover:text-stone-900"
                    >
                      ← Back to @{cleanUsername}
                    </Link>
                  </div>
                </div>
              </header>

              <div className="mt-10">
                {renderNode(post.contentJson, "root")}
              </div>


              
            </div>
          </article>

{/* Comments */}
<div className="mt-12 border-t border-amber-100 pt-8">
  <h2 className="text-2xl font-semibold text-stone-950">Comments</h2>

  {comments.length === 0 ? (
    <p className="mt-2 text-stone-500">Be the first to comment.</p>
  ) : (
    <div className="mt-5 space-y-4">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="rounded-2xl border border-amber-100 bg-white p-4"
        >
          <div className="text-sm font-semibold text-stone-900">
            {comment.authorName}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-stone-700">
            {comment.content}
          </p>
        </div>
      ))}
    </div>
  )}

  <form onSubmit={submitComment} className="mt-6 space-y-3">
    <input
      value={commentName}
      onChange={(e) => setCommentName(e.target.value)}
      placeholder="Your name"
      className="w-full rounded-xl border border-amber-200 p-3"
    />

    <textarea
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
      placeholder="Write a comment..."
      className="w-full rounded-xl border border-amber-200 p-3"
    />

    {commentErr && (
      <p className="text-sm text-red-600">{commentErr}</p>
    )}

    <button
      type="submit"
      disabled={savingComment}
      className="rounded-xl bg-[#7a4b2a] px-4 py-2 font-semibold text-white disabled:opacity-60"
    >
      {savingComment ? "Posting..." : "Post Comment"}
    </button>
  </form>
</div>

        </div>
      </main>
    </div>
  );
}