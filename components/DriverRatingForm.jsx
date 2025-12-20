"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ratingComments = {
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

export default function DriverRatingForm({ bookingId, driverId, userId, avatar }) {
  const [stars, setStars] = useState(0);
  const [review, setReview] = useState("");
  const router = useRouter();

  const handleStarClick = (value) => {
    setStars(value);
  };

  const handleOtherClick = () => {
    router.push("/rating/other"); // New page for "Other"
  };

  const submitRating = async () => {
    if (!stars) return;

    try {
      const res = await fetch("/api/rating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, driverId, userId, stars, review }),
      });

      if (res.ok) {
        alert("Rating submitted successfully!");
        setStars(0);
        setReview("");
      } else {
        alert("Failed to submit rating");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting rating");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-auto">
      {/* Close button (optional) */}
      <div className="flex justify-end">
        <button className="text-gray-400 text-xl">✕</button>
      </div>

      {/* Title */}
      <h2 className="text-xl font-semibold text-center mb-4">Rating</h2>

      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <img
          src={avatar || "/default-avatar.png"}
          alt="Driver Avatar"
          className="w-16 h-16 rounded-full object-cover"
        />
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-1 mb-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            className={`text-2xl ${
              star <= stars ? "text-rose-600" : "text-gray-300"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      {/* Comment */}
      <p className="text-center font-medium text-gray-700 mb-4">
        {stars ? ratingComments[stars] : ""}
      </p>

      <hr className="border-gray-200 mb-4" />

      {/* Improvement Tags */}
      <p className="text-gray-500 mb-2 text-sm">What could be improved?</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {improvementTags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 border rounded-full text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Other button */}
      <div className="flex justify-center mb-4">
        <button
          className="bg-rose-600 text-white px-6 py-2 rounded-full"
          onClick={handleOtherClick}
        >
          Other
        </button>
      </div>

      {/* Optional submit button */}
      <div className="flex justify-center">
        <button
          onClick={submitRating}
          className="bg-blue-500 text-white px-6 py-2 rounded-full"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
