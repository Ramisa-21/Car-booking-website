"use client";

import { useEffect, useState } from "react";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("authUser"))
      : null;

  // 🔄 Load notifications
  async function loadNotifications() {
    if (!user) return;
    const res = await fetch(`/api/notifications/${user.id}`);
    const data = await res.json();
    setNotifications(data);
  }

  // ⚡ Realtime SSE
  useEffect(() => {
    if (!user) return;

    loadNotifications();

    const es = new EventSource(
      `/api/notifications/stream?userId=${user.id}`
    );

    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setToast(data.message);
      loadNotifications();

      setTimeout(() => setToast(null), 4000);
    };

    return () => es.close();
  }, []);

  // 🔢 Unread count (CORRECT)
  const unreadCount = notifications.filter((n) => !n.seen).length;

  // ✅ Mark ALL as seen when bell opens
  async function markAllAsSeen() {
    if (!user) return;

    await fetch("/api/notifications/seen", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });

    loadNotifications();
  }

  // 🔔 Toggle bell (Uber-style behavior)
  async function toggleBell() {
    setOpen((prev) => {
      if (!prev && unreadCount > 0) {
        // user is opening the dropdown
        markAllAsSeen();
      }
      return !prev;
    });
  }

  // 👆 Mark single notification as read
  async function markAsRead(id) {
    await fetch(`/api/notifications/${id}/seen`, {
      method: "PATCH",
    });
    loadNotifications();
  }

  return (
    <div className="relative">
      {/* 🔔 Bell */}
      <button
        onClick={toggleBell}
        className="relative text-2xl"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs rounded-full px-1">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 📥 Dropdown */}
      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white border rounded shadow-lg z-50">
          <div className="p-3 font-semibold border-b">
            Notifications
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="p-4 text-sm text-gray-500">
                No notifications
              </p>
            )}

            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`p-3 text-sm cursor-pointer border-b ${
                  n.seen ? "bg-white" : "bg-gray-100"
                }`}
              >
                {n.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ⚡ Toast */}
      {toast && (
        <div className="fixed top-20 right-6 bg-black text-white px-4 py-2 rounded shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
