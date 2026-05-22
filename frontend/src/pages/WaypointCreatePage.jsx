// frontend/src/pages/WaypointCreatePage

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../lib/api";

export default function WaypointCreatePage() {
  const navigate = useNavigate();
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    title: "",
    fromName: "",
    fromLat: "",
    fromLng: "",
    toName: "",
    toLat: "",
    toLng: "",
    travelMode: "FOOT",
    customMode: "",
    travelGroup: "ALONE",
    startedAt: "",
    notes: "",
  });

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      await apiFetch("/me/waypoints", {
        method: "POST",
        body: JSON.stringify(form),
      });

      navigate("/dashboard/waypoints");
    } catch (error) {
      setErr(error.message || "Failed to save waypoint.");
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Add waypoint</h1>

      {err && <p className="mb-4 text-red-600">{err}</p>}

      <form onSubmit={handleSubmit} className="space-y-4 rounded border bg-white p-6">
        <input
          className="w-full rounded border p-2"
          placeholder="Title, e.g. Dublin to Paris"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />

        <input
          className="w-full rounded border p-2"
          placeholder="Starting point name"
          value={form.fromName}
          onChange={(e) => update("fromName", e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <input className="rounded border p-2" placeholder="Start latitude" value={form.fromLat} onChange={(e) => update("fromLat", e.target.value)} required />
          <input className="rounded border p-2" placeholder="Start longitude" value={form.fromLng} onChange={(e) => update("fromLng", e.target.value)} required />
        </div>

        <input
          className="w-full rounded border p-2"
          placeholder="Destination name"
          value={form.toName}
          onChange={(e) => update("toName", e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <input className="rounded border p-2" placeholder="Destination latitude" value={form.toLat} onChange={(e) => update("toLat", e.target.value)} required />
          <input className="rounded border p-2" placeholder="Destination longitude" value={form.toLng} onChange={(e) => update("toLng", e.target.value)} required />
        </div>

        <select
          className="w-full rounded border p-2"
          value={form.travelMode}
          onChange={(e) => update("travelMode", e.target.value)}
        >
          <option value="FOOT">Foot</option>
          <option value="BIKE">Bike</option>
          <option value="CAR">Car</option>
          <option value="TRAIN">Train</option>
          <option value="BUS">Bus</option>
          <option value="PLANE">Plane</option>
          <option value="FERRY">Ferry</option>
          <option value="OTHER">Other</option>
        </select>

        <select
          className="w-full rounded border p-2"
          value={form.bookingStatus}
          onChange={(e) => update("bookingStatus", e.target.value)}
        >
          <option value="BOOKED">Booked</option>
          <option value="NOT_BOOKED">Not booked yet</option>
        </select>        

        {form.travelMode === "OTHER" && (
          <input
            className="w-full rounded border p-2"
            placeholder="Custom travel type"
            value={form.customMode}
            onChange={(e) => update("customMode", e.target.value)}
          />
        )}

        <select
          className="w-full rounded border p-2"
          value={form.travelGroup}
          onChange={(e) => update("travelGroup", e.target.value)}
        >
          <option value="ALONE">Alone</option>
          <option value="FRIEND">Friend</option>
          <option value="PARTNER">Partner</option>
          <option value="GROUP">Group</option>
        </select>

        <input
          className="w-full rounded border p-2"
          type="date"
          value={form.startedAt}
          onChange={(e) => update("startedAt", e.target.value)}
        />

        <textarea
          className="w-full rounded border p-2"
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
        />

        <button className="rounded bg-black px-4 py-2 text-white">
          Save waypoint
        </button>
      </form>
    </main>
  );
}