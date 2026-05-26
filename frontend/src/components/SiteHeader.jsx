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
      primary: "bg-amber-700 hover:bg-amber-800",
      border: "border-amber-200",
      text: "text-amber-700",
      hoverText: "hover:text-amber-900",
      hoverBg: "hover:bg-amber-50",
      dropdownHover: "hover:bg-amber-50 hover:text-amber-900",
    };
  }

  if (pathname.startsWith("/dashboard/posts/new")) {
    return {
      primary: "bg-orange-600 hover:bg-orange-700",
      border: "border-orange-200",
      text: "text-orange-700",
      hoverText: "hover:text-orange-900",
      hoverBg: "hover:bg-orange-50",
      dropdownHover: "hover:bg-orange-50 hover:text-orange-900",
    };
  }

  if (pathname.startsWith("/dashboard/settings")) {
    return {
      primary: "bg-red-700 hover:bg-red-800",
      border: "border-red-200",
      text: "text-red-700",
      hoverText: "hover:text-red-900",
      hoverBg: "hover:bg-red-50",
      dropdownHover: "hover:bg-red-50 hover:text-red-900",
    };
  }

  if (pathname.startsWith("/dashboard")) {
    return {
      primary: "bg-sky-600 hover:bg-sky-700",
      border: "border-sky-200",
      text: "text-sky-700",
      hoverText: "hover:text-sky-900",
      hoverBg: "hover:bg-sky-50",
      dropdownHover: "hover:bg-sky-50 hover:text-sky-900",
    };
  }

  return {
    primary: "bg-lime-600 hover:bg-lime-700",
    border: "border-lime-200",
    text: "text-lime-700",
    hoverText: "hover:text-lime-900",
    hoverBg: "hover:bg-lime-50",
    dropdownHover: "hover:bg-lime-50 hover:text-lime-900",
  };
}

function navItem(type, active) {
  const styles = {
    home: {
      base: "text-lime-700 hover:text-lime-900 hover:bg-lime-50",
      active: "bg-lime-100 text-lime-900 font-bold",
    },

    browse: {
      base: "text-amber-700 hover:text-amber-900 hover:bg-amber-50",
      active: "bg-amber-100 text-amber-900 font-bold",
    },

    dashboard: {
      base: "text-sky-700 hover:text-sky-900 hover:bg-sky-50",
      active: "bg-sky-100 text-sky-900 font-bold",
    },

    settings: {
      base: "text-red-700 hover:text-red-900 hover:bg-red-50",
      active: "bg-red-100 text-red-900 font-bold",
    },
  };

  return `rounded-xl px-4 py-2 text-sm transition ${
    active ? styles[type].active : styles[type].base
  }`;
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
        className={`btn-primary ${theme.primary}`}
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

  const { apps, users } = getEnvLinks();

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
    <header className="topbar">
      <div className="page-wrap">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div
              className={`h-10 w-10 overflow-hidden rounded-2xl border ${theme.border} bg-white`}
            >
              <img
                src={blogLogo}
                alt="Blog Platform logo"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Blog Platform
              </p>

              <p className="text-xs text-slate-500">
                Public blogs, private authoring
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              to="/"
              className={navItem(
                "home",
                currentPath === "/"
              )}
            >
              Home
            </Link>

            <Link
              to="/directory"
              className={navItem(
                "browse",
                currentPath.startsWith("/directory")
              )}
            >
              Browse blogs
            </Link>

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
                  className={`btn-primary ${theme.primary}`}
                >
                  New post
                </Link>

                {isAdmin && (
                  <Link
                    to="/dashboard/admin"
                    className="btn-secondary border-red-200 text-red-700 hover:bg-red-50 hover:text-red-900"
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
                className={`btn-secondary ${theme.border} ${theme.text} ${theme.hoverBg} ${theme.hoverText} disabled:opacity-60`}
              >
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            ) : (
              <a
                href={loginHref}
                className={`btn-primary ${theme.primary}`}
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
            className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border ${theme.border} bg-white ${theme.text} transition ${theme.hoverBg} ${theme.hoverText} md:hidden`}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>
    </header>
  );
}