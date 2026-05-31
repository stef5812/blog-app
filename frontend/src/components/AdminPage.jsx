// frontend/src/pages/AdminPage.jsx

import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../lib/api";

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function AdminPage() {
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyKey, setBusyKey] = useState("");

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [blogsData, commentsData] = await Promise.all([
        apiFetch("/admin/blogs", {
          credentials: "include",
        }),
        apiFetch("/admin/comments", {
          credentials: "include",
        }).catch(() => []),
      ]);

      setBlogs(Array.isArray(blogsData) ? blogsData : blogsData.blogs || []);
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (err) {
      setError(err.message || "Failed to load admin data.");
      setBlogs([]);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const totalBlogs = useMemo(() => blogs.length, [blogs]);

  const totalPosts = useMemo(() => {
    return blogs.reduce((sum, blog) => {
      const posts = Array.isArray(blog.posts)
        ? blog.posts.length
        : blog.postCount || 0;

      return sum + posts;
    }, 0);
  }, [blogs]);

  const totalComments = comments.length;

  async function handleDeleteComment(commentId, content) {
    const ok = window.confirm(
      `Delete this comment?\n\n${content || "No comment text"}\n\nThis cannot be undone.`
    );

    if (!ok) return;

    const key = `comment-${commentId}`;
    setBusyKey(key);
    setError("");

    try {
      await apiFetch(`/admin/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      setComments((prev) =>
        prev.filter((comment) => comment.id !== commentId)
      );
    } catch (err) {
      setError(err.message || "Failed to delete comment.");
    } finally {
      setBusyKey("");
    }
  }

  async function handleDeletePost(postId, title) {
    const ok = window.confirm(
      `Delete this post?\n\n${title || "Untitled post"}\n\nThis cannot be undone.`
    );
    if (!ok) return;

    const key = `post-${postId}`;
    setBusyKey(key);
    setError("");

    try {
      await apiFetch(`/admin/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      setBlogs((prev) =>
        prev.map((blog) => ({
          ...blog,
          posts: Array.isArray(blog.posts)
            ? blog.posts.filter((post) => post.id !== postId)
            : blog.posts,
        }))
      );

      setComments((prev) =>
        prev.filter((comment) => comment.postId !== postId)
      );
    } catch (err) {
      setError(err.message || "Failed to delete post.");
    } finally {
      setBusyKey("");
    }
  }

  async function handleDeleteBlog(userId, displayName) {
    const ok = window.confirm(
      `Delete this entire blog/profile?\n\n${displayName || "Unknown user"}\n\nThis should remove the blog profile and all related posts.`
    );
    if (!ok) return;

    const key = `blog-${userId}`;
    setBusyKey(key);
    setError("");

    try {
      await apiFetch(`/admin/blogs/${userId}`, {
        method: "DELETE",
        credentials: "include",
      });

      setBlogs((prev) => prev.filter((blog) => blog.userId !== userId));
      setComments((prev) =>
        prev.filter((comment) => comment.post?.blogProfile?.userId !== userId)
      );
    } catch (err) {
      setError(err.message || "Failed to delete blog.");
    } finally {
      setBusyKey("");
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage blog profiles, posts, and comments across the platform.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Blogs
            </div>
            <div className="text-2xl font-semibold">{totalBlogs}</div>
          </div>

          <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Posts
            </div>
            <div className="text-2xl font-semibold">{totalPosts}</div>
          </div>

          <div className="rounded-2xl border bg-white px-4 py-3 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-gray-500">
              Comments
            </div>
            <div className="text-2xl font-semibold">{totalComments}</div>
          </div>

          <button
            onClick={loadAdminData}
            className="rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm hover:bg-gray-50"
            disabled={loading || !!busyKey}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-600">Loading admin data...</p>
        </div>
      ) : (
        <>
          <section className="mb-8 rounded-3xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold">Comments</h2>
                <p className="mt-1 text-sm text-gray-600">
                  Review and delete public comments.
                </p>
              </div>

              <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                {comments.length} comment{comments.length === 1 ? "" : "s"}
              </span>
            </div>

            {comments.length === 0 ? (
              <p className="mt-6 text-sm text-gray-500">No comments found.</p>
            ) : (
              <div className="mt-6 space-y-3">
                {comments.map((comment) => {
                  const deleteCommentBusy =
                    busyKey === `comment-${comment.id}`;

                  const postTitle =
                    comment.post?.title || comment.postTitle || "Untitled post";

                  const blogUsername =
                    comment.post?.blogProfile?.username ||
                    comment.blogUsername ||
                    "";

                  const postSlug = comment.post?.slug || comment.postSlug || "";

                  return (
                    <div
                      key={comment.id}
                      className="rounded-2xl border bg-gray-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">
                              {comment.authorName || "Unknown"}
                            </span>{" "}
                            commented on{" "}
                            <span className="font-semibold text-gray-900">
                              {postTitle}
                            </span>
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            {blogUsername ? `@${blogUsername}` : "Unknown blog"}{" "}
                            · {formatDate(comment.createdAt)}
                          </p>

                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                            {comment.content}
                          </p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          {blogUsername && postSlug ? (
                            <Link
                              to={`/@${blogUsername}/post/${postSlug}`}
                              className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-gray-50"
                            >
                              View post
                            </Link>
                          ) : null}

                          <button
                            onClick={() =>
                              handleDeleteComment(comment.id, comment.content)
                            }
                            disabled={deleteCommentBusy || !!busyKey}
                            className="rounded-xl bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deleteCommentBusy ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {blogs.length === 0 ? (
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-600">No blogs found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {blogs.map((blog) => {
                const posts = Array.isArray(blog.posts) ? blog.posts : [];
                const deleteBlogBusy = busyKey === `blog-${blog.userId}`;

                return (
                  <section
                    key={blog.userId}
                    className="overflow-hidden rounded-3xl border bg-white shadow-sm"
                  >
                    <div className="border-b px-6 py-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <h2 className="text-xl font-semibold">
                            {blog.displayName || blog.username || "Unnamed blog"}
                          </h2>

                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium text-gray-800">
                                Username:
                              </span>{" "}
                              {blog.username || "—"}
                            </p>
                            <p>
                              <span className="font-medium text-gray-800">
                                Email:
                              </span>{" "}
                              {blog.email || "—"}
                            </p>
                            <p>
                              <span className="font-medium text-gray-800">
                                User ID:
                              </span>{" "}
                              {blog.userId || "—"}
                            </p>
                            <p>
                              <span className="font-medium text-gray-800">
                                Posts:
                              </span>{" "}
                              {posts.length}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          {blog.username ? (
                            <Link
                              to={`/@${blog.username}`}
                              className="rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
                            >
                              View public blog
                            </Link>
                          ) : null}

                          <button
                            onClick={() =>
                              handleDeleteBlog(
                                blog.userId,
                                blog.displayName || blog.username
                              )
                            }
                            disabled={deleteBlogBusy || !!busyKey}
                            className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deleteBlogBusy ? "Deleting blog..." : "Delete blog"}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-5">
                      {posts.length === 0 ? (
                        <p className="text-sm text-gray-500">
                          No posts for this blog.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-separate border-spacing-y-2">
                            <thead>
                              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="px-3 py-2">Title</th>
                                <th className="px-3 py-2">Slug</th>
                                <th className="px-3 py-2">Status</th>
                                <th className="px-3 py-2">Updated</th>
                                <th className="px-3 py-2">Actions</th>
                              </tr>
                            </thead>

                            <tbody>
                              {posts.map((post) => {
                                const deletePostBusy =
                                  busyKey === `post-${post.id}`;

                                return (
                                  <tr
                                    key={post.id}
                                    className="rounded-2xl bg-gray-50"
                                  >
                                    <td className="px-3 py-3 font-medium text-gray-900">
                                      {post.title || "Untitled"}
                                    </td>

                                    <td className="px-3 py-3 text-sm text-gray-600">
                                      {post.slug || "—"}
                                    </td>

                                    <td className="px-3 py-3 text-sm text-gray-600">
                                      {post.status || "—"}
                                    </td>

                                    <td className="px-3 py-3 text-sm text-gray-600">
                                      {formatDate(
                                        post.updatedAt || post.createdAt
                                      )}
                                    </td>

                                    <td className="px-3 py-3">
                                      <div className="flex flex-wrap gap-2">
                                        <Link
                                          to={`/dashboard/posts/${post.id}`}
                                          className="rounded-xl border px-3 py-2 text-sm hover:bg-white"
                                        >
                                          Edit
                                        </Link>

                                        {blog.username && post.slug ? (
                                          <Link
                                            to={`/@${blog.username}/post/${post.slug}`}
                                            className="rounded-xl border px-3 py-2 text-sm hover:bg-white"
                                          >
                                            View
                                          </Link>
                                        ) : null}

                                        <button
                                          onClick={() =>
                                            handleDeletePost(post.id, post.title)
                                          }
                                          disabled={deletePostBusy || !!busyKey}
                                          className="rounded-xl bg-red-600 px-3 py-2 text-sm text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                        >
                                          {deletePostBusy
                                            ? "Deleting..."
                                            : "Delete"}
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}