"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CouponAdminPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [coupons, setCoupons] = useState([]);
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiry, setExpiry] = useState("");

  // ⭐ AUTHENTICATION CHECK
  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");

    if (!storedUser) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(storedUser);

    if (parsed.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    setAdmin(parsed);
    setLoadingAuth(false);
  }, []);

  // ⭐ LOAD COUPONS
  async function loadCoupons() {
    const res = await fetch("/api/admin/coupons");
    const data = await res.json();
    setCoupons(data);
  }

  useEffect(() => {
    if (!loadingAuth) {
      loadCoupons();
    }
  }, [loadingAuth]);

  // ⭐ ADD NEW COUPON
  async function addCoupon(e) {
    e.preventDefault();

    await fetch("/api/admin/coupons", {
      method: "POST",
      body: JSON.stringify({ code, discount, expiry }),
    });

    setCode("");
    setDiscount("");
    setExpiry("");

    loadCoupons();
  }

  // ⭐ DELETE COUPON
  async function deleteCoupon(id) {
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    loadCoupons();
  }

  // ⭐ TOGGLE ACTIVE/INACTIVE
  async function toggleCoupon(id) {
    await fetch(`/api/admin/coupons/${id}/toggle`, { method: "PATCH" });
    loadCoupons();
  }

  if (loadingAuth) return <p className="p-10">Checking admin access…</p>;

  return (
    <div className="p-8">

      <h1 className="text-3xl font-semibold mb-6">Coupon Management</h1>

      {/* ADD FORM */}
      <form onSubmit={addCoupon} className="mb-8 p-6 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-4">Add New Coupon</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Coupon Code */}
          <input
            type="text"
            placeholder="Coupon Code"
            className="p-3 border rounded"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />

          {/* Discount */}
          <input
            type="number"
            placeholder="Discount (%)"
            className="p-3 border rounded"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            required
          />

          {/* Expiry Date */}
          <input
            type="date"
            className="p-3 border rounded"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded"
        >
          Add Coupon
        </button>
      </form>

      {/* COUPON TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full border rounded-md">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Code</th>
              <th className="p-3 border">Discount</th>
              <th className="p-3 border">Expiry</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="text-center">
                <td className="p-3 border">{coupon.id}</td>
                <td className="p-3 border">{coupon.code}</td>
                <td className="p-3 border">{coupon.discount}%</td>
                <td className="p-3 border">
                  {new Date(coupon.expiry).toLocaleDateString()}
                </td>

                <td className="p-3 border">
                  {coupon.active ? (
                    <span className="text-green-600 font-semibold">
                      Active
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="p-3 border space-x-2">
                  {/* Toggle active */}
                  <button
                    onClick={() => toggleCoupon(coupon.id)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded"
                  >
                    {coupon.active ? "Deactivate" : "Activate"}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteCoupon(coupon.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
