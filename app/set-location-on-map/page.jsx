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

export default function SetLocationPage() {
  const router = useRouter();
  const [pickup, setPickup] = useState({ coords: null, address: "" });
  const [dropoff, setDropoff] = useState({ coords: null, address: "" });

  useEffect(() => {
    // Load previously stored temporary locations if any
    const storedPickup = localStorage.getItem("scheduledPickup");
    const storedDropoff = localStorage.getItem("scheduledDropoff");
    const storedPickupCoords = localStorage.getItem("scheduledPickupCoords");
    const storedDropoffCoords = localStorage.getItem("scheduledDropoffCoords");

    if (storedPickup && storedPickupCoords) {
      setPickup({
        address: JSON.parse(storedPickup),
        coords: JSON.parse(storedPickupCoords),
      });
    }
    if (storedDropoff && storedDropoffCoords) {
      setDropoff({
        address: JSON.parse(storedDropoff),
        coords: JSON.parse(storedDropoffCoords),
      });
    }
  }, []);

  const handleConfirm = () => {
    if (!pickup.coords || !dropoff.coords) {
      alert("Please pick both pickup and dropoff locations.");
      return;
    }

    // Save temporary selections for schedule-ride page
    localStorage.setItem("scheduledPickup", JSON.stringify(pickup.address));
    localStorage.setItem("scheduledDropoff", JSON.stringify(dropoff.address));
    localStorage.setItem("scheduledPickupCoords", JSON.stringify(pickup.coords));
    localStorage.setItem("scheduledDropoffCoords", JSON.stringify(dropoff.coords));

    router.push("/schedule-ride"); // go back to schedule-ride page
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-white px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-black">Pick Locations on Map</h1>

      <div className="w-full max-w-4xl">
        <MapPicker
          pickup={pickup.coords}
          dropoff={dropoff.coords}
          setPickup={async (coords) => {
            const address = await getAddress(coords.lat, coords.lng);
            setPickup({ coords, address });
          }}
          setDropoff={async (coords) => {
            const address = await getAddress(coords.lat, coords.lng);
            setDropoff({ coords, address });
          }}
        />
      </div>

      <button
        onClick={handleConfirm}
        className="mt-6 bg-[#c03955] hover:bg-[#a52d46] text-white font-semibold px-6 py-3 rounded-xl"
      >
        Confirm Locations
      </button>
    </main>
  );
}
