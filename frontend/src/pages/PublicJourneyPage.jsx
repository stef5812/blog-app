import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  APIProvider,
  Map,
  Marker,
  Polyline,
} from "@vis.gl/react-google-maps";
import { apiFetch, authMe } from "../lib/api";
import SiteHeader from "../components/SiteHeader";

const travelStyles = {
  FOOT: { label: "Foot", color: "#16a34a", icon: "🚶" },
  BIKE: { label: "Bike", color: "#22c55e", icon: "🚲" },
  CAR: { label: "Car", color: "#2563eb", icon: "🚗" },
  TRAIN: { label: "Train", color: "#9333ea", icon: "🚆" },
  BUS: { label: "Bus", color: "#f59e0b", icon: "🚌" },
  PLANE: { label: "Plane", color: "#dc2626", icon: "✈️" },
  OTHER: { label: "Other", color: "#64748b", icon: "📍" },
};

export default function PublicJourneyPage() {
  const { username } = useParams();
  const cleanUsername = String(username || "").replace(/^@/, "").trim();

  const [me, setMe] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const [auth, waypointData] = await Promise.all([
          authMe().catch(() => null),
          apiFetch(`/public/blogs/${cleanUsername}/waypoints`),
        ]);

        if (ignore) return;

        setMe(auth || null);
        setWaypoints(Array.isArray(waypointData) ? waypointData : []);
      } catch (error) {
        if (!ignore) {
          setErr(error.message || "Could not load journey map.");
          setWaypoints([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    if (cleanUsername) load();

    return () => {
      ignore = true;
    };
  }, [cleanUsername]);

  const center = useMemo(() => {
    if (!waypoints.length) {
      return { lat: 53.3498, lng: -6.2603 };
    }

    return {
      lat: Number(waypoints[0].fromLat),
      lng: Number(waypoints[0].fromLng),
    };
  }, [waypoints]);

  return (
    <div className="app-shell bg-[linear-gradient(180deg,#f7fff7_0%,#f8fafc_28%,#ffffff_100%)]">
      <SiteHeader me={me} />

      <main className="page-section">
        <div className="page-wrap">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-lime-700">
                @{cleanUsername}
              </p>
              <h1 className="section-title">Journey Map</h1>
              <p className="mt-2 text-slate-600">
                Routes, places, and travel stages from this blog.
              </p>
            </div>

            <Link
              to={`/blog/${cleanUsername}`}
              className="btn-secondary border-lime-200 text-lime-800 hover:bg-lime-50"
            >
              ← Back to blog
            </Link>
          </div>

          {loading && (
            <div className="card border-lime-100 p-6">
              Loading journey map...
            </div>
          )}

          {!loading && err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          )}

          {!loading && !err && !apiKey && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              Missing VITE_GOOGLE_MAPS_API_KEY in frontend/.env.local
            </div>
          )}

          {!loading && !err && apiKey && (
            <>
              <section className="card overflow-hidden border-lime-100">
                <div className="h-[650px] bg-slate-100">
                  <APIProvider apiKey={apiKey}>
                    <Map
                      defaultCenter={center}
                      defaultZoom={5}
                      gestureHandling="greedy"
                      disableDefaultUI={false}
                      mapId="blog-journey-map"
                    >
                      {waypoints.map((wp) => {
                        const style =
                          travelStyles[wp.travelMode] || travelStyles.OTHER;

                        const from = {
                          lat: Number(wp.fromLat),
                          lng: Number(wp.fromLng),
                        };

                        const to = {
                          lat: Number(wp.toLat),
                          lng: Number(wp.toLng),
                        };

                        return (
                          <div key={wp.id}>
                            <Marker position={from} title={wp.fromName} />
                            <Marker position={to} title={wp.toName} />

                            <Polyline
                              path={[from, to]}
                              strokeColor={style.color}
                              strokeOpacity={0.9}
                              strokeWeight={5}
                            />
                          </div>
                        );
                      })}
                    </Map>
                  </APIProvider>
                </div>
              </section>

              <section className="mt-6 grid gap-4 md:grid-cols-2">
                {waypoints.length === 0 ? (
                  <div className="card border-lime-100 p-6">
                    No journey routes have been added yet.
                  </div>
                ) : (
                  waypoints.map((wp) => {
                    const style =
                      travelStyles[wp.travelMode] || travelStyles.OTHER;

                    return (
                      <article
                        key={wp.id}
                        className="rounded-2xl border border-lime-100 bg-white p-5 shadow-sm"
                      >
                        <h2 className="text-lg font-semibold text-slate-950">
                          {style.icon} {wp.title || `${wp.fromName} → ${wp.toName}`}
                        </h2>

                        <p className="mt-2 text-sm text-slate-600">
                          {wp.fromName} → {wp.toName}
                        </p>

                        <p className="mt-2 text-sm text-slate-500">
                          {style.label} · {wp.travelGroup}
                          {wp.startedAt
                            ? ` · ${new Date(wp.startedAt).toLocaleDateString()}`
                            : ""}
                        </p>

                        {wp.notes && (
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {wp.notes}
                          </p>
                        )}
                      </article>
                    );
                  })
                )}
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}