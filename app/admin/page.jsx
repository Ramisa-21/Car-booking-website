"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  if (loading) return <p className="p-10">Loading admin dashboard…</p>;

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <p className="text-gray-600 mb-8">
        Welcome, <span className="font-semibold">{admin?.name}</span> 👋  
        <br />Choose a section to manage.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* USERS CARD */}
        <div
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => router.push("/admin/users")}
        >
          <h2 className="text-xl font-semibold mb-2">Manage Users</h2>
          <p className="text-gray-600">Block, unblock, or view all users.</p>
        </div>

        {/* DRIVERS CARD */}
        <div
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => router.push("/admin/drivers")}
        >
          <h2 className="text-xl font-semibold mb-2">Manage Drivers</h2>
          <p className="text-gray-600">Approve, reject, or block drivers.</p>
        </div>

        {/* COUPONS CARD */}
        <div
          className="bg-white p-6 rounded-lg shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => router.push("/admin/coupons")}
        >
          <h2 className="text-xl font-semibold mb-2">Manage Coupons</h2>
          <p className="text-gray-600">Create, delete, or activate coupons.</p>
        </div>

      </div>
    </main>
  );
}
