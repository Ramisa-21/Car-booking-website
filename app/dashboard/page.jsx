"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MapPicker from "../../components/MapPicker";

async function getAddress(lat, lng) {
  try {
    const res = await fetch(`/api/reverse-geocode?lat=${lat}&lng=${lng}`);
    const data = await res.json();
    return data.address;
  } catch (err) {
    console.error("getAddress error:", err);
    return "Unknown Location";
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [pickup, setPickup] = useState({ coords: null, address: "" });
  const [dropoff, setDropoff] = useState({ coords: null, address: "" });
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);

  useEffect(() => {
    const loadUserAndPlaces = async () => {
      try {
        const storedUser = localStorage.getItem("authUser");
        if (!storedUser) {
          router.push("/login");
          return;
        }
        const parsed = JSON.parse(storedUser);
        if (parsed.role === "DRIVER") {
          router.push("/driver/dashboard");
          return;
        }
        setUser(parsed);

        // Load saved places
        const placesRes = await fetch("/api/saved-places", {
          headers: { Authorization: `Bearer ${parsed.id}` },
        });
        const placesData = await placesRes.json();
        setSavedPlaces(placesData);

        // Load user bookings
        const token = localStorage.getItem("authToken");
        const bookingsRes = await fetch("/api/user/bookings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const bookingsData = await bookingsRes.json();
        if (bookingsData.success) {
          setBookings(bookingsData.bookings);
        }
      } catch (e) {
        console.error(e);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    loadUserAndPlaces();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    router.push("/login");
  };

  const handleSelectSavedPlace = async (place, type) => {
    const coords = { lat: place.coordsLat, lng: place.coordsLng };
    const address = place.label || place.address || "Unknown";

    if (type === "pickup") setPickup({ coords, address });
    else setDropoff({ coords, address });
  };

  const handlePickupChangeFromMap = async (coords) => {
    if (!coords) return setPickup({ coords: null, address: "" });
    const address = await getAddress(coords.lat, coords.lng);
    setPickup({ coords, address });
  };

  const handleDropoffChangeFromMap = async (coords) => {
    if (!coords) return setDropoff({ coords: null, address: "" });
    const address = await getAddress(coords.lat, coords.lng);
    setDropoff({ coords, address });
  };

  const fetchSuggestions = async (query, type) => {
    if (!query) {
      type === "pickup" ? setPickupSuggestions([]) : setDropoffSuggestions([]);
      return;
    }
    try {
      const bbox = "90.2750,23.6345,90.5340,23.9336";
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&bbox=${bbox}&limit=5`
      );
      const data = await res.json();
      const suggestions = data.features.map((f) => ({
        label: f.properties.name
          ? `${f.properties.name}, ${f.properties.city || ""}`.trim()
          : f.properties.city || f.properties.country || "Unknown",
        coords: { lat: f.geometry.coordinates[1], lng: f.geometry.coordinates[0] },
      }));
      type === "pickup" ? setPickupSuggestions(suggestions) : setDropoffSuggestions(suggestions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectSuggestion = (suggestion, type) => {
    if (type === "pickup") {
      setPickup({ coords: suggestion.coords, address: suggestion.label });
      setPickupSuggestions([]);
    } else {
      setDropoff({ coords: suggestion.coords, address: suggestion.label });
      setDropoffSuggestions([]);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!pickup.address || !dropoff.address) {
      alert("Please select both pickup and dropoff locations.");
      return;
    }
    if (!pickup.coords || !dropoff.coords) {
      alert("Please select valid coordinates.");
      return;
    }

    sessionStorage.setItem("pickupCoords", JSON.stringify(pickup.coords));
    sessionStorage.setItem("dropoffCoords", JSON.stringify(dropoff.coords));

    router.push(
      `/search-results?pickup=${encodeURIComponent(pickup.address)}&dropoff=${encodeURIComponent(
        dropoff.address
      )}`
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACCEPTED: "bg-blue-100 text-blue-800",
      ONGOING: "bg-green-100 text-green-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-sm text-gray-600">Loading dashboard...</p>
      </main>
    );

  return (
    <main className="min-h-screen bg-white">
      {/* NAVBAR */}
      <nav className="w-full bg-[#C1D2D2] px-6 md:px-12 py-4 flex items-center justify-between">
        <div
          className="text-2xl font-bold text-black cursor-pointer"
          onClick={() => router.push("/dashboard")}
        >
          RideMate
        </div>
        <div className="hidden md:flex items-center gap-8 text-black font-medium">
          <button className="text-pink-600">Ride</button>
          <button onClick={() => setShowBookings(!showBookings)}>
            My Bookings
            {bookings.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {bookings.length}
              </span>
            )}
          </button>
          <button>Contact Us</button>
          <button>Help</button>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 text-gray-700 text-sm">
            🌐 <span>EN</span>
          </div>
          {user && (
            <button
              onClick={() => router.push("/profile")}
              className="flex flex-col items-end text-xs sm:text-sm mr-1 text-left"
            >
              <span className="font-semibold">{user.name}</span>
              <span className="uppercase text-gray-700">{user.role}</span>
            </button>
          )}
          <img
            src="/cat-pp.jpg"
            className="w-10 h-10 rounded-full border object-cover"
            alt="Profile"
          />
          <button
            onClick={handleLogout}
            className="hidden sm:inline-block text-xs md:text-sm px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* MY BOOKINGS SECTION (TOGGLE) */}
      {showBookings && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 md:px-20 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-black">My Bookings</h2>
            <button
              onClick={() => setShowBookings(false)}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              ✕ Close
            </button>
          </div>

          {bookings.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No bookings yet. Book your first ride!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  onClick={() => router.push(`/booking/waiting?bookingId=${booking.id}`)}
                  className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition border-l-4 border-blue-500"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-800">Booking #{booking.id}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600">📍</span>
                      <p className="text-gray-700 line-clamp-1">{booking.pickupLocation}</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-600">🎯</span>
                      <p className="text-gray-700 line-clamp-1">{booking.dropoffLocation}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t">
                    <span className="text-gray-600 text-sm">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-green-600 font-bold">
                      {booking.price ? `${booking.price.toFixed(2)} BDT` : "N/A"}
                    </span>
                  </div>

                  {booking.driver && (
                    <div className="mt-3 pt-3 border-t text-xs text-gray-600">
                      <p>
                        🚗 {booking.driver.name} • {booking.driver.vehicleModel}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MAIN SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 md:px-20 py-12 md:py-16 items-center">
        {/* LEFT PANEL */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6 md:mb-8 text-black">
            Go Anywhere With <br />
            <span className="font-extrabold text-[#c03955]">RideMate</span>
          </h1>
          {user && (
            <p className="mb-4 text-sm text-gray-700">
              Welcome back, <span className="font-semibold">{user.name}</span>!
            </p>
          )}

          {/* Quick Access to Recent Booking */}
          {bookings.length > 0 && (
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">RECENT BOOKING</p>
                  <p className="text-sm font-bold text-gray-800 mt-1">
                    Booking #{bookings[0].id} • {bookings[0].status}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                    {bookings[0].pickupLocation} → {bookings[0].dropoffLocation}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/booking/waiting?bookingId=${bookings[0].id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                >
                  View
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-4">
            {/* Pickup */}
            <div className="relative">
              <input
                type="text"
                value={pickup.address}
                onChange={(e) => {
                  setPickup({ ...pickup, address: e.target.value });
                  fetchSuggestions(e.target.value, "pickup");
                }}
                placeholder="Pickup Location"
                className="w-full bg-transparent outline-none text-black border border-gray-300 rounded-xl px-4 py-3"
              />
              {pickupSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-lg z-50 text-black max-h-60 overflow-y-auto">
                  {pickupSuggestions.map((s, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectSuggestion(s, "pickup")}
                    >
                      {s.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Dropoff */}
            <div className="relative">
              <input
                type="text"
                value={dropoff.address}
                onChange={(e) => {
                  setDropoff({ ...dropoff, address: e.target.value });
                  fetchSuggestions(e.target.value, "dropoff");
                }}
                placeholder="Dropoff Location"
                className="w-full bg-transparent outline-none text-black border border-gray-300 rounded-xl px-4 py-3"
              />
              {dropoffSuggestions.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-300 w-full mt-1 rounded shadow-lg z-50 text-black max-h-60 overflow-y-auto">
                  {dropoffSuggestions.map((s, idx) => (
                    <li
                      key={idx}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectSuggestion(s, "dropoff")}
                    >
                      {s.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => router.push("/schedule-ride")}
                className="flex items-center justify-center gap-2 px-5 py-3 border rounded-xl text-gray-700 text-sm"
              >
                📅 Later?
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#c03955] hover:bg-[#a52d46] text-white font-semibold px-6 py-3 rounded-xl text-sm"
              >
                Search Your Ride
              </button>
            </div>

            {/* Saved Places */}
            {savedPlaces.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl text-black font-semibold mb-3">Your Saved Places</h2>
                <ul className="flex flex-col gap-2">
                  {savedPlaces.map((place) => (
                    <li
                      key={place.id}
                      className="border p-3 rounded-xl flex flex-col gap-1 hover:bg-gray-100 cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-black">{place.label}</span>
                        <div className="flex gap-2">
                          <button
                            className="text-sm text-blue-600 hover:underline"
                            onClick={() => handleSelectSavedPlace(place, "pickup")}
                          >
                            Set as Pickup
                          </button>
                          <button
                            className="text-sm text-green-600 hover:underline"
                            onClick={() => handleSelectSavedPlace(place, "dropoff")}
                          >
                            Set as Dropoff
                          </button>
                        </div>
                      </div>
                      <span className="text-gray-600">{place.address}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </div>

        {/* MAP */}
        <div className="hidden lg:flex justify-center w-full">
          <MapPicker
            pickup={pickup.coords}
            dropoff={dropoff.coords}
            setPickup={handlePickupChangeFromMap}
            setDropoff={handleDropoffChangeFromMap}
            mode="ride"
          />
        </div>
      </div>
    </main>
  );
}
