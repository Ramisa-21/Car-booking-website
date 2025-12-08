"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const parsed = JSON.parse(storedUser);

      // If this is a DRIVER account, send to driver dashboard instead
      if (parsed.role === "DRIVER") {
        router.push("/driver/dashboard");
        return;
      }

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

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!pickup || !dropoff) {
      alert("Please fill both fields.");
      return;
    }

    try {
      await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup, dropoff }),
      });
    } catch (err) {
      console.error("Search error:", err);
    }

    router.push(`/search-results?pickup=${pickup}&dropoff=${dropoff}`);
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
      {/* ---------------------- NAVBAR ----------------------- */}
      <nav className="w-full bg-[#C1D2D2] px-6 md:px-12 py-4 flex items-center justify-between">
        {/* Logo */}
        <div
          className="text-2xl font-bold text-black cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          RideMate
        </div>

        {/* Menu */}
        <div className="hidden md:flex items-center gap-8 text-black font-medium">
          <button className="text-pink-600">Ride</button>
          <button>Contact Us</button>
          <button>Help</button>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-4">
          {/* Language */}
          <div className="hidden sm:flex items-center gap-1 text-gray-700 text-sm">
            🌐 <span>EN</span>
          </div>

          {/* User info (clickable → profile) */}
          {user && (
            <button
              onClick={() => router.push("/profile")}
              className="flex flex-col items-end text-xs sm:text-sm mr-1 text-left"
            >
              <span className="font-semibold">{user.name}</span>
              <span className="uppercase text-gray-700">{user.role}</span>
            </button>
          )}

          {/* Profile picture placeholder */}
          <img
            src="/cat-pp.jpg"
            className="w-10 h-10 rounded-full border object-cover"
            alt="Profile"
          />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden sm:inline-block text-xs md:text-sm px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* ---------------------- MAIN SECTION ----------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 md:px-20 py-12 md:py-16 items-center">
        {/* LEFT SIDE PANEL */}
        <div className="flex flex-col justify-center">
          {/* Heading */}
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 md:mb-8 text-black">
            Go Anywhere With <br />
            <span className="font-extrabold text-[#c03955]">RideMate</span>
          </h1>

          {user && (
            <p className="mb-4 text-sm text-gray-700">
              Welcome back, <span className="font-semibold">{user.name}</span>!
              {user.role === "DRIVER"
                ? " Ready to accept new rides?"
                : " Where would you like to go today?"}
            </p>
          )}

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
              />
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
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              {/* Later button */}
              <button
                type="button"
                onClick={() => router.push("/schedule-ride")}
                className="flex items-center justify-center gap-2 px-5 py-3 border rounded-xl text-gray-700 text-sm"
              >
                📅 Later?
              </button>

              {/* Search button */}
              <button
                type="submit"
                className="flex-1 bg-[#c03955] hover:bg-[#a52d46] text-white font-semibold px-6 py-3 rounded-xl text-sm"
              >
                Search Your Ride
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE MAP */}
        <div className="hidden lg:flex justify-center">
          <img
            src="/map.png"
            alt="Map"
            className="shadow-lg mt-10 max-h-[420px]"
          />

          
        </div>
      </div>
    </main>
  );
}
