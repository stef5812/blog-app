// frontend/src/pages/HomePage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { authMe } from "../lib/api";
import SiteHeader from "../components/SiteHeader";
import TravelAvatar from "../components/TravelAvatar";
import logoImg from "../assets/stefandodds-logo-ai.png";
import avatarsImg from "../assets/travel-avatars.png";

const highlights = [
  "Public blogs with no signup required for readers",
  "Private writer dashboard using standalone-auth",
  "Mobile-friendly writing and management experience",
  "Travel-themed branding with reusable avatars",
];

export default function HomePage() {
  const [me, setMe] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const auth = await authMe().catch(() => null);

        if (!ignore) {
          setMe(auth || null);
        }
      } catch {
        if (!ignore) {
          setMe(null);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="app-shell bg-[linear-gradient(180deg,#f7fff7_0%,#f8fafc_35%,#ffffff_100%)]">
      <SiteHeader me={me} setMe={setMe} />

      <main>
        <section className="page-section overflow-hidden">
          <div className="page-wrap">
            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-200 bg-lime-50 px-3 py-1 text-sm font-medium text-lime-800">
                  <span className="inline-block h-2 w-2 rounded-full bg-lime-500" />
                  Travel blogs powered by AI-ready auth
                </div>

                <img
                  src={logoImg}
                  alt="Stefandodds.ie Full Stack AI"
                  className="mb-6 h-auto w-full max-w-[340px] sm:max-w-[430px]"
                />

                <h1 className="hero-title max-w-3xl">
                  Build travel-inspired blogs that look professional on desktop
                  and mobile.
                </h1>

                <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                  Give every writer their own public blog space, with private
                  editing through standalone-auth. Readers can browse freely,
                  while authors manage their profile, posts, and branding from a
                  polished dashboard.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/dashboard"
                    className="btn-primary bg-lime-600 hover:bg-lime-700"
                  >
                    Open dashboard
                  </Link>

                  <Link
                    to="/directory"
                    className="btn-secondary border-lime-200 text-lime-800 hover:bg-lime-50"
                  >
                    Browse blogs
                  </Link>

                  <Link
                    to="/dashboard/settings"
                    className="btn-secondary border-lime-200 text-lime-800 hover:bg-lime-50"
                  >
                    Set up my blog
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <TravelAvatar
                      key={index}
                      src={avatarsImg}
                      index={index}
                      size={52}
                    />
                  ))}
                  <div className="rounded-full border border-lime-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                    International travel theme
                  </div>
                </div>

                {me?.user && (
                  <div className="mt-6 card max-w-xl border-lime-100 p-4">
                    <p className="text-sm text-slate-500">Signed in as</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {me.user.displayName || me.user.email}
                    </p>
                  </div>
                )}
              </div>

              <div className="relative">
                <div className="absolute -right-6 -top-6 h-40 w-40 rounded-full bg-lime-200/40 blur-3xl" />
                <div className="absolute -bottom-10 -left-8 h-48 w-48 rounded-full bg-emerald-200/40 blur-3xl" />

                <div className="card relative overflow-hidden border-lime-100 p-4 sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Featured travel writers</p>
                      <h2 className="text-2xl font-semibold text-slate-950">
                        Global voices
                      </h2>
                    </div>
                    <div className="rounded-full bg-lime-100 px-3 py-1 text-sm font-medium text-lime-800">
                      Live
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-3xl border border-lime-100 bg-white">
                    <img
                      src={avatarsImg}
                      alt="Travel themed avatar collection"
                      className="h-auto w-full object-cover"
                    />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {highlights.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-section pt-0">
          <div className="page-wrap">
            <div className="grid gap-5 md:grid-cols-3">
              <div className="card border-lime-100 p-6">
                <p className="text-sm text-slate-500">Public reading</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">No login</p>
                <p className="mt-3 text-slate-600">
                  Anyone can browse profiles and posts without joining.
                </p>
              </div>

              <div className="card border-lime-100 p-6">
                <p className="text-sm text-slate-500">Author identity</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">@username</p>
                <p className="mt-3 text-slate-600">
                  Each writer gets their own public blog space and theme.
                </p>
              </div>

              <div className="card border-lime-100 p-6">
                <p className="text-sm text-slate-500">Content format</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">JSON editor</p>
                <p className="mt-3 text-slate-600">
                  Structured content for cleaner rendering and future features.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}