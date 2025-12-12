<<<<<<< HEAD
=======

>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD

export default function DashboardPage() {
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [user, setUser] = useState(null); // logged-in user
  const [loading, setLoading] = useState(true); // while checking auth

  // ✅ Protect page: redirect to /login if no user
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");

=======
import MapPicker from "../../components/MapPicker";

// Reverse geocoding via Next.js API route
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

export default function DashboardPage() {
  const router = useRouter();
  const [pickup, setPickup] = useState({ coords: null, address: "" });
  const [dropoff, setDropoff] = useState({ coords: null, address: "" });
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth protection
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
      if (!storedUser) {
        router.push("/login");
        return;
      }
<<<<<<< HEAD

      const parsed = JSON.parse(storedUser);

      // If this is a DRIVER account, send to driver dashboard instead
=======
      const parsed = JSON.parse(storedUser);
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
      if (parsed.role === "DRIVER") {
        router.push("/driver/dashboard");
        return;
      }
<<<<<<< HEAD

=======
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
      setUser(parsed);
    } catch (e) {
      console.error("Failed to read authUser", e);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    router.push("/login");
  };

<<<<<<< HEAD
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!pickup || !dropoff) {
      alert("Please fill both fields.");
      return;
    }

=======
  // Update pickup/dropoff with coordinates → fetch address
  const handlePickupChangeFromMap = async (coords) => {
    if (!coords) {
      setPickup({ coords: null, address: "" });
      return;
    }
    const address = await getAddress(coords.lat, coords.lng);
    setPickup({ coords, address });
  };

  const handleDropoffChangeFromMap = async (coords) => {
    if (!coords) {
      setDropoff({ coords: null, address: "" });
      return;
    }
    const address = await getAddress(coords.lat, coords.lng);
    setDropoff({ coords, address });
  };

  const fetchSuggestions = async (query, type) => {
  if (!query) {
    type === "pickup" ? setPickupSuggestions([]) : setDropoffSuggestions([]);
    return;
  }
  try {
    // Bounding box for Dhaka: [minLon, minLat, maxLon, maxLat]
    const bbox = "90.2750,23.6345,90.5340,23.9336";
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

    type === "pickup" ? setPickupSuggestions(suggestions) : setDropoffSuggestions(suggestions);
  } catch (err) {
    console.error("Autocomplete error:", err);
  }
};


  const handleSelectSuggestion = (suggestion, type) => {
    if (type === "pickup") {
      setPickup({ coords: suggestion.coords, address: suggestion.label });
      setPickupSuggestions([]);
    } else {
      setDropoff({ coords: suggestion.coords, address: suggestion.label });
      setDropoffSuggestions([]);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pickup.address || !dropoff.address) {
      alert("Please select both pickup and dropoff locations.");
      return;
    }
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
    try {
      await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
<<<<<<< HEAD
        body: JSON.stringify({ pickup, dropoff }),
=======
        body: JSON.stringify({ pickup: pickup.coords, dropoff: dropoff.coords }),
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
      });
    } catch (err) {
      console.error("Search error:", err);
    }
<<<<<<< HEAD

    router.push(`/search-results?pickup=${pickup}&dropoff=${dropoff}`);
=======
    router.push(
      `/search-results?pickup=${encodeURIComponent(
        pickup.address
      )}&dropoff=${encodeURIComponent(dropoff.address)}`
    );
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-600">Loading dashboard...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
<<<<<<< HEAD
      {/* ---------------------- NAVBAR ----------------------- */}
      <nav className="w-full bg-[#C1D2D2] px-6 md:px-12 py-4 flex items-center justify-between">
        {/* Logo */}
=======
      {/* NAVBAR */}
      <nav className="w-full bg-[#C1D2D2] px-6 md:px-12 py-4 flex items-center justify-between">
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
        <div
          className="text-2xl font-bold text-black cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          RideMate
        </div>
<<<<<<< HEAD

        {/* Menu */}
=======
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
        <div className="hidden md:flex items-center gap-8 text-black font-medium">
          <button className="text-pink-600">Ride</button>
          <button>Contact Us</button>
          <button>Help</button>
        </div>
<<<<<<< HEAD

        {/* Right side items */}
        <div className="flex items-center gap-4">
          {/* Language */}
          <div className="hidden sm:flex items-center gap-1 text-gray-700 text-sm">
            🌐 <span>EN</span>
          </div>

          {/* User info (clickable → profile) */}
=======
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 text-gray-700 text-sm">
            🌐 <span>EN</span>
          </div>
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
          {user && (
            <button
              onClick={() => router.push("/profile")}
              className="flex flex-col items-end text-xs sm:text-sm mr-1 text-left"
            >
              <span className="font-semibold">{user.name}</span>
              <span className="uppercase text-gray-700">{user.role}</span>
            </button>
          )}
<<<<<<< HEAD

          {/* Profile picture placeholder */}
=======
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
          <img
            src="/cat-pp.jpg"
            className="w-10 h-10 rounded-full border object-cover"
            alt="Profile"
          />
<<<<<<< HEAD

          {/* Logout */}
=======
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
          <button
            onClick={handleLogout}
            className="hidden sm:inline-block text-xs md:text-sm px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

<<<<<<< HEAD
      {/* ---------------------- MAIN SECTION ----------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 md:px-20 py-12 md:py-16 items-center">
        {/* LEFT SIDE PANEL */}
        <div className="flex flex-col justify-center">
          {/* Heading */}
=======
      {/* MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 md:px-20 py-12 md:py-16 items-center">
        {/* LEFT PANEL */}
        <div className="flex flex-col justify-center">
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 md:mb-8 text-black">
            Go Anywhere With <br />
            <span className="font-extrabold text-[#c03955]">RideMate</span>
          </h1>
<<<<<<< HEAD

=======
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
          {user && (
            <p className="mb-4 text-sm text-gray-700">
              Welcome back, <span className="font-semibold">{user.name}</span>!
              {user.role === "DRIVER"
                ? " Ready to accept new rides?"
                : " Where would you like to go today?"}
            </p>
          )}
<<<<<<< HEAD

          {/* Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Pickup */}
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3">
              <span className="text-black text-xl">⚫</span>
              <input
                type="text"
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Pickup Location"
                className="w-full bg-transparent outline-none text-black"
            />
                className="w-full bg-transparent outline-none text-sm"
              /
            </div>

            {/* Dropoff */}
            <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3">
              <span className="text-black text-xl">⬛</span>
              <input
                type="text"
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Dropoff Location"
                className="w-full bg-transparent outline-none text-black"
            />
                className="w-full bg-transparent outline-none text-sm"
              /
=======
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Pickup */}
            <div className="relative">
              <input
                type="text"
                value={pickup.address}
                onChange={(e) => {
                  setPickup({ ...pickup, address: e.target.value });
                  fetchSuggestions(e.target.value, "pickup");
                }}
                placeholder="Pickup Location"
                className="w-full bg-transparent outline-none text-black border border-gray-300 rounded-xl px-4 py-3"
              />
              {pickupSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-lg z-50 text-black max-h-60 overflow-y-auto">
                  {pickupSuggestions.map((s, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectSuggestion(s, "pickup")}
                    >
                      {s.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Dropoff */}
            <div className="relative">
              <input
                type="text"
                value={dropoff.address}
                onChange={(e) => {
                  setDropoff({ ...dropoff, address: e.target.value });
                  fetchSuggestions(e.target.value, "dropoff");
                }}
                placeholder="Dropoff Location"
                className="w-full bg-transparent outline-none text-black border border-gray-300 rounded-xl px-4 py-3"
              />
              {dropoffSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-lg z-50 text-black max-h-60 overflow-y-auto">
                  {dropoffSuggestions.map((s, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectSuggestion(s, "dropoff")}
                    >
                      {s.label}
                    </li>
                  ))}
                </ul>
              )}
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
<<<<<<< HEAD
              {/* Later button */}
=======
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
              <button
                type="button"
                onClick={() => router.push("/schedule-ride")}
                className="flex items-center justify-center gap-2 px-5 py-3 border rounded-xl text-gray-700 text-sm"
              >
                📅 Later?
              </button>

<<<<<<< HEAD
              {/* Search button */}
=======
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
              <button
                type="submit"
                className="flex-1 bg-[#c03955] hover:bg-[#a52d46] text-white font-semibold px-6 py-3 rounded-xl text-sm"
              >
                Search Your Ride
              </button>
            </div>
          </form>
        </div>

<<<<<<< HEAD
        {/* RIGHT SIDE MAP */}
        <div className="hidden lg:flex justify-center">
          <img
            src="/map.png"
            alt="Map"
            className="shadow-lg mt-10 max-h-[420px]"
          />

          
=======
        {/* MAP */}
        <div className="hidden lg:flex justify-center w-full">
          <MapPicker
            pickup={pickup.coords}
            dropoff={dropoff.coords}
            setPickup={handlePickupChangeFromMap}
            setDropoff={handleDropoffChangeFromMap}
          />
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
        </div>
      </div>
    </main>
  );
}
