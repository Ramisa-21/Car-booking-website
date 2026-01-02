"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const ratingText = {
  1: "Very Bad",
  2: "Bad",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

const improvementTags = [
  "Professionalism",
  "Comfort",
  "Price",
  "Driving",
  "Driver navigation",
];

export default function RatingsPage() {
  const [stars, setStars] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const router = useRouter();

  // Get bookingId from query string
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("bookingId");
    if (id) setBookingId(Number(id));
  }, []);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async () => {
    if (!stars || !bookingId) {
      alert("Missing rating or booking info!");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId, // ✅ Must include
          stars,
          review: selectedTags.join(", "),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to submit rating");
      }

      router.push("/dashboard");
    } catch (error) {
      console.error(error);
      alert(`Failed to submit rating: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 z-0">
        <iframe
          className="absolute inset-0 w-full h-full"
          src="https://www.openstreetmap.org/export/embed.html?bbox=88.0,20.5,92.7,26.6&layer=mapnik&marker=23.6850,90.3563"
          style={{ border: 0 }}
        />
      </div>

      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl w-[380px] p-6 relative">
          <button
            onClick={() => router.push("/dashboard")}
            className="absolute top-4 left-4 text-xl text-gray-400"
          >
            ✕
          </button>

          <h2 className="text-center text-xl font-semibold mb-4 text-black">
            Rating
          </h2>

          <div className="flex justify-center mb-4">
            <img
              src="/driver image.jpg"
              className="w-16 h-16 rounded-full"
              alt="Driver"
            />
          </div>

          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onClick={() => setStars(s)}
                className={`text-2xl ${
                  s <= stars ? "text-rose-600" : "text-gray-300"
                }`}
              >
                ★
              </button>
            ))}
          </div>

          <p className="text-center font-medium text-gray-700 mb-4">
            {stars ? ratingText[stars] : ""}
          </p>

          <hr className="mb-4" />

          <p className="text-sm text-black mb-2">What could be improved?</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {improvementTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm border ${
                    active
                      ? "bg-rose-600 text-white border-rose-600"
                      : "border-gray-300 text-gray-700"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center mb-3">
            <button
              onClick={() => router.push(`/ratings/other?bookingId=${bookingId}`)}
              className="bg-rose-600 text-white px-6 py-2 rounded-full"
            >
              Other
            </button>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!stars || loading}
              className="bg-blue-500 text-white px-6 py-2 rounded-full disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
