import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch, authMe } from "../lib/api";
import SiteHeader from "../components/SiteHeader";

const travelLabels = {
  FOOT: "🚶 Foot",
  BIKE: "🚲 Bike",
  CAR: "🚗 Car",
  TRAIN: "🚆 Train",
  BUS: "🚌 Bus",
  PLANE: "✈️ Plane",
  FERRY: "⛴️ Ferry",
  OTHER: "📍 Other",
};

export default function WaypointsPage() {
  const [me, setMe] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        const [auth, data] = await Promise.all([
          authMe().catch(() => null),
          apiFetch("/me/waypoints"),
        ]);

        if (ignore) return;

        setMe(auth || null);
        setWaypoints(Array.isArray(data?.waypoints) ? data.waypoints : []);
      } catch (error) {
        if (!ignore) {
          setErr(error.message || "Could not load waypoints.");
          setWaypoints([]);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="app-shell bg-[linear-gradient(180deg,#f7fff7_0%,#f8fafc_35%,#ffffff_100%)]">
      <SiteHeader me={me} />

      <main className="page-section">
        <div className="page-wrap">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-lime-700">
                Dashboard
              </p>
              <h1 className="section-title">Edit waypoints</h1>
              <p className="mt-2 text-slate-600">
                Click a route below to change it or delete it.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/dashboard" className="btn-secondary">
                ← Back to dashboard
              </Link>

              <Link
                  to={`/blog/${me?.user?.displayName || "stef5812"}/journey`}
                  className="btn-secondary"
                >
                  View map
                </Link>

              <Link to="/dashboard/waypoints/new" className="btn-primary">
                + Add waypoint
              </Link>
            </div>
          </div>

          {loading && (
            <div className="card border-lime-100 p-6">
              Loading waypoints...
            </div>
          )}

          {!loading && err && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
              {err}
            </div>
          )}

          {!loading && !err && waypoints.length === 0 && (
            <div className="card border-lime-100 p-6">
              No waypoints have been added yet.
            </div>
          )}

          {!loading && !err && waypoints.length > 0 && (
            <section className="grid gap-4">
              {waypoints.map((wp) => (
                <Link
                  key={wp.id}
                  to={`/dashboard/waypoints/${wp.id}/edit`}
                  className="rounded-2xl border border-lime-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-lime-300 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-950">
                        {wp.title || `${wp.fromName} → ${wp.toName}`}
                      </h2>

                      <p className="mt-2 text-sm text-slate-600">
                        {wp.fromName} → {wp.toName}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        {travelLabels[wp.travelMode] || travelLabels.OTHER}
                        {wp.travelGroup ? ` · ${wp.travelGroup}` : ""}
                        {wp.startedAt
                          ? ` · ${new Date(wp.startedAt).toLocaleDateString()}`
                          : ""}
                      </p>
                    </div>

                    <div className="text-right text-sm">
                      <span
                        className={`rounded-full px-3 py-1 ${
                          wp.bookingStatus === "NOT_BOOKED"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-lime-50 text-lime-700"
                        }`}
                      >
                        {wp.bookingStatus === "NOT_BOOKED"
                          ? "Not booked"
                          : "Booked"}
                      </span>

                      <p className="mt-3 text-lime-700">Edit →</p>
                    </div>
                  </div>

                  {wp.notes && (
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
                      {wp.notes}
                    </p>
                  )}
                </Link>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}