"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScheduleRidePage() {
  const router = useRouter();

  const [pickupTime, setPickupTime] = useState("Pickup Now");
  const [customTime, setCustomTime] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);

  // Redirect if not logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const user = localStorage.getItem("authUser");

    if (!token || !user) {
      router.push("/login");
      return;
    }

    // Load previously selected locations
    const storedPickup = localStorage.getItem("scheduledPickup");
    const storedDropoff = localStorage.getItem("scheduledDropoff");

    if (storedPickup) setPickupLocation(JSON.parse(storedPickup));
    if (storedDropoff) setDropoffLocation(JSON.parse(storedDropoff));
  }, [router]);

  const fetchPhotonSuggestions = async (query, type) => {
    if (!query) {
      type === "pickup" ? setPickupSuggestions([]) : setDropoffSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lang=en`
      );
      const data = await res.json();

      const dhakaSuggestions = data.features
        .filter(
          (f) =>
            f.properties.city?.toLowerCase().includes("dhaka") ||
            f.properties.state?.toLowerCase().includes("dhaka") ||
            f.properties.country?.toLowerCase().includes("bangladesh")
        )
        .map((f) => f.properties.name)
        .filter(Boolean);

      if (type === "pickup") setPickupSuggestions(dhakaSuggestions);
      else setDropoffSuggestions(dhakaSuggestions);
    } catch (err) {
      console.error("Photon error:", err);
    }
  };

  const handleTimeChange = (e) => {
    if (e.target.value === "Custom") {
      const time = prompt(
        "Enter your preferred pickup time (e.g., 2025-12-06 14:00):"
      );
      if (time) setCustomTime(time);
      setPickupTime(time || "Pickup Now");
    } else {
      setPickupTime(e.target.value);
      setCustomTime("");
    }
  };

  const handleContinue = async () => {
    if (!pickupLocation || !dropoffLocation) {
      alert("Please fill both pickup and dropoff locations.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("You must be logged in to schedule a ride.");
      router.push("/login");
      return;
    }

    // Save selected locations temporarily
    localStorage.setItem("scheduledPickup", JSON.stringify(pickupLocation));
    localStorage.setItem("scheduledDropoff", JSON.stringify(dropoffLocation));

    await fetch("/api/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pickupTime,
        customTime,
        pickupLocation,
        dropoffLocation,
      }),
    });

    // Clear temporary storage after saving
    localStorage.removeItem("scheduledPickup");
    localStorage.removeItem("scheduledDropoff");
    localStorage.removeItem("scheduledPickupCoords");
    localStorage.removeItem("scheduledDropoffCoords");

    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex bg-white px-20 py-16">
      {/* LEFT PANEL */}
      <div className="w-1/2 flex flex-col justify-start pt-6 px-20">
        <h1 className="text-4xl font-bold mb-8 text-black flex items-center gap-2">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-black hover:text-gray-700 text-3xl font-bold tracking-wider"
          >
            &lt;
          </button>
          Plan Your Trip
        </h1>

        {/* Pickup Time */}
        <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 mb-4">
          <span className="text-black text-xl">🕓</span>
          <select
            value={pickupTime}
            onChange={(e) => setPickupTime(e.target.value)}
            className="w-full bg-transparent outline-none text-black"
          >
            <option value="Pickup Now">Pickup Now</option>
            <option value="Custom">Set Custom Time</option>
          </select>
        </div>

        {/* Show datetime picker if Custom is selected */}
        {pickupTime === "Custom" && (
          <input
            type="datetime-local"
            value={customTime}
            onChange={(e) => setCustomTime(e.target.value)}
            className="border px-2 py-1 rounded ml-7 mb-2"
          />
        )}


        {/* Pickup Location */}
        <div className="flex flex-col gap-0 border border-gray-300 rounded-xl px-4 py-3 mb-4 relative">
          <div className="flex items-center gap-3">
            <span className="text-black text-xl">⚫</span>
            <input
              type="text"
              placeholder="Pickup Location"
              value={pickupLocation}
              onChange={(e) => {
                setPickupLocation(e.target.value);
                fetchPhotonSuggestions(e.target.value, "pickup");
              }}
              className="w-full bg-transparent outline-none text-black"
            />
          </div>
          {pickupSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 z-10 max-h-48 overflow-y-auto text-black">
              {pickupSuggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setPickupLocation(s);
                    setPickupSuggestions([]);
                  }}
                  className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Dropoff Location */}
        <div className="flex flex-col gap-0 border border-gray-300 rounded-xl px-4 py-3 mb-6 relative">
          <div className="flex items-center gap-3">
            <span className="text-black text-xl">⬛</span>
            <input
              type="text"
              placeholder="Dropoff Location"
              value={dropoffLocation}
              onChange={(e) => {
                setDropoffLocation(e.target.value);
                fetchPhotonSuggestions(e.target.value, "dropoff");
              }}
              className="w-full bg-transparent outline-none text-black"
            />
          </div>
          {dropoffSuggestions.length > 0 && (
            <ul className="absolute top-full left-0 right-0 bg-white border border-gray-300 z-10 max-h-48 overflow-y-auto text-black">
              {dropoffSuggestions.map((s, i) => (
                <li
                  key={i}
                  onClick={() => {
                    setDropoffLocation(s);
                    setDropoffSuggestions([]);
                  }}
                  className="px-3 py-2 hover:bg-gray-200 cursor-pointer"
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="bg-[#b45575] text-white px-6 py-3 rounded-full w-full hover:bg-[#a04e68]"
        >
          Continue
        </button>

        {/* ---------------------- OPTIONS ----------------------- */}
        <div className="space-y-3 mt-4 text-black">
          
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-gray-600"
            onClick={() => router.push("/set-location-on-map")}
          >
            <span>📍</span> Set location on map
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-gray-600"
            onClick={() => router.push("/saved-places")}
          >
            <span>⭐</span> Saved places
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:text-gray-600"
            onClick={() => router.push("/scheduled-trips")}
          >
            <span>🗓️</span> Scheduled Trips
          </div>
        </div>
      </div>


      {/* RIGHT IMAGE */}
      <div className="w-1/2 flex items-center justify-center">
        <img
          src="\big-black-dog-car_23-2148199107.jpg"
          alt="Trip Illustration"
          className="h-[500px] object-cover"
        />
      </div>
    </main>
  );
}
