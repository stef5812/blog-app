// frontend/src/components/SiteHeader

import { useState } from "react";
import { Link } from "react-router-dom";

export default function SiteHeader({ me, setMe }) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isLoggedIn = !!me?.user;

  const isAdmin = me?.appRoles?.some(
    (r) =>
      r.app === "BLOG_APP" &&
      (r.role === "ADMIN" || r.role === "SUPERADMIN")
  );

  const devNext = "http://localhost:5176/dashboard";
  const prodNext = "https://blog.stefandodds.ie/dashboard";

  const loginHref = import.meta.env.DEV
    ? `http://localhost:5173/login?from=blog-app&next=${encodeURIComponent(devNext)}`
    : `https://auth.stefandodds.ie/login?from=blog-app&next=${encodeURIComponent(prodNext)}`;

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
      window.location.href = "/";
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

          {/* DESKTOP NAV */}
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

                {/* ✅ ADMIN BUTTON */}
                {isAdmin && (
                  <Link
                    to="/dashboard/admin"
                    className="btn-secondary border-red-200 text-red-700 hover:bg-red-50"
                  >
                    Admin
                  </Link>
                )}

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

          {/* MOBILE MENU BUTTON */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-300 bg-white text-slate-700 md:hidden"
          >
            ☰
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="border-t border-slate-200 py-3 md:hidden">
            <div className="flex flex-col gap-2">
              <Link to="/" onClick={() => setOpen(false)} className="btn-ghost">
                Home
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
                    className="btn-primary bg-lime-600"
                  >
                    New post
                  </Link>

                  {/* ✅ ADMIN BUTTON MOBILE */}
                  {isAdmin && (
                    <Link
                      to="/dashboard/admin"
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
                <a href={loginHref} className="btn-primary">
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