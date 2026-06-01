// frontend/src/pages/HomePage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authMe } from "../lib/api";
import SiteHeader from "../components/SiteHeader";

const AUTH_BASE = (
  import.meta.env.VITE_AUTH_BASE || "http://localhost:5173"
).replace(/\/+$/, "");

const APP_BASE_URL = (
  import.meta.env.VITE_APP_BASE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "")
).replace(/\/+$/, "");

const APP_BASE = import.meta.env.DEV ? "" : "/blog-app";

function getAuthRegisterUrl() {
  const next = encodeURIComponent(`${APP_BASE_URL}/dashboard/settings`);
  return `${AUTH_BASE}/register?from=blog-app&next=${next}`;
}

function resolveUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${APP_BASE}${url}`;
  return `${APP_BASE}/${url}`;
}

function getBlogUrl(blog) {
  const username = blog?.username || blog?.user?.username || blog?.slug;
  return username ? `/blog/${username}` : "/directory";
}

function normaliseBlogs(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.blogs)) return data.blogs;
  if (Array.isArray(data?.profiles)) return data.profiles;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

const tools = [
  {
    title: "Bird Sound Identifier",
    icon: "🐦",
    text: "Record bird calls and identify likely species.",
    href: "https://stefandodds.ie/wildlife-sound/?mode=bird",
    status: "Open",
    available: true,
  },
  {
    title: "Wildlife Sound Identifier",
    icon: "🦉",
    text: "Analyse animal sounds, frogs, insects and other wildlife recordings.",
    href: "https://stefandodds.ie/wildlife-sound/?mode=animal",
    status: "Open",
    available: true,
  },
  {
    title: "Plant Photo Identifier",
    icon: "🌿",
    text: "Upload a plant photo and identify likely species.",
    href: "https://stefandodds.ie/wildlife-sound/?mode=photo&type=PLANT",
    status: "Open",
    available: true,
  },
  {
    title: "Mushroom Identifier",
    icon: "🍄",
    text: "Photograph fungi and identify likely species.",
    href: "https://stefandodds.ie/wildlife-sound/?mode=photo&type=FUNGI",
    status: "Open",
    available: false,
  },
  {
    title: "Wildlife Photo Identifier",
    icon: "🐾",
    text: "Identify mammals, insects, reptiles and amphibians from images.",
    href: "https://stefandodds.ie/wildlife-sound/?mode=photo&type=ANIMAL",
    status: "Open",
    available: true,
  },
];

export default function HomePage() {
  const [me, setMe] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    async function loadAuth() {
      const auth = await authMe().catch(() => null);
      if (!ignore) setMe(auth || null);
    }

    loadAuth();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadBlogs() {
      setBlogsLoading(true);

      const endpoints = [
        `${APP_BASE}/api/directory`,
        `${APP_BASE}/api/blogs`,
        `${APP_BASE}/api/public/blogs`,
      ];

      for (const endpoint of endpoints) {
        try {
          const res = await fetch(endpoint, {
            credentials: "include",
          });

          if (!res.ok) continue;

          const data = await res.json();
          const found = normaliseBlogs(data).slice(0, 6);

          if (!ignore) {
            setBlogs(found);
            setBlogsLoading(false);
          }

          return;
        } catch {
          // try next endpoint
        }
      }

      if (!ignore) {
        setBlogs([]);
        setBlogsLoading(false);
      }
    }

    loadBlogs();

    return () => {
      ignore = true;
    };
  }, []);

  const isLoggedIn = Boolean(me?.user);
  const setupHref = isLoggedIn ? "/dashboard/settings" : getAuthRegisterUrl();

  return (
    <div className="app-shell bg-[#FAF7F2] text-slate-900">
      <SiteHeader me={me} setMe={setMe} />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(45,55,72,0.86),rgba(53,94,59,0.72)),url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80')] bg-cover bg-center" />

          <div className="page-wrap relative py-24 sm:py-28 lg:py-36">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex rounded-full border border-white/25 bg-white/15 px-4 py-2 text-sm font-medium text-white shadow-sm backdrop-blur">
                Travel stories, maps, photos and journeys
              </p>

              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
                Share your journey with the world.
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">
                Create a travel blog for your adventures, photography, videos,
                route maps and stories from anywhere.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/directory"
                  className="rounded-full bg-[#B85C38] px-6 py-3 text-center font-semibold text-white shadow-lg transition hover:bg-[#9f4e31]"
                >
                  Explore travel blogs
                </Link>

                {isLoggedIn ? (
                  <Link
                    to="/dashboard"
                    className="rounded-full border border-white/35 bg-white/15 px-6 py-3 text-center font-semibold text-white backdrop-blur transition hover:bg-white/25"
                  >
                    Open dashboard
                  </Link>
                ) : (
                  <a
                    href={setupHref}
                    className="rounded-full border border-white/35 bg-white/15 px-6 py-3 text-center font-semibold text-white backdrop-blur transition hover:bg-white/25"
                  >
                    Create your blog
                  </a>
                )}
              </div>

              <p className="mt-5 text-sm text-white/75">
                Free public reading • Mobile friendly • Built for travel
                storytelling
              </p>
            </div>
          </div>
        </section>

        <section className="page-section">
          <div className="page-wrap">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#B85C38]">
                  Featured journeys
                </p>

                <h2 className="mt-3 text-4xl font-bold text-slate-950">
                  Travel blogs from the community
                </h2>

                <p className="mt-3 max-w-2xl text-lg text-slate-600">
                  Browse real journeys, personal travel writing, photo stories
                  and adventure blogs.
                </p>
              </div>

              <Link
                to="/directory"
                className="font-semibold text-[#B85C38] hover:text-[#9f4e31]"
              >
                View all blogs →
              </Link>
            </div>

            {blogsLoading ? (
              <div className="grid gap-6 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-80 animate-pulse rounded-[2rem] bg-white shadow-sm"
                  />
                ))}
              </div>
            ) : blogs.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {blogs.map((blog) => {
                  const title =
                    blog.blogTitle ||
                    blog.title ||
                    blog.displayName ||
                    blog.name ||
                    blog.username ||
                    "Travel Blog";

                  const description =
                    blog.bio ||
                    blog.description ||
                    blog.excerpt ||
                    "A personal travel journal with stories, photos and journeys.";

                  const image =
                    blog.coverImageUrl ||
                    blog.avatarUrl ||
                    blog.imageUrl ||
                    blog.coverUrl;

                  return (
                    <Link
                      key={blog.id || title}
                      to={getBlogUrl(blog)}
                      className="group overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="h-52 overflow-hidden bg-slate-200">
                        {image ? (
                          <img
                            src={resolveUrl(image)}
                            alt={title}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#D8C3A5,#355E3B)] text-6xl">
                            🌍
                          </div>
                        )}
                      </div>

                      <div className="p-6">
                        <p className="text-sm font-semibold text-[#B85C38]">
                          Travel journal
                        </p>

                        <h3 className="mt-2 text-2xl font-bold text-slate-950">
                          {title}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-slate-600">
                          {description}
                        </p>

                        <p className="mt-5 font-semibold text-[#355E3B]">
                          Open journey →
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-[#D8C3A5] bg-white p-10 text-center">
                <h3 className="text-2xl font-bold text-slate-950">
                  No public travel blogs found yet.
                </h3>

                <p className="mt-3 text-slate-600">
                  Once public blogs are available, they will appear here
                  automatically.
                </p>

                <div className="mt-6">
                  {isLoggedIn ? (
                    <Link
                      to="/dashboard/settings"
                      className="rounded-full bg-[#B85C38] px-6 py-3 font-semibold text-white hover:bg-[#9f4e31]"
                    >
                      Set up my blog
                    </Link>
                  ) : (
                    <a
                      href={setupHref}
                      className="rounded-full bg-[#B85C38] px-6 py-3 font-semibold text-white hover:bg-[#9f4e31]"
                    >
                      Create your blog
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="page-section pt-0">
          <div className="page-wrap">
            <div className="rounded-[2.5rem] bg-[#355E3B] p-8 text-white shadow-xl sm:p-10 lg:p-12">
              <div className="mb-8 max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#D8C3A5]">
                  Travel & nature tools
                </p>

                <h2 className="mt-3 text-4xl font-bold">
                  Identify what you discover on the journey
                </h2>

                <p className="mt-4 text-lg leading-8 text-white/80">
                  Use AI-powered tools for birds, wildlife sounds, plants and
                  future photo identification features.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {tools.map((tool) => (
                  <a
                    key={tool.title}
                    href={tool.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-[2rem] border border-white/10 bg-white/10 p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/15 ${
                      !tool.available ? "opacity-75" : ""
                    }`}
                  >
                    <div className="text-5xl">{tool.icon}</div>

                    <h3 className="mt-5 text-xl font-bold text-white">
                      {tool.title}
                    </h3>

                    <p className="mt-3 text-white/75">{tool.text}</p>

                    <p className="mt-5 font-semibold text-[#D8C3A5]">
                      {tool.status}
                      {tool.available ? " →" : ""}
                    </p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="page-section pt-0">
          <div className="page-wrap">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-slate-200">
                <div className="text-4xl">🗺️</div>

                <h3 className="mt-5 text-2xl font-bold text-slate-950">
                  Interactive maps
                </h3>

                <p className="mt-3 text-slate-600">
                  Turn routes and places into visual travel stories.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-slate-200">
                <div className="text-4xl">📸</div>

                <h3 className="mt-5 text-2xl font-bold text-slate-950">
                  Rich media
                </h3>

                <p className="mt-3 text-slate-600">
                  Share photos, videos, galleries and written reflections.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-slate-200">
                <div className="text-4xl">✍️</div>

                <h3 className="mt-5 text-2xl font-bold text-slate-950">
                  Your own space
                </h3>

                <p className="mt-3 text-slate-600">
                  Publish under your own profile and build a personal travel
                  journal.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="page-section pt-0">
          <div className="page-wrap">
            <div className="overflow-hidden rounded-[2.5rem] bg-[linear-gradient(135deg,#B85C38,#355E3B)] p-10 text-center text-white shadow-xl sm:p-14">
              <h2 className="text-4xl font-bold">
                Ready to start your travel story?
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-lg text-white/85">
                Create a blog, publish your journeys and share your adventures
                with readers anywhere.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                {isLoggedIn ? (
                  <Link
                    to="/dashboard"
                    className="rounded-full bg-white px-6 py-3 font-semibold text-[#355E3B] transition hover:bg-[#FAF7F2]"
                  >
                    Open dashboard
                  </Link>
                ) : (
                  <a
                    href={setupHref}
                    className="rounded-full bg-white px-6 py-3 font-semibold text-[#355E3B] transition hover:bg-[#FAF7F2]"
                  >
                    Create my blog
                  </a>
                )}

                <Link
                  to="/directory"
                  className="rounded-full border border-white/30 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Browse journeys
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}