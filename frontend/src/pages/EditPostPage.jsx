// frontend/src/pages/EditPostPage.jsx

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch, apiUpload, authMe } from "../lib/api";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import SiteHeader from "../components/SiteHeader";

import AIAssistantPanel from "../components/AIAssistantPanel";

function ToolbarButton({ onClick, label, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        active
          ? "inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          : "inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      }
    >
      {label}
    </button>
  );
}

export default function EditPostPage() {
  const { id } = useParams();
  const isNew = id === "new" || !id;
  const navigate = useNavigate();

  const imageInputRef = useRef(null);
  const coverImageInputRef = useRef(null);

  const [me, setMe] = useState(null);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    coverImageUrl: "",
    coverMediaType: "image",
    coverThumbnailUrl: "",
    status: "DRAFT",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [savedMsg, setSavedMsg] = useState("");

  const [selectedText, setSelectedText] = useState("");

  const [selectionRange, setSelectionRange] = useState({ from: null, to: null });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      FontFamily,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    immediatelyRender: false,
    content: {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] sm:min-h-[420px] w-full outline-none text-slate-800 leading-8",
      },
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to, "\n").trim();
    
      if (text) {
        setSelectedText(text);
        setSelectionRange({ from, to });
      }
    },
  });

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const auth = await authMe();

        if (!auth?.user) {
          window.location.href = `/auth/login?from=blog-app&next=${encodeURIComponent(
            `${window.location.origin}${import.meta.env.BASE_URL}dashboard`
          )}`;
          return;
        }

        if (!ignore) setMe(auth);

        if (!isNew) {
          const posts = await apiFetch("/me/posts");
          const post = posts.find((p) => p.id === id);

          if (post && !ignore) {
            setForm({
              title: post.title || "",
              excerpt: post.excerpt || "",
              coverImageUrl: post.coverImageUrl || "",
              coverMediaType: post.coverMediaType || "image",
              coverThumbnailUrl: post.coverThumbnailUrl || "",
              status: post.status || "DRAFT",
            });

            if (editor && post.contentJson) {
              editor.commands.setContent(post.contentJson);
            }
          }
        }
      } catch {
        if (!ignore) setErr("Could not load the editor.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (editor) load();

    return () => {
      ignore = true;
    };
  }, [id, isNew, editor]);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleAddImage() {
    setErr("");
    imageInputRef.current?.click();
  }

  async function handleImageFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      e.target.value = "";
      return;
    }

    try {
      setErr("");
      const uploaded = await apiUpload("/uploads/image", file);

      editor
        ?.chain()
        .focus()
        .setImage({
          src: uploaded.url,
          alt: form.title || "Post image",
          title: file.name,
        })
        .run();
    } catch (error) {
      setErr(error.message || "Could not upload the image.");
    } finally {
      e.target.value = "";
    }
  }

  function handleBrowseCoverImage() {
    setErr("");
    coverImageInputRef.current?.click();
  }

  async function handleCoverImageFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
  
    if (!isImage && !isVideo) {
      setErr("Please choose an image or video file for the cover.");
      e.target.value = "";
      return;
    }
  
    try {
      setErr("");
  
      const uploadPath = isVideo ? "/uploads/video" : "/uploads/image";
      const fieldName = isVideo ? "video" : "image";
      const uploaded = await apiUpload(uploadPath, file, fieldName);
  
      setForm((prev) => ({
        ...prev,
        coverImageUrl: uploaded.url || "",
        coverMediaType: uploaded.mediaType || (isVideo ? "video" : "image"),
        coverThumbnailUrl: uploaded.thumbnailUrl || "",
      }));
    } catch (error) {
      setErr(error.message || "Could not upload the cover media.");
    } finally {
      e.target.value = "";
    }
  }

  async function handleSave(nextStatus = form.status) {
    try {
      setSaving(true);
      setErr("");
      setSavedMsg("");

      const payload = {
        ...form,
        status: nextStatus,
        contentJson: editor?.getJSON?.() || {
          type: "doc",
          content: [{ type: "paragraph" }],
        },
      };

      if (isNew) {
        const created = await apiFetch("/me/posts", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setSavedMsg("Post created.");
        navigate(`/dashboard/posts/${created.id}`);
        return;
      }

      await apiFetch(`/me/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSavedMsg(
        nextStatus === "PUBLISHED" ? "Post published." : "Changes saved."
      );
      setForm((prev) => ({ ...prev, status: nextStatus }));
    } catch {
      setErr("Could not save this post.");
    } finally {
      setSaving(false);
    }
  }

  function handleReplaceWithAI(text) {
    if (!editor || !text) return;
  
    const { from, to } = selectionRange || {};
    if (from == null || to == null) return;
  
    editor
      .chain()
      .focus()
      .insertContentAt({ from, to }, text)
      .run();
  }
  
  function handleInsertBelowWithAI(text) {
    if (!editor || !text) return;
  
    const { to } = selectionRange || {};
    const insertPos = to ?? editor.state.selection.to;
  
    editor
      .chain()
      .focus()
      .insertContentAt(insertPos, `\n\n${text}`)
      .run();
  }

  return (
    <div className="app-shell">
      <SiteHeader me={me} />

      <main className="page-section">
        <div className="page-wrap">
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-sky-700">Editor</p>
              <h1 className="section-title">
                {isNew ? "Create new post" : "Edit post"}
              </h1>
              <p className="mt-2 text-slate-600">
                Write in a clean editor that works well on desktop and mobile.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/dashboard" className="btn-secondary">
                Back
              </Link>
              <button
                type="button"
                onClick={() => handleSave("DRAFT")}
                disabled={saving}
                className="btn-secondary disabled:opacity-60"
              >
                Save draft
              </button>
              <button
                type="button"
                onClick={() => handleSave("PUBLISHED")}
                disabled={saving}
                className="btn-primary disabled:opacity-60"
              >
                Publish
              </button>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
            <section className="card p-5 sm:p-6 lg:p-8">
              <label className="block">
                <span className="field-label">Title</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  placeholder="Write your post title"
                  className="field-input"
                />
              </label>

              <label className="mt-5 block">
                <span className="field-label">Excerpt</span>
                <textarea
                  name="excerpt"
                  value={form.excerpt}
                  onChange={updateField}
                  rows={3}
                  placeholder="A short summary for listing pages and previews"
                  className="field-textarea"
                />
              </label>

              <label className="mt-5 block">
                <span className="field-label">Cover Media URL</span>
                <input
                  name="coverImageUrl"
                  value={form.coverImageUrl}
                  onChange={updateField}
                  placeholder="/uploads/blog/your-user-id/cover.jpg or /uploads/blog/your-user-id/cover.mp4"
                  className="field-input"
                />
              </label>

              <div className="mt-3 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleBrowseCoverImage}
                  className="btn-secondary"
                >
                  Browse cover image/video
                </button>

                {form.coverImageUrl && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        coverImageUrl: "",
                        coverMediaType: "image",
                        coverThumbnailUrl: "",
                      }))
                    }
                    className="btn-ghost"
                  >
                    Remove cover media
                  </button>
                )}
              </div>

              <input
                ref={coverImageInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={handleCoverImageFileChange}
                className="hidden"
              />

              {form.coverImageUrl && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                  {form.coverMediaType === "video" ? (
                    <div className="relative h-48 w-full bg-slate-100">
                      {form.coverThumbnailUrl ? (
                        <img
                          src={form.coverThumbnailUrl}
                          alt="Video cover preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video
                          src={form.coverImageUrl}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                          autoPlay
                          loop
                          preload="metadata"
                        />
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="rounded-full bg-white/90 px-3 py-2 text-sm font-medium text-black">
                          ▶ Video cover
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={form.coverImageUrl}
                      alt="Cover preview"
                      className="h-48 w-full object-cover"
                    />
                  )}
                </div>
              )}

              <div className="mt-6">
                <span className="field-label">Formatting</span>

                <div className="mb-4 flex flex-wrap gap-2">
                  <ToolbarButton
                    label="Bold"
                    active={editor?.isActive("bold")}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  />
                  <ToolbarButton
                    label="Italic"
                    active={editor?.isActive("italic")}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  />
                  <ToolbarButton
                    label="Underline"
                    active={editor?.isActive("underline")}
                    onClick={() =>
                      editor?.chain().focus().toggleUnderline().run()
                    }
                  />
                  <ToolbarButton
                    label="H2"
                    active={editor?.isActive("heading", { level: 2 })}
                    onClick={() =>
                      editor?.chain().focus().toggleHeading({ level: 2 }).run()
                    }
                  />
                  <ToolbarButton
                    label="Bullet list"
                    active={editor?.isActive("bulletList")}
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                  />
                  <ToolbarButton
                    label="Quote"
                    active={editor?.isActive("blockquote")}
                    onClick={() =>
                      editor?.chain().focus().toggleBlockquote().run()
                    }
                  />
                  <ToolbarButton
                    label="Left"
                    active={editor?.isActive({ textAlign: "left" })}
                    onClick={() =>
                      editor?.chain().focus().setTextAlign("left").run()
                    }
                  />
                  <ToolbarButton
                    label="Center"
                    active={editor?.isActive({ textAlign: "center" })}
                    onClick={() =>
                      editor?.chain().focus().setTextAlign("center").run()
                    }
                  />
                  <ToolbarButton
                    label="Right"
                    active={editor?.isActive({ textAlign: "right" })}
                    onClick={() =>
                      editor?.chain().focus().setTextAlign("right").run()
                    }
                  />
                  <ToolbarButton
                    label="Image"
                    active={false}
                    onClick={handleAddImage}
                  />
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!value) {
                        editor?.chain().focus().unsetFontFamily().run();
                      } else {
                        editor?.chain().focus().setFontFamily(value).run();
                      }
                    }}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-700"
                  >
                    <option value="">Font</option>
                    <option value="Inter">Inter</option>
                    <option value="Arial">Arial</option>
                    <option value="Georgia">Georgia</option>
                    <option value="'Times New Roman'">Times New Roman</option>
                    <option value="Verdana">Verdana</option>
                  </select>

                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    Text
                    <input
                      type="color"
                      onChange={(e) =>
                        editor?.chain().focus().setColor(e.target.value).run()
                      }
                      className="h-10 w-10 cursor-pointer rounded-lg border border-slate-300 bg-white"
                    />
                  </label>

                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    Highlight
                    <input
                      type="color"
                      onChange={(e) =>
                        editor
                          ?.chain()
                          .focus()
                          .setHighlight({ color: e.target.value })
                          .run()
                      }
                      className="h-10 w-10 cursor-pointer rounded-lg border border-slate-300 bg-white"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      editor?.chain().focus().unsetColor().run();
                      editor?.chain().focus().unsetHighlight().run();
                      editor?.chain().focus().unsetFontFamily().run();
                    }}
                    className="rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Clear style
                  </button>
                </div>

                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <div className="rounded-3xl border border-slate-300 bg-white p-4 sm:p-5">
                  {loading || !editor ? (
                    <div className="min-h-[320px] animate-pulse rounded-2xl bg-slate-100" />
                  ) : (
                    <EditorContent editor={editor} />
                  )}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-slate-950">
                  Post settings
                </h2>

                <label className="mt-4 block">
                  <span className="field-label">Status</span>
                  <select
                    name="status"
                    value={form.status}
                    onChange={updateField}
                    className="field-select"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </label>

                {savedMsg && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                    {savedMsg}
                  </div>
                )}

                {err && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {err}
                  </div>
                )}
              </div>

              <AIAssistantPanel
                selectedText={selectedText}
                fullText={editor?.getText?.() || ""}
                onReplace={handleReplaceWithAI}
                onInsertBelow={handleInsertBelowWithAI}
              />

  <div className="card p-6">
    <h2 className="text-lg font-semibold text-slate-950">
      Writing notes
    </h2>
    <p className="mt-3 text-sm leading-7 text-slate-600">
      Your content is saved as structured JSON, which makes the
      public rendering cleaner and leaves room for future features
      like reusable blocks, themes, and richer formatting.
    </p>
  </div>
</aside>
          </div>
        </div>
      </main>
    </div>
  );
}