import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  APIProvider,
  Map,
  Marker,
  Polyline,
} from "@vis.gl/react-google-maps";
import { apiFetch } from "../lib/api";

const travelStyles = {
  FOOT: { label: "Foot", color: "#16a34a", icon: "🚶" },
  BIKE: { label: "Bike", color: "#22c55e", icon: "🚲" },
  CAR: { label: "Car", color: "#2563eb", icon: "🚗" },
  TRAIN: { label: "Train", color: "#9333ea", icon: "🚆" },
  BUS: { label: "Bus", color: "#f59e0b", icon: "🚌" },
  PLANE: { label: "Plane", color: "#dc2626", icon: "✈️" },
  OTHER: { label: "Other", color: "#64748b", icon: "📍" },
};

export default function WaypointsPage() {
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    async function loadWaypoints() {
      try {
        const data = await apiFetch("/me/waypoints");
        setWaypoints(data.waypoints || []);
      } catch (error) {
        setErr(error.message || "Failed to load waypoints.");
      } finally {
        setLoading(false);
      }
    }

    loadWaypoints();
  }, []);

  const center = useMemo(() => {
    if (!waypoints.length) {
      return { lat: 53.3498, lng: -6.2603 };
    }

    return {
      lat: Number(waypoints[0].fromLat),
      lng: Number(waypoints[0].fromLng),
    };
  }, [waypoints]);

  if (loading) return <p>Loading waypoints...</p>;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Journey Map</h1>
          <p className="text-sm text-slate-600">
            Manage the places and routes attached to your blog.
          </p>
        </div>

        <Link
          to="/dashboard/waypoints/new"
          className="rounded bg-black px-4 py-2 text-white"
        >
          Add waypoint
        </Link>
      </div>

      {err && <p className="mb-4 text-red-600">{err}</p>}

      {!apiKey && (
        <p className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">
          Missing VITE_GOOGLE_MAPS_API_KEY in frontend/.env
        </p>
      )}

      <div className="mb-6 h-[500px] overflow-hidden rounded-xl border bg-slate-100">
        {apiKey && (
          <APIProvider apiKey={apiKey}>
            <Map
              defaultCenter={center}
              defaultZoom={5}
              gestureHandling="greedy"
              disableDefaultUI={false}
              mapId="blog-journey-map"
            >
              {waypoints.map((wp) => {
                const style = travelStyles[wp.travelMode] || travelStyles.OTHER;

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
                      strokeWeight={4}
                    />
                  </div>
                );
              })}
            </Map>
          </APIProvider>
        )}
      </div>

      {waypoints.length === 0 ? (
        <div className="rounded border bg-white p-6">No waypoints yet.</div>
      ) : (
        <div className="space-y-3">
          {waypoints.map((wp) => {
            const style = travelStyles[wp.travelMode] || travelStyles.OTHER;

            return (
              <div key={wp.id} className="rounded border bg-white p-4">
                <h2 className="font-semibold">
                  {style.icon} {wp.title || `${wp.fromName} → ${wp.toName}`}
                </h2>

                <p className="text-sm text-slate-600">
                  {wp.fromName} → {wp.toName}
                </p>

                <p className="text-sm text-slate-600">
                  {style.label} · {wp.travelGroup}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}