// frontend/src/pages/waypointcreatepage.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiFetch, authMe } from "../lib/api";
import SiteHeader from "../components/SiteHeader";

const travelModes = ["FOOT", "BIKE", "CAR", "TRAIN", "BUS", "PLANE", "FERRY", "OTHER"];

const travelGroups = ["ALONE", "FRIEND", "PARTNER", "GROUP"];

const bookingStatuses = ["BOOKED", "NOT_BOOKED"];

const emptyForm = {
  title: "",
  fromName: "",
  fromLat: "",
  fromLng: "",
  toName: "",
  toLat: "",
  toLng: "",
  travelMode: "TRAIN",
  travelGroup: "ALONE",
  bookingStatus: "BOOKED",
  startedAt: "",
  notes: "",
};

export default function WaypointCreatePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [me, setMe] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setErr("");
        const auth = await authMe().catch(() => null);
        if (!ignore) setMe(auth || null);

        if (isEdit) {
          const data = await apiFetch(`/me/waypoints/${id}`);
          const wp = data?.waypoint;

          if (!ignore) {
            setForm({
              title: wp.title || "",
              fromName: wp.fromName || "",
              fromLat: wp.fromLat ?? "",
              fromLng: wp.fromLng ?? "",
              toName: wp.toName || "",
              toLat: wp.toLat ?? "",
              toLng: wp.toLng ?? "",
              travelMode: wp.travelMode || "TRAIN",
              travelGroup: wp.travelGroup || "ALONE",
              bookingStatus: wp.bookingStatus || "BOOKED",
              startedAt: wp.startedAt ? wp.startedAt.slice(0, 10) : "",
              notes: wp.notes || "",
            });
          }
        }
      } catch (error) {
        if (!ignore) setErr(error.message || "Could not load waypoint.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [id, isEdit]);

  function updateField(e) {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setErr("");

      const payload = {
        ...form,
        fromLat: Number(form.fromLat),
        fromLng: Number(form.fromLng),
        toLat: Number(form.toLat),
        toLng: Number(form.toLng),
        startedAt: form.startedAt || null,
      };

      await apiFetch(isEdit ? `/me/waypoints/${id}` : "/me/waypoints", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(payload),
      });

      navigate("/dashboard/waypoints");
    } catch (error) {
      setErr(error.message || "Could not save waypoint.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this waypoint?")) return;

    try {
      setSaving(true);
      setErr("");

      await apiFetch(`/me/waypoints/${id}`, {
        method: "DELETE",
      });

      navigate("/dashboard/waypoints");
    } catch (error) {
      setErr(error.message || "Could not delete waypoint.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-shell bg-[linear-gradient(180deg,#f7fff7_0%,#f8fafc_35%,#ffffff_100%)]">
      <SiteHeader me={me} />

      <main className="page-section">
        <div className="page-wrap max-w-3xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-lime-700">
                Dashboard
              </p>
              <h1 className="section-title">
                {isEdit ? "Edit waypoint" : "Add waypoint"}
              </h1>
            </div>

            <Link to="/dashboard/waypoints" className="btn-secondary">
              ← Back to waypoints
            </Link>
          </div>

          {loading && (
            <div className="card border-lime-100 p-6">Loading waypoint...</div>
          )}

          {!loading && (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-lime-100 bg-white p-6 shadow-sm"
            >
              {err && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
                  {err}
                </div>
              )}

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Title</span>
                <input
                  name="title"
                  value={form.title}
                  onChange={updateField}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder="Optional title"
                />
              </label>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">From name</span>
                  <input
                    name="fromName"
                    value={form.fromName}
                    onChange={updateField}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-slate-700">To name</span>
                  <input
                    name="toName"
                    value={form.toName}
                    onChange={updateField}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-4">
                <input name="fromLat" value={form.fromLat} onChange={updateField} required placeholder="From lat" className="rounded-xl border border-slate-200 px-3 py-2" />
                <input name="fromLng" value={form.fromLng} onChange={updateField} required placeholder="From lng" className="rounded-xl border border-slate-200 px-3 py-2" />
                <input name="toLat" value={form.toLat} onChange={updateField} required placeholder="To lat" className="rounded-xl border border-slate-200 px-3 py-2" />
                <input name="toLng" value={form.toLng} onChange={updateField} required placeholder="To lng" className="rounded-xl border border-slate-200 px-3 py-2" />
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <select name="travelMode" value={form.travelMode} onChange={updateField} className="rounded-xl border border-slate-200 px-3 py-2">
                  {travelModes.map((mode) => <option key={mode}>{mode}</option>)}
                </select>

                <select name="travelGroup" value={form.travelGroup} onChange={updateField} className="rounded-xl border border-slate-200 px-3 py-2">
                  {travelGroups.map((group) => <option key={group}>{group}</option>)}
                </select>

                <select name="bookingStatus" value={form.bookingStatus} onChange={updateField} className="rounded-xl border border-slate-200 px-3 py-2">
                  {bookingStatuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </div>

              <label className="mt-4 block">
                <span className="text-sm font-medium text-slate-700">Date</span>
                <input
                  type="date"
                  name="startedAt"
                  value={form.startedAt}
                  onChange={updateField}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>

              <label className="mt-4 block">
                <span className="text-sm font-medium text-slate-700">Notes</span>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={updateField}
                  rows={5}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </label>

              <div className="mt-6 flex flex-wrap justify-between gap-3">
                {isEdit ? (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={saving}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-700 hover:bg-red-100"
                  >
                    Delete
                  </button>
                ) : (
                  <span />
                )}

                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Saving..." : isEdit ? "Save changes" : "Add waypoint"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}