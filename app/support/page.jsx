"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SupportPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // 🔐 Auth check
  useEffect(() => {
    const stored = localStorage.getItem("authUser");
    if (!stored) {
      router.push("/login");
      return;
    }
    setUser(JSON.parse(stored));
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          userId: user.id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("✅ Your issue has been submitted. Our team will contact you soon.");
        setSubject("");
        setMessage("");
      } else {
        alert(data.error || "Failed to submit support request");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Contact Support</h1>

        <p className="text-sm text-gray-600 mb-6">
          Facing an issue with your ride or payment? Send us a message.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
            className="w-full border rounded px-4 py-2"
          />

          <textarea
            placeholder="Describe your issue..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className="w-full border rounded px-4 py-2"
          />

          {success && (
            <p className="text-green-600 text-sm">{success}</p>
          )}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => router.back()}
              className="text-sm text-gray-600"
            >
              ← Back
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#c03955] text-white px-6 py-2 rounded hover:bg-[#a52d46] disabled:opacity-60"
            >
              {loading ? "Sending..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
