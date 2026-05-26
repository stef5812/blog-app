// frontend/src/components/SiteHeader.jsx

import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import blogLogo from "../assets/logo-hat.png";

function getEnvLinks() {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (isLocal) {
    return {
      apps: [
        { label: "Recipe App", href: "http://localhost:5174/recipe-app/" },
        { label: "HalfYourBook", href: "http://localhost:5175/halfyourbook/" },
        { label: "Portfolio", href: "http://localhost:5177/" },
        { label: "Service Locator", href: "http://localhost:5178/" },
      ],
      users: [
        {
          label: "User Login",
          href: "http://localhost:3001/login?from=portfolio&next=/menu",
        },
        {
          label: "Register",
          href: "http://localhost:3001/register?from=portfolio&next=/menu",
        },
      ],
    };
  }

  return {
    apps: [
      { label: "Recipe App", href: "https://stefandodds.ie/recipe-app/" },
      { label: "HalfYourBook", href: "https://stefandodds.ie/halfyourbook/" },
      { label: "Portfolio", href: "https://stefandodds.ie/" },
      {
        label: "Service Locator",
        href: "https://stefandodds.ie/service-locator/",
      },
    ],
    users: [
      {
        label: "User Login",
        href: "https://auth.stefandodds.ie/login?from=portfolio&next=/menu",
      },
      {
        label: "Register",
        href: "https://auth.stefandodds.ie/register?from=portfolio&next=/menu",
      },
    ],
  };
}

function getTheme(pathname) {
  if (pathname.startsWith("/directory")) {
    return {
      header: "from-amber-900/90 via-amber-700/80 to-orange-600/70",
      dropdownHover: "hover:bg-amber-50 hover:text-amber-900",
    };
  }

  if (pathname.startsWith("/dashboard/posts/new")) {
    return {
      header: "from-orange-900/90 via-orange-700/80 to-amber-500/70",
      dropdownHover: "hover:bg-orange-50 hover:text-orange-900",
    };
  }

  if (pathname.startsWith("/dashboard/settings")) {
    return {
      header: "from-red-950/90 via-red-800/80 to-rose-600/70",
      dropdownHover: "hover:bg-red-50 hover:text-red-900",
    };
  }

  if (pathname.startsWith("/dashboard")) {
    return {
      header: "from-sky-950/90 via-sky-800/80 to-cyan-600/70",
      dropdownHover: "hover:bg-sky-50 hover:text-sky-900",
    };
  }

  if (pathname.startsWith("/blog")) {
    return {
      header: "from-amber-950/90 via-stone-800/80 to-orange-700/70",
      dropdownHover: "hover:bg-amber-50 hover:text-amber-900",
    };
  }

  return {
    header: "from-lime-950/90 via-lime-800/80 to-green-600/70",
    dropdownHover: "hover:bg-lime-50 hover:text-lime-900",
  };
}

function getBlogLinks(pathname) {
  const postMatch = pathname.match(
    /^\/blog\/([^/]+)\/post\/([^/]+)(?:\/(gallery|map))?$/
  );

  const profileMatch = pathname.match(/^\/blog\/([^/]+)$/);

  if (postMatch) {
    const [, username, slug] = postMatch;
    const postUrl = `/blog/${username}/post/${slug}`;

    return {
      hasChosenBlog: true,
      post: postUrl,
      list: postUrl,
      gallery: `${postUrl}/gallery`,
      map: `${postUrl}/map`,
    };
  }

  if (profileMatch) {
    const [, username] = profileMatch;

    return {
      hasChosenBlog: true,
      post: `/blog/${username}`,
      list: `/blog/${username}`,
      gallery: null,
      map: null,
    };
  }

  return {
    hasChosenBlog: false,
    post: "/directory",
    list: "/directory",
    gallery: null,
    map: null,
  };
}

function navItem(type, active) {
  const styles = {
    home: {
      base: "text-lime-100 hover:bg-white/10 hover:text-white",
      active:
        "bg-white/15 text-white shadow-[0_0_18px_rgba(217,249,157,0.95)]",
    },
    blog: {
      base: "text-amber-100 hover:bg-white/10 hover:text-white",
      active:
        "bg-white/15 text-white shadow-[0_0_18px_rgba(254,243,199,0.95)]",
    },
    dashboard: {
      base: "text-sky-100 hover:bg-white/10 hover:text-white",
      active:
        "bg-white/15 text-white shadow-[0_0_18px_rgba(186,230,253,0.95)]",
    },
    settings: {
      base: "text-red-100 hover:bg-white/10 hover:text-white",
      active:
        "bg-white/15 text-white shadow-[0_0_18px_rgba(254,202,202,0.95)]",
    },
  };

  return `rounded-xl px-4 py-2 text-sm font-medium transition-all duration-300 ${
    active ? styles[type].active : styles[type].base
  }`;
}

function BlogDropdown({ currentPath, mobile = false, onChoose }) {
  const [open, setOpen] = useState(false);
  const blogLinks = getBlogLinks(currentPath);

  const isBlogActive =
    currentPath.startsWith("/directory") || currentPath.startsWith("/blog");

  function close() {
    setOpen(false);
    if (onChoose) onChoose();
  }

  if (mobile) {
    return (
      <div className="space-y-2">
        <div
          className={`${navItem(
            "blog",
            isBlogActive
          )} flex items-center justify-between`}
        >
          <Link to={blogLinks.list} onClick={close} className="flex-1">
            Blog
          </Link>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-label="Open blog menu"
            className="ml-2 rounded-lg px-2 py-1 transition hover:bg-white/15"
          >
            ▾
          </button>
        </div>

        {open && blogLinks.hasChosenBlog && (
          <div className="ml-8 space-y-2 border-l border-white/20 pl-4">
            {blogLinks.post && (
              <Link
                to={blogLinks.post}
                onClick={close}
                className="block rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                ↳ Post
              </Link>
            )}

            {blogLinks.gallery && (
              <Link
                to={blogLinks.gallery}
                onClick={close}
                className="block rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                ↳ Gallery
              </Link>
            )}

            {blogLinks.map && (
              <Link
                to={blogLinks.map}
                onClick={close}
                className="block rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                ↳ Map
              </Link>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center">
      <Link
        to={blogLinks.list}
        className={`${navItem("blog", isBlogActive)} rounded-r-none pr-3`}
      >
        Blog
      </Link>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Open blog menu"
        className={`${navItem(
          "blog",
          isBlogActive
        )} rounded-l-none border-l border-white/20 px-2`}
      >
        ▾
      </button>

      {open && blogLinks.hasChosenBlog && (
        <div className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.12)] ring-1 ring-zinc-200/70 backdrop-blur-md">
          {blogLinks.post && (
            <Link
              to={blogLinks.post}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-amber-50 hover:text-amber-900"
            >
              ↳ Post
            </Link>
          )}

          {blogLinks.gallery && (
            <Link
              to={blogLinks.gallery}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-amber-50 hover:text-amber-900"
            >
              ↳ Gallery
            </Link>
          )}

          {blogLinks.map && (
            <Link
              to={blogLinks.map}
              onClick={() => setOpen(false)}
              className="block px-6 py-3 text-sm font-medium text-zinc-700 transition hover:bg-amber-50 hover:text-amber-900"
            >
              ↳ Map
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function LinksDropdown({ theme }) {
  const [open, setOpen] = useState(false);
  const { apps, users } = getEnvLinks();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        className="rounded-xl bg-white/15 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-white/20 transition hover:bg-white/25"
      >
        Links <span className="ml-1">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.12)] ring-1 ring-zinc-200/70 backdrop-blur-md">
          <div className="px-4 pb-2 pt-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Apps
            </p>
          </div>

          {apps.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`block px-4 py-3 text-sm font-medium text-zinc-700 transition ${theme.dropdownHover}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}

          <div className="mx-4 my-2 border-t border-zinc-200" />

          <div className="px-4 pb-2 pt-1">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Users
            </p>
          </div>

          {users.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`block px-4 py-3 text-sm font-medium text-zinc-700 transition ${theme.dropdownHover}`}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteHeader({ me, setMe }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const currentPath = location.pathname;
  const theme = getTheme(currentPath);

  const isLoggedIn = !!me?.user;

  const isAdmin = me?.appRoles?.some(
    (r) =>
      r.app === "BLOG_APP" &&
      (r.role === "ADMIN" || r.role === "SUPERADMIN")
  );

  const devNext = `${window.location.origin}${import.meta.env.BASE_URL}dashboard`;
  const prodNext = `${window.location.origin}${import.meta.env.BASE_URL}dashboard`;

  const loginHref = import.meta.env.DEV
    ? `http://localhost:5173/login?from=blog-app&next=${encodeURIComponent(
        devNext
      )}`
    : `https://auth.stefandodds.ie/login?from=blog-app&next=${encodeURIComponent(
        prodNext
      )}`;

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await fetch("/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      if (setMe) setMe(null);
      setOpen(false);
      setLoggingOut(false);
      navigate("/", { replace: true });
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r ${theme.header} shadow-lg shadow-black/10 backdrop-blur-xl transition-all duration-700`}
    >
      <div className="page-wrap">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-10 w-10 overflow-hidden rounded-2xl border border-white/30 bg-white/90 shadow-sm">
              <img
                src={blogLogo}
                alt="Blog Platform logo"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-white drop-shadow">
                Blog Platform
              </p>

              <p className="text-xs text-white/75">
                Public blogs, private authoring
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link to="/" className={navItem("home", currentPath === "/")}>
              Home
            </Link>

            <BlogDropdown currentPath={currentPath} />

            {isLoggedIn && (
              <>
                <Link
                  to="/dashboard"
                  className={navItem(
                    "dashboard",
                    currentPath === "/dashboard"
                  )}
                >
                  Dashboard
                </Link>

                <Link
                  to="/dashboard/settings"
                  className={navItem(
                    "settings",
                    currentPath.startsWith("/dashboard/settings")
                  )}
                >
                  Settings
                </Link>

                <Link
                  to="/dashboard/posts/new"
                  className="rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white"
                >
                  New post
                </Link>

                {isAdmin && (
                  <Link
                    to="/dashboard/admin"
                    className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
                  >
                    Admin
                  </Link>
                )}
              </>
            )}

            <LinksDropdown theme={theme} />

            {isLoggedIn ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-60"
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            ) : (
              <a
                href={loginHref}
                className="rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white"
              >
                Login
              </a>
            )}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-white transition hover:bg-white/20 md:hidden"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {open && (
          <div className="space-y-2 pb-4 md:hidden">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className={navItem("home", currentPath === "/")}
            >
              Home
            </Link>

            <BlogDropdown
              currentPath={currentPath}
              mobile
              onChoose={() => setOpen(false)}
            />

            {isLoggedIn && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setOpen(false)}
                  className={navItem("dashboard", currentPath === "/dashboard")}
                >
                  Dashboard
                </Link>

                <Link
                  to="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className={navItem(
                    "settings",
                    currentPath.startsWith("/dashboard/settings")
                  )}
                >
                  Settings
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}