"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔔 Broadcast state
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState("");

  // ⭐ AUTH CHECK
  useEffect(() => {
    const stored = localStorage.getItem("authUser");

    if (!stored) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(stored);

    if (parsed.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    setAdmin(parsed);
    setLoading(false);
  }, [router]);

  // 📢 SEND BROADCAST (USERS)
  async function sendBroadcast() {
    if (!broadcastMsg.trim()) {
      setFeedback("Message cannot be empty");
      return;
    }

    setSending(true);
    setFeedback("");

    try {
      const res = await fetch("/api/admin/broadcast/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: broadcastMsg }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback(data.error || "Broadcast failed");
      } else {
        setFeedback(`✅ Broadcast sent to ${data.sentTo} users`);
        setBroadcastMsg("");
      }
    } catch (err) {
      console.error(err);
      setFeedback("Server error while sending broadcast");
    } finally {
      setSending(false);
    }
  }

  if (loading) return <p className="p-10">Loading admin dashboard…</p>;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <p className="text-gray-600 mb-8">
        Welcome, <span className="font-semibold">{admin?.name}</span> 👋
        <br />
        Choose a section to manage.
      </p>

      {/* 📢 BROADCAST TO USERS */}
      <div className="mb-10 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-3">
          📢 Broadcast to Users
        </h2>

        <textarea
          value={broadcastMsg}
          onChange={(e) => setBroadcastMsg(e.target.value)}
          placeholder="Write announcement for all users..."
          className="w-full border rounded p-3 text-sm min-h-[100px]"
        />

        {feedback && (
          <p className="mt-2 text-sm text-gray-700">{feedback}</p>
        )}

        <button
          onClick={sendBroadcast}
          disabled={sending}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {sending ? "Sending..." : "Send Broadcast"}
        </button>
      </div>

      {/* MANAGEMENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* USERS */}
        <div
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => router.push("/admin/users")}
        >
          <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
          <p className="text-gray-600">
            Block, unblock, or view all users.
          </p>
        </div>
      
      {/* SUPPORT CARD */}
      <div
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => router.push("/admin/support")}
      >
          <h2 className="text-xl font-semibold mb-2">Support Tickets</h2>
          <p className="text-gray-600">View & resolve user issues.</p>
      </div>


        {/* DRIVERS */}
        <div
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => router.push("/admin/drivers")}
        >
          <h2 className="text-xl font-semibold mb-2">Manage Drivers</h2>
          <p className="text-gray-600">
            Approve, reject, or block drivers.
          </p>
        </div>

        {/* COUPONS */}
        <div
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => router.push("/admin/coupons")}
        >
          <h2 className="text-xl font-semibold mb-2">Manage Coupons</h2>
          <p className="text-gray-600">
            Create, delete, or activate coupons.
          </p>
        </div>
      </div>
    </main>
  );
}
