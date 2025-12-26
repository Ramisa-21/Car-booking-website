"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MapPicker from "../../components/MapPicker";

// Reverse geocoding helper
async function getAddress(lat, lng) {
  try {
    const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
    const data = await res.json();
    return data.address;
  } catch (err) {
    console.error("getAddress error:", err);
    return "Unknown Location";
  }
}

export default function SavedPlacesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [address, setAddress] = useState("");
  const [coords, setCoords] = useState(null);
  const [label, setLabel] = useState("Home");

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(storedUser);
    setUser(parsed);
    fetchSavedPlaces(parsed.id);
  }, [router]);

  const fetchSavedPlaces = async (userId) => {
    try {
      const res = await fetch("/api/saved-places", {
        headers: { Authorization: `Bearer ${userId}` },
      });
      const data = await res.json();
      setSavedPlaces(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const updateAddressFromCoords = async () => {
      if (coords) {
        const addr = await getAddress(coords.lat, coords.lng);
        setAddress(addr);
      }
    };
    updateAddressFromCoords();
  }, [coords]);

  const handleSave = async () => {
    if (!coords) {
      alert("Please select a location on the map.");
      return;
    }
    try {
      if (!user) return alert("User not found");

      const res = await fetch("/api/saved-places", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`,
        },
        body: JSON.stringify({
          label,
          address,
          coordsLat: coords.lat,
          coordsLng: coords.lng,
        }),
      });

      if (!res.ok) throw new Error("Failed to save location");

      fetchSavedPlaces(user.id);
      setAddress("");
      setCoords(null);
      setLabel("Home");
    } catch (err) {
      console.error(err);
      alert("Failed to save location.");
    }
  };

  const handleDelete = async (placeId) => {
    if (!confirm("Are you sure you want to delete this saved place?")) return;

    try {
      const res = await fetch(`/api/saved-places?id=${placeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${user.id}` },
      });

      if (!res.ok) throw new Error("Failed to delete");

      setSavedPlaces(savedPlaces.filter((p) => p.id !== placeId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete place.");
    }
  };

  return (
    <main className="min-h-screen bg-white px-6 md:px-20 py-12">
      {/* Back button */}
      <button
        className="mb-6 px-4 py-2  text-black"
        onClick={() => router.push("/dashboard")}
      >
        ← Back
      </button>

      <h1 className="text-3xl text-black font-bold mb-6">Manage Saved Places</h1>

      {/* Form */}
      <div className="bg-gray-50 p-6 rounded-xl shadow mb-10">
        <div className="flex flex-col gap-4">
          <select
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl outline-none"
          >
            <option value="Home">Home</option>
            <option value="Office">Office</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="text"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 border rounded-xl outline-none"
          />

          <MapPicker pickup={coords} setPickup={setCoords} pickupOnly={true} />

          <button
            onClick={handleSave}
            className="bg-[#c03955] text-white px-6 py-3 rounded-xl hover:bg-[#a52d46]"
          >
            Save Place
          </button>
        </div>
      </div>

      {/* Saved Places List */}
      {savedPlaces.length > 0 && (
        <div>
          <h2 className="text-xl text-black font-semibold mb-4">Your Saved Places</h2>
          <ul className="flex flex-col gap-3">
            {savedPlaces.map((place) => (
              <li
                key={place.id}
                className="border p-4 rounded-xl flex justify-between items-center hover:bg-gray-100"
              >
                <div>
                  <span className="text-black font-semibold">{place.label}</span>
                  <p className="text-gray-600">{place.address}</p>
                </div>
                <button
                  className="text-red-600 hover:underline"
                  onClick={() => handleDelete(place.id)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}
