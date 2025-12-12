"use client";

import { useEffect, useState } from "react";

export default function DriversAdminPage() {
  const [drivers, setDrivers] = useState([]);

  async function loadDrivers() {
    const res = await fetch("/api/admin/drivers");
    const data = await res.json();
    setDrivers(data);
  }

  useEffect(() => {
    loadDrivers();
  }, []);

  async function approveDriver(id) {
    await fetch(`/api/admin/drivers/${id}/approve`, { method: "PATCH" });
    loadDrivers();
  }

  async function rejectDriver(id) {
    await fetch(`/api/admin/drivers/${id}/reject`, { method: "PATCH" });
    loadDrivers();
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Driver Management</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">Driver ID</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">License</th>
              <th className="p-3 border">Approved</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} className="text-center">
                <td className="p-3 border">{d.id}</td>
                <td className="p-3 border">{d.user?.name}</td>
                <td className="p-3 border">{d.user?.email}</td>
                <td className="p-3 border">{d.licenseNo}</td>

                <td className="p-3 border">
                  {d.approved ? (
                    <span className="text-green-600 font-semibold">Yes</span>
                  ) : (
                    <span className="text-red-600 font-semibold">No</span>
                  )}
                </td>

                <td className="p-3 border space-x-2">
                  {!d.approved && (
                    <button
                      onClick={() => approveDriver(d.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      Approve
                    </button>
                  )}

                  {d.approved && (
                    <button
                      onClick={() => rejectDriver(d.id)}
                      className="px-4 py-2 bg-yellow-500 text-white rounded"
                    >
                      Reject
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
