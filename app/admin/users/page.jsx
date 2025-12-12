"use client";

import { useEffect, useState } from "react";

export default function UsersAdminPage() {
  const [users, setUsers] = useState([]);

  // Fetch all users from API
  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // Block user
  async function blockUser(id) {
    await fetch(`/api/admin/users/${id}/block`, {
      method: "PATCH",
    });
    loadUsers();
  }

  // Unblock user
  async function unblockUser(id) {
    await fetch(`/api/admin/users/${id}/unblock`, {
      method: "PATCH",
    });
    loadUsers();
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-6">User Management</h1>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300 rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border">ID</th>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Email</th>
              <th className="p-3 border">Role</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="p-3 border">{user.id}</td>
                <td className="p-3 border">{user.name}</td>
                <td className="p-3 border">{user.email}</td>
                <td className="p-3 border">{user.role}</td>

                <td className="p-3 border">
                  {user.blocked ? (
                    <span className="text-red-600 font-semibold">Blocked</span>
                  ) : (
                    <span className="text-green-600 font-semibold">Active</span>
                  )}
                </td>

                <td className="p-3 border">
                  {user.blocked ? (
                    <button
                      onClick={() => unblockUser(user.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded"
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      onClick={() => blockUser(user.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded"
                    >
                      Block
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
