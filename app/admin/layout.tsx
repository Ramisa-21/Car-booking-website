"use client";

import { usePathname, useRouter } from "next/navigation";

const menu = [
  { name: "Dashboard", path: "/admin" },
  { name: "Users", path: "/admin/users" },
  { name: "Drivers", path: "/admin/drivers" },
  { name: "Coupons", path: "/admin/coupons" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authToken");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
        <h1 className="text-2xl font-bold text-[#c03955] mb-8">
          Ridemate Admin
        </h1>

        <nav className="flex-1 space-y-2">
          {menu.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition
                ${
                  pathname === item.path
                    ? "bg-[#c03955] text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
            >
              {item.name}
            </button>
          ))}
        </nav>

        <button
          onClick={logout}
          className="mt-6 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gray-800 hover:bg-black"
        >
          Logout
        </button>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}
