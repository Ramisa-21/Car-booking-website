"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RideHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [rideHistory, setRideHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("authUser");
    if (!storedUser) {
      router.push("/login");
      return;
    }
    const parsed = JSON.parse(storedUser);
    if (parsed.role !== "DRIVER") {
      router.push("/dashboard");
      return;
    }
    setUser(parsed);
    fetchRideHistory(parsed.id);
  }, [router]);

  const fetchRideHistory = async (userId) => {
    try {
      const res = await fetch(`/api/driver/dashboard?userId=${userId}`);
      const data = await res.json();
      setRideHistory(data.rideHistory || []);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      // Dynamically import jsPDF
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF();

      // Title
      doc.setFontSize(20);
      doc.text("Ride History Report", 14, 22);

      // Driver Info
      doc.setFontSize(12);
      doc.text(`Driver: ${user.name}`, 14, 32);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 40);

      // Table headers
      doc.setFontSize(10);
      const headers = ["Ride ID", "Pickup", "Dropoff", "Price", "Time", "Status"];
      let y = 55;

      // Draw header row
      doc.setFont(undefined, 'bold');
      headers.forEach((header, i) => {
        doc.text(header, 14 + (i * 32), y);
      });

      // Draw rides
      doc.setFont(undefined, 'normal');
      y += 8;
      
      rideHistory.forEach((ride) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }

        doc.text(String(ride.rideId), 14, y);
        doc.text(ride.pickupLocation.substring(0, 15) + "...", 46, y);
        doc.text(ride.dropoffLocation.substring(0, 15) + "...", 78, y);
        doc.text(String(ride.price || "N/A"), 110, y);
        doc.text(ride.time, 142, y);
        doc.text(ride.status, 174, y);

        y += 8;
      });

      // Total earnings
      const totalEarnings = rideHistory.reduce((sum, ride) => sum + (ride.price || 0), 0);
      y += 10;
      doc.setFont(undefined, 'bold');
      doc.text(`Total Earnings: ${totalEarnings.toFixed(2)} BDT`, 14, y);

      // Save PDF
      doc.save(`ride-history-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading ride history...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/driver/dashboard")}
              className="text-2xl font-bold text-gray-700 hover:text-gray-900"
            >
              &lt;
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Ride History</h1>
          </div>
          <button
            onClick={downloadPDF}
            disabled={downloading || rideHistory.length === 0}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {downloading ? "Generating PDF..." : "📥 Download PDF"}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 font-medium">Total Rides</p>
            <p className="text-3xl font-bold text-blue-600">{rideHistory.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 font-medium">Total Earnings</p>
            <p className="text-3xl font-bold text-green-600">
              {rideHistory.reduce((sum, ride) => sum + (ride.price || 0), 0).toFixed(2)} BDT
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-sm text-gray-600 font-medium">Average Fare</p>
            <p className="text-3xl font-bold text-purple-600">
              {rideHistory.length > 0
                ? (rideHistory.reduce((sum, ride) => sum + (ride.price || 0), 0) / rideHistory.length).toFixed(2)
                : "0.00"}{" "}
              BDT
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ride ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pickup Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dropoff Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rideHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No completed rides yet
                    </td>
                  </tr>
                ) : (
                  rideHistory.map((ride) => (
                    <tr key={ride.rideId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{ride.rideId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ride.pickupLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ride.dropoffLocation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {ride.price ? `${ride.price.toFixed(2)} BDT` : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {ride.time}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {ride.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
