"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load current user from API using token in localStorage
  useEffect(() => {
    async function loadProfile() {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("/api/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load profile");
          if (res.status === 401) {
            router.push("/login");
          }
          return;
        }

        setUser(data.user);
        setName(data.user.name || "");
        setPhone(data.user.phone || "");
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setSaving(true);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        router.push("/login");
        return;
      }

      const body = {
        name,
        phone,
      };

      // only send password fields if user is changing password
      if (currentPassword && newPassword) {
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update profile");
      } else {
        setSuccessMsg("Profile updated successfully");
        setUser(data.user);

        // update localStorage user
        const storedUser = localStorage.getItem("authUser");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          parsed.name = data.user.name;
          parsed.phone = data.user.phone;
          localStorage.setItem("authUser", JSON.stringify(parsed));
        }

        // clear password fields
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm text-gray-700">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">My Profile</h1>
        <p className="text-xs text-gray-500 mb-4 uppercase">
          {user.role} ACCOUNT
        </p>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-3 text-sm text-green-700 bg-green-50 p-2 rounded">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Email (read-only)
            </label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
              value={user.email}
              readOnly
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone (optional)
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Password change (optional) */}
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">
              Change password (optional)
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Current password
                </label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                />
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  New password
                </label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2 text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Only required if changing password"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 border rounded text-sm"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full mt-3 bg-[#c03955] hover:bg-[#a52d46] text-white text-sm font-medium py-2.5 rounded-full transition disabled:opacity-60"
              >
            
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
