"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ratingText = {
  1: "Very Bad",
  2: "Bad",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

export default function OtherRatingPage() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    if (!rating) return;

    setLoading(true);
    try {
      
      const res = await fetch("/api/ratings/other", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          userId,
          driverId,
          stars: rating,
          review: feedback, 
        }),
      });

      if (!res.ok) throw new Error("Failed to save feedback");

      setShowMessage(true); // show confirmation modal
    } catch (err) {
      console.error(err);
      alert("Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Full-screen Map */}
      <div className="fixed inset-0 z-0">
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.openstreetmap.org/export/embed.html?bbox=88.0,20.5,92.7,26.6&layer=mapnik&marker=23.6850,90.3563"
          style={{ border: 0 }}
        />
      </div>

      {/* Rating Modal */}
      {!showMessage && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={() => window.history.back()}
              className="absolute top-4 right-4 text-xl text-gray-400"
            >
              ×
            </button>

            <h2 className="text-xl font-semibold text-center text-black mb-4">
              Rating
            </h2>

            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <img
                src="/driver image.jpg"
                alt="Driver"
                className="w-16 h-16 rounded-full"
              />
            </div>

            {/* Stars */}
            <div className="flex justify-center space-x-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                >
                  <span
                    className={`text-2xl ${
                      star <= (hover || rating) ? "text-rose-600" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                </button>
              ))}
            </div>
            <div className="text-sm font-medium text-center text-black mb-4">
              {ratingText[rating]}
            </div>

            {/* Feedback Input */}
            <div className="flex flex-col space-y-3">
              <input
                type="text"
                placeholder="Add Your Feedback…"
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-500 text-black"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-rose-600 text-white py-2 rounded hover:bg-rose-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Share My Feedback"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Message */}
      {showMessage && (
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 relative text-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="absolute top-2 right-2 text-xl text-gray-400"
            >
              ×
            </button>
            <p className="text-black text-lg font-medium">
              Thanks for your feedback. Stay with us.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
