"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Placeholder for the Table component to keep the file clean. 
// You will implement the table rendering logic here.
const RideTable = ({ title, data, showActions = false, actionType, onAction, processingRides }) => (
    <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">{title}</h3>
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ride ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pickup Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Drop Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        {showActions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-4 text-sm text-gray-500 text-center">
                                No data available for this section.
                            </td>
                        </tr>
                    ) : (
                        data.map((ride) => (
                            <tr key={ride.rideId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ride.rideId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ride.pickupLocation}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ride.dropoffLocation}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ride.time}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        ride.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        ride.status === 'ACCEPTED' ? 'bg-blue-100 text-blue-800' :
                                        ride.status === 'ONGOING' ? 'bg-green-100 text-green-800' :
                                        ride.status === 'COMPLETED' ? 'bg-gray-100 text-gray-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {ride.status}
                                    </span>
                                </td>
                                {showActions && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {actionType === 'request' && (
                                            <>
                                                <button 
                                                    onClick={() => onAction(ride.rideId, 'accept')}
                                                    disabled={processingRides.has(ride.rideId)}
                                                    className={`mr-4 font-semibold ${
                                                        processingRides.has(ride.rideId) 
                                                            ? 'text-gray-400 cursor-not-allowed' 
                                                            : 'text-green-600 hover:text-green-900'
                                                    }`}
                                                >
                                                    {processingRides.has(ride.rideId) ? 'Processing...' : 'ADD'}
                                                </button>
                                                <button className="text-red-600 hover:text-red-900 font-semibold">
                                                    REJECT
                                                </button>
                                            </>
                                        )}
                                        {actionType === 'accepted' && (
                                            <button 
                                                onClick={() => onAction(ride.rideId, 'complete')}
                                                disabled={processingRides.has(ride.rideId)}
                                                className={`px-4 py-2 rounded-md font-semibold ${
                                                    processingRides.has(ride.rideId)
                                                        ? 'bg-gray-400 cursor-not-allowed text-white'
                                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                            >
                                                {processingRides.has(ride.rideId) ? 'Processing...' : 'COMPLETE'}
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </div>
);


export default function DriverDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [activeTab, setActiveTab] = useState('requests');
    const [processingRides, setProcessingRides] = useState(new Set());

    // Fetch dashboard data function
    const fetchDashboardData = async (driverUserId) => {
        try {
            const response = await fetch(`/api/driver/dashboard?userId=${driverUserId}`);
            const data = await response.json();
            
            setDashboardData({
                driverName: user?.name || data.driverName,
                totalEarnings: data.totalEarnings || 0,
                completedRidesCount: data.completedRidesCount || 0,
                rideRequestsCount: data.rideRequestsCount || 0,
                rideRequests: data.rideRequests || [],
                acceptedRides: data.acceptedRides || [],
                rideHistory: data.rideHistory || [],
            });

        } catch (error) {
            console.error("API Fetch Error:", error);
        }
    };

    // 1. Authentication and Redirection Logic
    useEffect(() => {
        let parsed = null;
        try {
            const storedUser = localStorage.getItem("authUser");
            if (!storedUser) {
                router.push("/login");
                return;
            }

            parsed = JSON.parse(storedUser);
            if (parsed.role !== "DRIVER") {
                router.push("/dashboard");
                return;
            }

            setUser(parsed);
        } catch (e) {
            console.error("Failed to read authUser or not a DRIVER", e);
            router.push("/login");
            return;
        } 
        
        if (parsed) {
            fetchDashboardData(parsed.id).finally(() => setLoading(false));
        }

    }, [router]);

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        router.push("/login");
    };

    // Handle ride actions with optimistic UI update
    const handleRideAction = async (rideId, action) => {
        // Mark ride as processing
        setProcessingRides(prev => new Set(prev).add(rideId));

        try {
            const response = await fetch('/api/driver/ride-action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rideId,
                    action,
                    userId: user.id,
                }),
            });

            if (response.ok) {
                // Optimistically update UI immediately
                setDashboardData(prev => {
                    if (!prev) return prev;

                    if (action === 'accept') {
                        // Move from requests to accepted
                        const ride = prev.rideRequests.find(r => r.rideId === rideId);
                        if (ride) {
                            return {
                                ...prev,
                                rideRequests: prev.rideRequests.filter(r => r.rideId !== rideId),
                                acceptedRides: [...prev.acceptedRides, { ...ride, status: 'ACCEPTED' }],
                                rideRequestsCount: prev.rideRequestsCount - 1,
                            };
                        }
                    } else if (action === 'complete') {
                        // Move from accepted to history
                        const ride = prev.acceptedRides.find(r => r.rideId === rideId);
                        if (ride) {
                            const ridePrice = ride.price || 0;
                            return {
                                ...prev,
                                acceptedRides: prev.acceptedRides.filter(r => r.rideId !== rideId),
                                rideHistory: [{ ...ride, status: 'COMPLETED' }, ...prev.rideHistory],
                                completedRidesCount: prev.completedRidesCount + 1,
                                totalEarnings: prev.totalEarnings + ridePrice,
                            };
                        }
                    }
                    return prev;
                });

                // Fetch fresh data in background (for accuracy)
                fetchDashboardData(user.id);
            }
        } catch (error) {
            console.error('Action Error:', error);
            // Revert on error by fetching fresh data
            fetchDashboardData(user.id);
        } finally {
            // Remove from processing
            setProcessingRides(prev => {
                const next = new Set(prev);
                next.delete(rideId);
                return next;
            });
        }
    };

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-sm text-gray-600">Loading driver dashboard...</p>
            </main>
        );
    }
    
    if (!user || !dashboardData) {
        return null;
    }

    return (
        <main className="min-h-screen bg-gray-100">
            {/* ---------------------- HEADER ----------------------- */}
            <header className="w-full bg-[#C1D2D2] px-6 md:px-12 py-4 flex items-center justify-between">
                <div className="text-2xl font-bold text-black cursor-pointer">RideMate</div>
                <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition duration-150"
                >
                    Logout
                </button>
            </header>

            {/* ---------------------- MAIN CONTENT GRID ----------------------- */}
            <div className="flex">
                {/* LEFT SIDEBAR NAVIGATION */}
                <nav className="w-64 bg-gray-200 p-4 min-h-[calc(100vh-68px)] flex flex-col space-y-4">
                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`text-left px-4 py-2 rounded-lg font-semibold ${activeTab === 'requests' ? 'bg-gray-400 text-white' : 'bg-white text-gray-800 hover:bg-gray-300'}`}
                    >
                        Dashboard (Ride Requests)
                    </button>
                    <button 
                        onClick={() => setActiveTab('accepted')}
                        className={`text-left px-4 py-2 rounded-lg font-semibold ${activeTab === 'accepted' ? 'bg-gray-400 text-white' : 'bg-white text-gray-800 hover:bg-gray-300'}`}
                    >
                        Accepted Rides
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`text-left px-4 py-2 rounded-lg font-semibold ${activeTab === 'history' ? 'bg-gray-400 text-white' : 'bg-white text-gray-800 hover:bg-gray-300'}`}
                    >
                        Ride History
                    </button>
                </nav>

                {/* RIGHT MAIN PANEL */}
                <div className="flex-1 p-8">
                    {/* TOP METRICS CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-md text-center">
                            <p className="text-sm text-gray-600 font-medium">Total Earning</p>
                            <p className="text-3xl mt-1 font-bold text-green-600">{dashboardData.totalEarnings.toFixed(2)} BDT</p>
                        </div>
                        
                        <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-md text-center">
                            <p className="text-sm text-gray-600 font-medium">Completed Ride</p>
                            <p className="text-3xl mt-1 font-bold text-blue-600">{dashboardData.completedRidesCount}</p>
                        </div>
                        
                        <div className="p-4 bg-white border border-gray-300 rounded-lg shadow-md text-center">
                            <p className="text-sm text-gray-600 font-medium">Ride Requests</p>
                            <p className="text-3xl mt-1 font-bold text-orange-600">{dashboardData.rideRequestsCount}</p>
                        </div>
                    </div>

                    {/* DRIVER NAME/PROFILE */}
                    <div className="flex items-center mb-8">
                        <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div> 
                        <h2 className="text-2xl font-bold text-gray-800">{dashboardData.driverName}</h2>
                    </div>

                    {/* DYNAMIC CONTENT AREA */}
                    {activeTab === 'requests' && (
                        <RideTable 
                            title="Ride Requests" 
                            data={dashboardData.rideRequests} 
                            showActions={true}
                            actionType="request"
                            onAction={handleRideAction}
                            processingRides={processingRides}
                        />
                    )}
                    
                    {activeTab === 'accepted' && (
                        <RideTable 
                            title="Accepted Rides" 
                            data={dashboardData.acceptedRides}
                            showActions={true}
                            actionType="accepted"
                            onAction={handleRideAction}
                            processingRides={processingRides}
                        />
                    )}

                    {activeTab === 'history' && (
                        <RideTable 
                            title="Ride History" 
                            data={dashboardData.rideHistory} 
                        />
                    )}
                    
                </div>
            </div>
        </main>
    );
}
