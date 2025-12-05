"use client";

import { useEffect, useState } from "react";

export default function ScheduledTripsPage() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => res.json())
      .then((data) => setTrips(data));
  }, []);

  const handleDelete = async (id) => {
    await fetch(`/api/scheduled-trips/${id}`, { method: "DELETE" });
    setTrips(trips.filter((trip) => trip.id !== id));
  };

  const handleEdit = async (trip) => {
    const newPickup = prompt("Edit Pickup Location:", trip.pickupLocation);
    const newDropoff = prompt("Edit Dropoff Location:", trip.dropoffLocation);
    if (newPickup && newDropoff) {
      await fetch(`/api/scheduled-trips/${trip.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLocation: newPickup,
          dropoffLocation: newDropoff,
        }),
      });
      setTrips(
        trips.map((t) =>
          t.id === trip.id
            ? { ...t, pickupLocation: newPickup, dropoffLocation: newDropoff }
            : t
        )
      );
    }
  };

  return (
    <main className="min-h-screen p-10 bg-white">
      <h1 className="text-3xl font-bold mb-6 text-black">Scheduled Trips</h1>

      {trips.length === 0 ? (
        <p className="text-black">No scheduled trips yet.</p>
      ) : (
        <ul className="space-y-4">
          {trips.map((trip) => (
            <li key={trip.id} className="border p-4 rounded-xl flex justify-between items-center">
              <div className="text-black">
                <p><strong>Pickup:</strong> {trip.pickupLocation}</p>
                <p><strong>Dropoff:</strong> {trip.dropoffLocation}</p>
                <p><strong>Time:</strong> {trip.customTime || trip.pickupTime}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(trip)}
                  className="px-4 py-2 bg-[#869B9B] text-white rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(trip.id)}
                  className="px-4 py-2 bg-[#b45575] text-white rounded-lg"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
