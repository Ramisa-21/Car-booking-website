"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
      } else {
        // store token + user
        if (data.token) {
          localStorage.setItem("authToken", data.token);
        }
        if (data.user) {
          localStorage.setItem("authUser", JSON.stringify(data.user));
        }

        // role-based redirect
        const role = data.user?.role;
        if (role === "DRIVER") {
          router.push("/driver/dashboard");
        } else if (role === "ADMIN") {
          router.push("/admin/dashboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#2b2d2f] flex items-center justify-center px-4">
      <div className="w-full max-w-5xl h-[520px] bg-white rounded shadow-lg overflow-hidden flex">
        {/* LEFT PANEL */}
        <div className="hidden md:flex w-1/2 bg-[#c1d2d2] flex-col justify-between px-10 py-10">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900 mb-4">
              Welcome to Ridemate
            </h1>
            <p className="text-sm text-gray-700 leading-relaxed max-w-md">
              Welcome to Ridemate — your trusted companion for fast, safe, and
              convenient rides. Whether you&apos;re heading to work, meeting
              friends, or exploring the city, we make travel simple and
              stress-free. With reliable drivers, transparent pricing, and
              real-time tracking, Ridemate ensures every journey is smooth from
              start to finish.
            </p>
          </div>

          <div className="text-xs text-gray-800 flex items-center gap-3">
            <span>Follow Us:</span>
            {/* Just simple placeholders for icons */}
            <span className="flex gap-2 text-lg">
              <span>📘</span>
              <span>📸</span>
              <span>❌</span>
              <span>💼</span>
              <span>📱</span>
            </span>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full md:w-1/2 bg-[#f9f9f9] flex flex-col items-center justify-center px-8 sm:px-12">
          <div className="w-full max-w-sm">
            <h2 className="text-xl sm:text-2xl font-semibold text-[#c03955] text-center mb-8">
              Login Now
            </h2>

            {error && (
              <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 p-2 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#c03955]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#c03955]"
                />
              </div>

              {/* Remember + Forget */}
              <div className="flex items-center justify-between text-xs text-gray-600">
                <label className="inline-flex items-center gap-1">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={handleChange}
                    className="h-3 w-3"
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  className="text-[11px] text-gray-500 hover:text-[#c03955]"
                >
                  Forget Password?
                </button>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-[#c03955] hover:bg-[#a52d46] text-white text-sm font-medium py-2.5 rounded-full transition disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
