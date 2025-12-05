"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!pickup || !dropoff) {
      alert("Please fill both fields.");
      return;
    }

    // Save to backend API (Prisma/MySQL)
    await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pickup, dropoff }),
    });

    router.push(`/search-results?pickup=${pickup}&dropoff=${dropoff}`);
  };

  return (
    <main className="min-h-screen bg-white">

      {/* ---------------------- NAVBAR ----------------------- */}
      <nav className="w-full bg-[#C1D2D2] px-12 py-5 flex items-center justify-between">
        
        {/* Logo */}
        <div className="text-2xl font-bold text-black">RideMate</div>


        {/* Menu */}
        <div className="flex items-center gap-10 text-black font-medium">
          <a href="#" className="text-pink-600">Ride</a>
          <a href="#">Contact Us</a>
          <a href="#">Help</a>
        </div>

        {/* Right side items */}
        <div className="flex items-center gap-5">
          
          {/* Language */}
          <div className="flex items-center gap-1 text-gray-700">
            🌐 <span>EN</span>
          </div>

          {/* Profile picture placeholder */}
          <img
            src="\cat-pp.jpg"
            className="w-10 h-10 rounded-full border"
            alt="Profile"
          />
        </div>
      </nav>


      {/* ---------------------- MAIN SECTION ----------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-20 py-16 items-center">

        {/* LEFT SIDE PANEL */}
        <div className="flex flex-col justify-center">

          {/* Heading */}
          <h1 className="text-5xl font-bold leading-tight mb-8 text-black">
            Go Anywhere With <br />
            <span className="font-extrabold">RideMate</span>
          </h1>

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
                className="w-full bg-transparent outline-none"
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
                className="w-full bg-transparent outline-none"
            />
            </div>
           

            {/* Buttons */}
            <div className="flex items-center gap-4 pt-3">

              {/* Later button */}
              <button
                type="button"
                onClick={() => router.push("/schedule-ride")}
                className="flex items-center gap-2 px-5 py-3 border rounded-xl text-gray-700"
              >
                📅 Later?
              </button>

              {/* Search button */}
              <button
                type="submit"
                className="flex-1 bg-[#c03955] hover:bg-[#a52d46] text-white font-semibold px-6 py-3 rounded-xl"
              >
                Search Your Ride
              </button>
            </div>

          </form>
        </div>


        {/* ---------------------- RIGHT SIDE MAP ----------------------- */}
        <div className="hidden lg:flex justify-center">
          <img
            src="/map.png"
            alt="Map"
            className=" shadow-lg mt-20"
          />

          {/* NOTE: This is only a placeholder.  
              When we add maps API later, we replace this image. */}
        </div>

      </div>
    </main>
  );
}
