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
          className={navItem(
            "dashboard",
            currentPath === "/dashboard"
          )}
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

        <Link
          to="/dashboard/posts/new"
          onClick={() => setOpen(false)}
          className="block rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white"
        >
          New post
        </Link>

        {isAdmin && (
          <Link
            to="/dashboard/admin"
            onClick={() => setOpen(false)}
            className="block rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          >
            Admin
          </Link>
        )}
      </>
    )}

    <div className="pt-2">
      <LinksDropdown theme={theme} />
    </div>

    {isLoggedIn ? (
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="block w-full rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-left text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-60"
      >
        {loggingOut ? "Logging out..." : "Logout"}
      </button>
    ) : (
      <a
        href={loginHref}
        className="block rounded-xl bg-white/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:bg-white"
      >
        Login
      </a>
    )}
  </div>
)}