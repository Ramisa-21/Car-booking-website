"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MapPicker from "../../../components/MapPicker";

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

export default function ManualLocationPage() {
  const router = useRouter();
  const [location, setLocation] = useState({ coords: null, address: "" });
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check auth
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(storedUser);
    if (parsed.role !== "DRIVER") {
      router.push("/dashboard");
      return;
    }
    setUser(parsed);

    // Load current driver location
    loadCurrentLocation(parsed.id);
  }, [router]);

  const loadCurrentLocation = async (userId) => {
    try {
      const res = await fetch(`/api/driver/location?userId=${userId}`);
      const data = await res.json();
      if (data.location) {
        setLocation({
          coords: { lat: data.location.lat, lng: data.location.lng },
          address: data.location.address || await getAddress(data.location.lat, data.location.lng),
        });
      }
    } catch (err) {
      console.error("Load location error:", err);
    }
  };

  const fetchSuggestions = async (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const bbox = "90.2750,23.6345,90.5340,23.9336"; // Dhaka bounds
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&bbox=${bbox}&limit=5`
      );
      const data = await res.json();

      const suggestions = data.features.map((f) => ({
        label: f.properties.name
          ? `${f.properties.name}, ${f.properties.city || ""}`.trim()
          : f.properties.city || f.properties.country || "Unknown",
        coords: {
          lat: f.geometry.coordinates[1],
          lng: f.geometry.coordinates[0],
        },
      }));

      setSuggestions(suggestions);
    } catch (err) {
      console.error("Autocomplete error:", err);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setLocation({ coords: suggestion.coords, address: suggestion.label });
    setSuggestions([]);
  };

  const handleMapChange = async (coords) => {
    if (!coords) {
      setLocation({ coords: null, address: "" });
      return;
    }
    const address = await getAddress(coords.lat, coords.lng);
    setLocation({ coords, address });
  };

  const handleSaveLocation = async () => {
    if (!location.coords) {
      setError("Please select your location on the map or search for an address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      
      console.log("Saving location:", location);
      console.log("Token present:", !!token);

      if (!token) {
        setError("Authentication token missing. Please login again.");
        router.push("/login");
        return;
      }

      const res = await fetch("/api/driver/location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lat: location.coords.lat,
          lng: location.coords.lng,
          address: location.address,
          isOnline: true, // Automatically set online when manually setting location
        }),
      });

      const data = await res.json();
      console.log("API Response:", data);

      if (res.ok) {
        alert("✅ Location updated and you are now ONLINE!");
        router.push("/driver/dashboard");
      } else {
        setError(data.message || "Failed to update location. Please try again.");
        console.error("API Error:", data);
      }
    } catch (err) {
      console.error("Save location error:", err);
      setError(`Error: ${err.message}. Check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/driver/dashboard")}
            className="text-black hover:text-gray-700 text-3xl font-bold"
          >
            &lt;
          </button>
          <h1 className="text-3xl font-bold text-black">Set Your Location Manually</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Form */}
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💡 <strong>Tip:</strong> Use this if auto GPS isn't working or you want to set a specific location. 
                You'll automatically go ONLINE when you save.
              </p>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-300 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  ⚠️ <strong>Error:</strong> {error}
                </p>
              </div>
            )}

            {/* Location Input */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Location
              </label>
              <input
                type="text"
                value={location.address}
                onChange={(e) => {
                  setLocation({ ...location, address: e.target.value });
                  fetchSuggestions(e.target.value);
                }}
                placeholder="Search or select on map"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-black"
              />
              {suggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-lg max-h-60 overflow-y-auto">
                  {suggestions.map((s, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-black"
                      onClick={() => handleSelectSuggestion(s)}
                    >
                      {s.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Coordinates Display */}
            {location.coords && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Latitude:</strong> {location.coords.lat.toFixed(6)}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Longitude:</strong> {location.coords.lng.toFixed(6)}
                </p>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSaveLocation}
              disabled={loading || !location.coords}
              className="w-full bg-[#c03955] hover:bg-[#a52d46] text-white font-semibold px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Location & Go Online"}
            </button>

            {/* Debug Info (only in development) */}
            {process.env.NODE_ENV === 'development' && location.coords && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-xs">
                <p><strong>Debug Info:</strong></p>
                <p>User ID: {user.id}</p>
                <p>Role: {user.role}</p>
                <p>Coords: {JSON.stringify(location.coords)}</p>
              </div>
            )}
          </div>

          {/* RIGHT: Map */}
          <div className="lg:flex justify-center">
            <MapPicker
              pickup={location.coords}
              dropoff={null}
              setPickup={handleMapChange}
              setDropoff={() => {}}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
