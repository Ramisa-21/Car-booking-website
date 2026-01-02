"use client";

import { useEffect, useState } from "react";

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState([]);

  async function loadTickets() {
    const res = await fetch("/api/admin/support");
    const data = await res.json();
    setTickets(data);
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function resolveTicket(id) {
    await fetch(`/api/admin/support/${id}`, {
      method: "PATCH",
    });
    loadTickets();
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Support Tickets</h1>

      <div className="overflow-x-auto">
        <table className="w-full border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">User</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Subject</th>
              <th className="p-3 border">Message</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="text-center">
                <td className="p-3 border">{t.id}</td>
                <td className="p-3 border">{t.user?.name}</td>
                <td className="p-3 border">{t.user?.email}</td>
                <td className="p-3 border">{t.subject}</td>
                <td className="p-3 border text-left">{t.message}</td>

                <td className="p-3 border">
                  {t.status === "RESOLVED" ? (
                    <span className="text-green-600 font-semibold">
                      Resolved
                    </span>
                  ) : (
                    <span className="text-yellow-600 font-semibold">
                      Open
                    </span>
                  )}
                </td>

                <td className="p-3 border">
                  {t.status !== "RESOLVED" && (
                    <button
                      onClick={() => resolveTicket(t.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      Resolve
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tickets.length === 0 && (
          <p className="mt-4 text-gray-500">No support tickets found.</p>
        )}
      </div>
    </div>
  );
}
