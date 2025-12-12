// app/booking/price-calculator/page.jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PriceCalculatorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    distanceKm: "",
    durationMin: "",
    vehicleType: "SEDAN",
    couponCode: "",
  });

  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const calculatePrice = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/booking/calculate-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distanceKm: parseFloat(form.distanceKm),
          durationMin: parseFloat(form.durationMin),
          vehicleType: form.vehicleType,
          couponCode: form.couponCode || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to calculate price");
        setPricing(null);
      } else {
        setPricing(data.pricing);
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Dynamic Pricing Calculator
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <form onSubmit={calculatePrice} className="space-y-6">
            {/* Distance */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Distance (km)
              </label>
              <input
                type="number"
                step="0.1"
                name="distanceKm"
                value={form.distanceKm}
                onChange={handleChange}
                required
                placeholder="e.g., 15.5"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                step="1"
                name="durationMin"
                value={form.durationMin}
                onChange={handleChange}
                required
                placeholder="e.g., 30"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                value={form.vehicleType}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="SEDAN">Sedan (Base: 50 BDT)</option>
                <option value="SUV">SUV (Base: 80 BDT)</option>
                <option value="BIKE">Bike (Base: 30 BDT)</option>
                <option value="MICRO">Micro (Base: 40 BDT)</option>
                <option value="MINIVAN">Minivan (Base: 100 BDT)</option>
              </select>
            </div>

            {/* Coupon Code */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Coupon Code (Optional)
              </label>
              <input
                type="text"
                name="couponCode"
                value={form.couponCode}
                onChange={handleChange}
                placeholder="e.g., SAVE20"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Calculate Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
            >
              {loading ? "Calculating..." : "Calculate Price"}
            </button>
          </form>

          {/* Pricing Breakdown */}
          {pricing && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Price Breakdown
              </h2>

              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Vehicle Type:</span>
                  <span className="font-semibold">{pricing.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Distance:</span>
                  <span className="font-semibold">{pricing.distanceKm} km</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">{pricing.durationMin} min</span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between text-sm">
                    <span>Base Fare:</span>
                    <span>{pricing.breakdown.baseFare} BDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Distance Fare:</span>
                    <span>{pricing.breakdown.distanceFare.toFixed(2)} BDT</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Time Fare:</span>
                    <span>{pricing.breakdown.timeFare.toFixed(2)} BDT</span>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between font-semibold">
                    <span>Subtotal:</span>
                    <span>{pricing.subtotal.toFixed(2)} BDT</span>
                  </div>

                  {pricing.coupon && (
                    <>
                      <div className="flex justify-between text-green-600 text-sm mt-2">
                        <span>Coupon ({pricing.coupon.code}) - {pricing.coupon.discountPercent}%:</span>
                        <span>-{pricing.coupon.discountAmount.toFixed(2)} BDT</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-2xl font-bold text-blue-600 mt-4">
                    <span>Total:</span>
                    <span>{pricing.finalPrice.toFixed(2)} BDT</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </button>
      </div>
    </main>
  );
}
