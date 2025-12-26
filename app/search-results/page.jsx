// app/search-results/page.jsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const pickup = searchParams.get("pickup");
  const dropoff = searchParams.get("dropoff");

  const [selectedVehicle, setSelectedVehicle] = useState("SEDAN");
  const [couponCode, setCouponCode] = useState("");
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [error, setError] = useState("");

  // Auto-calculate price when vehicle type changes
  useEffect(() => {
    if (pickup && dropoff) {
      calculatePrice();
    }
  }, [selectedVehicle]);

  const calculatePrice = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/booking/calculate-route-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLocation: pickup,
          dropoffLocation: dropoff,
          vehicleType: selectedVehicle,
          couponCode: couponCode || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to calculate price");
        setPricing(null);
      } else {
        setPricing(data);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = () => {
    calculatePrice();
  };

const handleBookNow = async () => {
  try {
    // Get coordinates from sessionStorage
    const pickupCoords = JSON.parse(sessionStorage.getItem("pickupCoords") || "{}");
    const dropoffCoords = JSON.parse(sessionStorage.getItem("dropoffCoords") || "{}");

    if (!pickupCoords.lat || !pickupCoords.lng) {
      alert("Pickup coordinates missing. Please search again from dashboard.");
      router.push("/dashboard");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login to book a ride");
      router.push("/login");
      return;
    }

    const res = await fetch("/api/booking/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        pickupLocation: pickup,
        dropoffLocation: dropoff,
        pickupLat: pickupCoords.lat,
        pickupLng: pickupCoords.lng,
        dropoffLat: dropoffCoords.lat,
        dropoffLng: dropoffCoords.lng,
        distanceKm: pricing.route.distanceKm,
        durationMin: pricing.route.durationMin,
        price: pricing.pricing.finalPrice,
        vehicleType: selectedVehicle,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // Redirect to waiting page instead of dashboard
      router.push(`/booking/waiting?bookingId=${data.booking.id}`);
    } else {
      alert(`❌ ${data.message}`);
    }
  } catch (err) {
    console.error("Booking error:", err);
    alert("Failed to create booking. Please try again.");
  }
};

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          Search Results
        </h1>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Route Info */}
          <div className="mb-8 pb-6 border-b-2 border-gray-200">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">📍</span>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pickup</p>
                <p className="font-bold text-xl text-gray-900">{pickup}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-3xl">🎯</span>
              <div>
                <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Dropoff</p>
                <p className="font-bold text-xl text-gray-900">{dropoff}</p>
              </div>
            </div>
          </div>

          {/* Vehicle Selection */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-5 text-gray-900">Select Vehicle Type</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {["SEDAN", "SUV", "BIKE", "MICRO", "MINIVAN"].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedVehicle(type)}
                  className={`p-5 rounded-xl border-2 transition-all duration-200 ${
                    selectedVehicle === type
                      ? "border-blue-600 bg-blue-50 shadow-lg scale-105"
                      : "border-gray-300 hover:border-gray-400 hover:shadow-md"
                  }`}
                >
                  <div className="text-4xl mb-2">
                    {type === "BIKE" ? "🏍️" : type === "SUV" ? "🚙" : type === "MINIVAN" ? "🚐" : "🚗"}
                  </div>
                  <p className="font-bold text-sm text-gray-900">{type}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Coupon Code */}
          <div className="mb-8">
            <label className="block text-lg font-bold mb-3 text-gray-900">
              Have a Coupon Code? 🎟️
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter code (e.g., SAVE20)"
                className="flex-1 border-2 border-gray-300 rounded-lg px-5 py-3 text-gray-900 font-semibold focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none"
              />
              <button
                onClick={applyCoupon}
                disabled={loading || !couponCode}
                className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-100 border-2 border-red-400 text-red-800 font-semibold px-5 py-4 rounded-lg">
              ⚠️ {error}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <p className="text-gray-700 font-semibold text-lg">Calculating price with OpenRouteService...</p>
            </div>
          )}

          {/* Pricing Breakdown */}
          {pricing && !loading && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border-2 border-blue-200">
              <h2 className="text-3xl font-bold mb-6 text-gray-900">💰 Price Breakdown</h2>

              <div className="space-y-3 mb-6 bg-white rounded-lg p-5">
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-700">Distance:</span>
                  <span className="font-bold text-gray-900">{pricing.route.distanceKm} km</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-700">Duration:</span>
                  <span className="font-bold text-gray-900">{pricing.route.durationMin} min</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-gray-700">Vehicle:</span>
                  <span className="font-bold text-gray-900">{pricing.pricing.vehicleType}</span>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 pt-5 space-y-3 bg-white rounded-lg p-5">
                <div className="flex justify-between text-base">
                  <span className="text-gray-700 font-semibold">Base Fare:</span>
                  <span className="text-gray-900 font-bold">{pricing.pricing.breakdown.baseFare} BDT</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-700 font-semibold">Distance Fare:</span>
                  <span className="text-gray-900 font-bold">{pricing.pricing.breakdown.distanceFare.toFixed(2)} BDT</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-gray-700 font-semibold">Time Fare:</span>
                  <span className="text-gray-900 font-bold">{pricing.pricing.breakdown.timeFare.toFixed(2)} BDT</span>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 pt-5 mt-5">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-gray-900">Subtotal:</span>
                  <span className="text-gray-900">{pricing.pricing.subtotal.toFixed(2)} BDT</span>
                </div>

                {pricing.pricing.coupon && (
                  <div className="flex justify-between text-green-700 font-bold text-base mt-3 bg-green-100 px-4 py-2 rounded-lg">
                    <span>
                      🎉 Coupon ({pricing.pricing.coupon.code}) - {pricing.pricing.coupon.discountPercent}%:
                    </span>
                    <span>-{pricing.pricing.coupon.discountAmount.toFixed(2)} BDT</span>
                  </div>
                )}

                <div className="flex justify-between text-4xl font-black text-blue-700 mt-6 bg-blue-100 px-5 py-4 rounded-xl">
                  <span>TOTAL:</span>
                  <span>{pricing.pricing.finalPrice.toFixed(2)} BDT</span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                disabled={booking}
                className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl py-4 rounded-xl transition-all shadow-lg hover:shadow-2xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {booking ? "🔄 Sending to Nearby Drivers..." : "🚀 Book Now - Request Ride"}
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 text-blue-700 hover:text-blue-900 font-bold text-lg hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>
    </main>
  );
}
