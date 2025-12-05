"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScheduleRidePage() {
  const router = useRouter();

  const [pickupTime, setPickupTime] = useState("Pickup Now");
  const [customTime, setCustomTime] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");

  const handleTimeChange = (e) => {
    if (e.target.value === "Custom") {
      const time = prompt("Enter your preferred pickup time (e.g., 2025-12-06 14:00):");
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

    // Save choices to backend API
    await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pickupTime,
        customTime,
        pickupLocation,
        dropoffLocation,
      }),
    });

    // Redirect back to dashboard
    router.push("/dashboard");
  };

  return (
    <main className="min-h-screen flex bg-white px-20 py-16">
      
      {/* LEFT PANEL */}
      <div className="w-1/2 flex flex-col justify-start pt-6 px-20">
        {/* Heading with inline back button */}
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
    onChange={handleTimeChange}
    className="w-full bg-transparent outline-none text-black"
  >
    <option value="Pickup Now">Pickup Now</option>
    <option value="Custom">Set Custom Time</option>
  </select>
</div>
{customTime && (
  <p className="text-gray-600 ml-7 mt-2">Scheduled Time: {customTime}</p>
)}


{/* Pickup Location */}
<div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 mb-4">
  <span className="text-black text-xl">⚫</span>
  <input
    type="text"
    placeholder="Pickup Location"
    value={pickupLocation}
    onChange={(e) => setPickupLocation(e.target.value)}
    className="w-full bg-transparent outline-none text-black"
  />
</div>

{/* Dropoff Location */}
<div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 mb-6">
  <span className="text-black text-xl">⬛</span>
  <input
    type="text"
    placeholder="Dropoff Location"
    value={dropoffLocation}
    onChange={(e) => setDropoffLocation(e.target.value)}
    className="w-full bg-transparent outline-none text-black"
  />
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
            onClick={() => router.push("/search-in-different-city")}
          >
            <span>🌐</span> Search in a different city
          </div>
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
          {/* Scheduled Trips Option */}
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
          src="/5825edcf-3141-4f98-aeb6-f7f77764a353.png"
          alt="Trip Illustration"
          className="h-[600px] object-cover"
        />
      </div>
    </main>
  );
}
