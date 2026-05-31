// frontend/src/pages/PublicJourneyPage.jsx

import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  APIProvider,
  Map,
  Marker,
  Polyline,
  useMap,
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
  FERRY: { label: "Ferry", color: "#0891b2", icon: "⛴️" },
  OTHER: { label: "Other", color: "#64748b", icon: "📍" },
};

function FitMapToWaypoints({ waypoints }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !waypoints.length || !window.google?.maps) return;

    const bounds = new window.google.maps.LatLngBounds();
    let pointCount = 0;

    waypoints.forEach((wp) => {
      const fromLat = Number(wp.fromLat);
      const fromLng = Number(wp.fromLng);
      const toLat = Number(wp.toLat);
      const toLng = Number(wp.toLng);

      if (Number.isFinite(fromLat) && Number.isFinite(fromLng)) {
        bounds.extend({ lat: fromLat, lng: fromLng });
        pointCount += 1;
      }

      if (Number.isFinite(toLat) && Number.isFinite(toLng)) {
        bounds.extend({ lat: toLat, lng: toLng });
        pointCount += 1;
      }
    });

    if (pointCount === 0) return;

    if (pointCount === 1) {
      map.setCenter(bounds.getCenter());
      map.setZoom(8);
      return;
    }

    map.fitBounds(bounds, {
      top: 70,
      right: 70,
      bottom: 70,
      left: 70,
    });
  }, [map, waypoints]);

  return null;
}

export default function PublicJourneyPage() {
  const { username } = useParams();
  const cleanUsername = String(username || "").replace(/^@/, "").trim();

  const [me, setMe] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const MAP_ID = import.meta.env.VITE_GOOGLE_MAP_ID;

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
    <section className="card relative overflow-hidden border-lime-100">
      <div className="relative h-[650px] bg-slate-100">
      <div className="
          absolute right-4 top-4 z-20 max-w-xs
          rounded-xl
          bg-white/35
          backdrop-blur-sm
          px-4 py-3
          text-right
        ">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-lime-700">
            @{cleanUsername}
          </p>

          <h1 className="mt-1 text-2xl font-bold text-slate-950">
            Journey Map
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Routes, places, and travel stages from this blog.
          </p>

          <Link
            to={`/blog/${cleanUsername}`}
            className="mt-3 inline-flex text-sm font-semibold text-lime-800 hover:text-lime-950"
          >
            ← Back to blog
          </Link>
        </div>

        <APIProvider apiKey={apiKey}>
          <Map
            defaultCenter={center}
            defaultZoom={6}
            mapId={MAP_ID}
            gestureHandling="greedy"
            disableDefaultUI={false}
            zoomControl={true}
            fullscreenControl={true}
            mapTypeControl={false}
            streetViewControl={false}
          >
            <FitMapToWaypoints waypoints={waypoints} />

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

              const isFuture =
                wp.startedAt && new Date(wp.startedAt) > new Date();

              const isNotBooked = wp.bookingStatus === "NOT_BOOKED";

              return (
                <div key={wp.id}>
                  <Marker position={from} title={wp.fromName} />
                  <Marker position={to} title={wp.toName} />

                  <Polyline
                    path={[from, to]}
                    strokeColor={style.color}
                    strokeOpacity={isFuture ? 0 : 0.9}
                    strokeWeight={5}
                    icons={
                      isFuture
                        ? [
                            {
                              icon: {
                                path: "M 0,-1 0,1",
                                strokeOpacity: 1,
                                scale: isNotBooked ? 2 : 4,
                              },
                              offset: "0",
                              repeat: isNotBooked ? "10px" : "22px",
                            },
                          ]
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </Map>
        </APIProvider>
      </div>

      <div className="border-t border-lime-100 bg-white p-4">
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            Solid line = completed/current
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            Broken line = future booked
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
            Dotted line = future not booked
          </span>
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-cyan-800">
            ⛴️ Ferry supported
          </span>
        </div>
      </div>
    </section>

    <section className="mt-6 grid gap-4 md:grid-cols-2">
  {waypoints.length === 0 ? (
    <div className="card border-lime-100 p-6">
      No journey routes have been added yet.
    </div>
  ) : (
    [...waypoints]
      .sort(
        (a, b) =>
          new Date(b.startedAt || 0) -
          new Date(a.startedAt || 0)
      )
      .map((wp) => {
        const style =
          travelStyles[wp.travelMode] || travelStyles.OTHER;

        return (
          <article
            key={wp.id}
            className="rounded-2xl border border-lime-100 bg-white p-5 shadow-sm"
          >
            {/* card content */}
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