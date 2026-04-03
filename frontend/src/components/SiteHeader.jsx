// frontend/src/components/SiteHeader.jsx

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

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
            { label: "Portfolio", href: "http://localhost:5174/" },
            { label: "Service Locator", href: "http://localhost:5173/" },
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

function LinksDropdown() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { apps, users } = getEnvLinks();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        className="btn-primary bg-lime-600 hover:bg-lime-700"
      >
        Links <span className="ml-1">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 shadow-[0_12px_40px_rgba(0,0,0,0.12)] ring-1 ring-zinc-200/70 backdrop-blur-md">
          <div className="px-4 pb-2 pt-3">
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
              Apps
            </p>
          </div>

          {apps.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-green-50 hover:text-green-700"
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
              className="block px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-green-50 hover:text-green-700"
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
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isLoggedIn = !!me?.user;

  const isAdmin = me?.appRoles?.some(
    (r) =>
      r.app === "BLOG_APP" &&
      (r.role === "ADMIN" || r.role === "SUPERADMIN")
  );

  const devNext = `${window.location.origin}${import.meta.env.BASE_URL}dashboard`;
  const prodNext = `${window.location.origin}${import.meta.env.BASE_URL}dashboard`;

  const loginHref = import.meta.env.DEV
    ? `http://localhost:5173/login?from=blog-app&next=${encodeURIComponent(devNext)}`
    : `https://auth.stefandodds.ie/login?from=blog-app&next=${encodeURIComponent(prodNext)}`;

  const siteLinks = getEnvLinks();

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
      window.location.href = loginHref;
    }
  }

  return (
    <header className="topbar">
      <div className="page-wrap">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lime-600 text-sm font-semibold text-white">
              B
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Blog Platform</p>
              <p className="text-xs text-slate-500">
                Public blogs, private authoring
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link to="/" className="btn-ghost">
              Home
            </Link>

            <Link
              to="/directory"
              className="text-sm font-medium text-slate-700 hover:text-lime-700"
            >
              Directory
            </Link>

            

            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="btn-ghost">
                  Dashboard
                </Link>

                <Link to="/dashboard/settings" className="btn-ghost">
                  Settings
                </Link>

                <Link
                  to="/dashboard/posts/new"
                  className="btn-primary bg-lime-600 hover:bg-lime-700"
                >
                  New post
                </Link>

                {isAdmin && (
                  <Link
                    to="/dashboard/admin"
                    className="btn-secondary border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Admin
                  </Link>
                )}

                <LinksDropdown />

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="btn-secondary border-lime-200 text-lime-800 hover:bg-lime-50 disabled:opacity-60"
                >
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <a
                href={loginHref}
                className="btn-primary bg-lime-600 hover:bg-lime-700"
              >
                Login
              </a>
            )}
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 md:hidden"
          >
            ☰
          </button>
        </div>

        {open && (
          <div className="border-t border-slate-200 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              <Link to="/" onClick={() => setOpen(false)} className="btn-ghost">
                Home
              </Link>

              <Link
                to="/directory"
                onClick={() => setOpen(false)}
                className="btn-ghost"
              >
                Directory
              </Link>

              <div className="mt-2 px-1">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                  Other apps
                </p>
                <div className="flex flex-col gap-2">
                  {siteLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="btn-ghost text-left"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>

              {isLoggedIn ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setOpen(false)}
                    className="btn-ghost"
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/dashboard/settings"
                    onClick={() => setOpen(false)}
                    className="btn-ghost"
                  >
                    Settings
                  </Link>

                  <Link
                    to="/dashboard/posts/new"
                    onClick={() => setOpen(false)}
                    className="btn-primary bg-lime-600 hover:bg-lime-700"
                  >
                    New post
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/dashboard/admin"
                      onClick={() => setOpen(false)}
                      className="btn-secondary border-red-200 text-red-700"
                    >
                      Admin
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="btn-secondary"
                  >
                    {loggingOut ? "Logging out..." : "Logout"}
                  </button>
                </>
              ) : (
                <a
                  href={loginHref}
                  onClick={() => setOpen(false)}
                  className="btn-primary"
                >
                  Login
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}