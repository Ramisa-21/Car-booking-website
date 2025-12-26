"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function BookingWaitingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pollIntervalRef = useRef(null);

  // Fetch booking status
  const fetchBookingStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/booking/status/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        setBooking(data.booking);
        setError("");

        // If ride is completed, redirect to rating page
        if (data.booking.status === "COMPLETED") {
          clearInterval(pollIntervalRef.current);
          router.push(`/ratings?bookingId=${bookingId}`);
        }
      } else {
        setError(data.message || "Failed to load booking");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Connection error. Retrying...");
    } finally {
      setLoading(false);
    }
  };

  // Start polling every 5 seconds
  useEffect(() => {
    if (!bookingId) {
      router.push("/dashboard");
      return;
    }

    // Initial fetch
    fetchBookingStatus();

    // Poll every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      fetchBookingStatus();
    }, 5000);

    // Cleanup on unmount
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [bookingId]);

  // Cancel booking
  const handleCancelBooking = async () => {
    if (!confirm("Are you sure you want to cancel this ride?")) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`/api/booking/cancel/${bookingId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert("Booking cancelled successfully");
        router.push("/dashboard");
      } else {
        alert("Failed to cancel booking");
      }
    } catch (err) {
      console.error("Cancel error:", err);
      alert("Failed to cancel booking");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              Booking #{booking.id}
            </h1>
            <span
              className={`px-4 py-2 rounded-full font-semibold text-sm ${
                booking.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : booking.status === "ACCEPTED"
                  ? "bg-blue-100 text-blue-800"
                  : booking.status === "ONGOING"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {booking.status}
            </span>
          </div>

          {/* Route Info */}
          <div className="space-y-3 border-t pt-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📍</span>
              <div>
                <p className="text-xs text-gray-500 font-semibold">PICKUP</p>
                <p className="text-gray-900 font-medium">
                  {booking.pickupLocation}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="text-xs text-gray-500 font-semibold">DROPOFF</p>
                <p className="text-gray-900 font-medium">
                  {booking.dropoffLocation}
                </p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="border-t mt-4 pt-4 flex justify-between items-center">
            <span className="text-gray-600">Total Fare</span>
            <span className="text-2xl font-bold text-green-600">
              {booking.price ? `${booking.price.toFixed(2)} BDT` : "N/A"}
            </span>
          </div>
        </div>

        {/* Status-based Content */}
        {booking.status === "PENDING" && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="animate-bounce inline-block text-6xl mb-4">
                🚗
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Finding a Driver...
              </h2>
              <p className="text-gray-600">
                We're searching for available drivers near you. This usually
                takes less than a minute.
              </p>
            </div>

            {/* Animated dots */}
            <div className="flex justify-center gap-2 mb-6">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse delay-75"></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse delay-150"></div>
            </div>

            <button
              onClick={handleCancelBooking}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Cancel Booking
            </button>
          </div>
        )}

        {booking.status === "ACCEPTED" && booking.driver && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Driver Found!
              </h2>
              <p className="text-gray-600">
                Your driver is on the way to pick you up
              </p>
            </div>

            {/* Driver Info */}
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-2xl">
                  👤
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {booking.driver.user.name}
                  </h3>
                  <p className="text-gray-600">
                    {booking.driver.vehicleModel || "Vehicle"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    {booking.driver.vehiclePlate || "N/A"}
                  </p>
                </div>
              </div>

              {/* Contact */}
              {booking.driver.user.phone && (
                <div className="border-t pt-4">
                  <a
                    href={`tel:${booking.driver.user.phone}`}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    📞 Call Driver
                  </a>
                </div>
              )}
            </div>

            {/* ETA (you can calculate this based on driver location) */}
            <div className="text-center text-gray-600">
              <p className="text-sm">Estimated arrival</p>
              <p className="text-3xl font-bold text-blue-600">5-10 min</p>
            </div>
          </div>
        )}

        {booking.status === "ONGOING" && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🚗💨</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Ride in Progress
            </h2>
            <p className="text-gray-600 mb-6">
              Enjoy your ride! You'll be at your destination soon.
            </p>
            <div className="animate-pulse text-green-600 font-semibold">
              En route to destination...
            </div>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 text-blue-600 hover:underline font-semibold"
        >
          ← Back to Dashboard
        </button>
      </div>
    </main>
  );
}
