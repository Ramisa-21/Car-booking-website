"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ScheduledTripsPage() {
  const [trips, setTrips] = useState([]);
  const router = useRouter();

  //  Protect page
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchTrips = async () => {
      const res = await fetch("/api/schedule", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      const data = await res.json();
      setTrips(data.trips || [] );
    };

    fetchTrips();
  }, [router]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("authToken");
    await fetch(`/api/scheduled-trips/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    setTrips(trips.filter((trip) => trip.id !== id));
  };

  const handleEdit = async (trip) => {
    const newPickup = prompt("Edit Pickup Location:", trip.pickupLocation);
    const newDropoff = prompt("Edit Dropoff Location:", trip.dropoffLocation);
    if (!newPickup || !newDropoff) return;

    const token = localStorage.getItem("authToken");
    await fetch(`/api/scheduled-trips/${trip.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        pickupLocation: newPickup,
        dropoffLocation: newDropoff,
      }),
    });

    setTrips(trips.map(t =>
      t.id === trip.id ? { ...t, pickupLocation: newPickup, dropoffLocation: newDropoff } : t
    ));
  };

  return (
    <main className="min-h-screen p-10 bg-white text-black">
      {/* Back Button + Title */}
      <div className="flex items-center mb-6 gap-4">
        <button
          onClick={() => router.back()} // Goes to previous page
          className="text-black hover:text-gray-700 text-3xl font-bold"
        >
          &lt;
        </button>
        <h1 className="text-3xl font-bold">Scheduled Trips</h1>
      </div>

      {trips.length === 0 ? (
        <p>No scheduled trips yet.</p>
      ) : (
        <ul className="space-y-4">
          {trips.map((trip) => (
            <li key={trip.id} className="border p-4 rounded-xl flex justify-between items-center">
              <div>
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
