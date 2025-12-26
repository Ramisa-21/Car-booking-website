"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// Placeholder for the Table component
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        {showActions && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="px-6 py-4 text-sm text-gray-500 text-center">
                                No data available for this section.
                            </td>
                        </tr>
                    ) : (
                        data.map((ride) => (
                            <tr key={ride.rideId}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ride.rideId}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ride.pickupLocation}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ride.dropoffLocation}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                    {ride.price ? `${ride.price.toFixed(2)} BDT` : "N/A"}
                                </td>
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
                                                    {processingRides.has(ride.rideId) ? 'Processing...' : 'ACCEPT'}
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
    
    // Location tracking states
    const [isOnline, setIsOnline] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationError, setLocationError] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);
    const locationIntervalRef = useRef(null);
    
    // Auto-refresh states
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastRefreshTime, setLastRefreshTime] = useState(null);
    const refreshIntervalRef = useRef(null);

    // Fetch dashboard data function
    const fetchDashboardData = async (driverUserId, silent = false) => {
        try {
            if (!silent) {
                setIsRefreshing(true);
            }
            
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

            setLastRefreshTime(new Date());

            // Show notification if new ride requests appeared
            if (dashboardData && data.rideRequestsCount > dashboardData.rideRequestsCount) {
                const newRidesCount = data.rideRequestsCount - dashboardData.rideRequestsCount;
                if (Notification.permission === "granted") {
                    new Notification("New Ride Request!", {
                        body: `You have ${newRidesCount} new ride request${newRidesCount > 1 ? 's' : ''}`,
                        icon: "/next.svg",
                    });
                }
            }

        } catch (error) {
            console.error("API Fetch Error:", error);
        } finally {
            if (!silent) {
                setIsRefreshing(false);
            }
        }
    };

    // Get current GPS location
    const getCurrentGPSLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocation not supported"));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    });
                },
                (error) => {
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    };

    // Reverse geocode using OpenStreetMap Nominatim
    const reverseGeocode = async (lat, lng) => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();
            return data.display_name || "Unknown Location";
        } catch (err) {
            console.error("Reverse geocode error:", err);
            return "Unknown Location";
        }
    };

    // Update location in database
    const updateLocationInDB = async (lat, lng, address, online = true) => {
        try {
            const token = localStorage.getItem("authToken");
            const res = await fetch("/api/driver/location", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    lat,
                    lng,
                    address,
                    isOnline: online,
                }),
            });

            if (!res.ok) {
                console.error("Failed to update location in DB");
            }
        } catch (err) {
            console.error("Update location error:", err);
        }
    };

    // Handle going online/offline
    const handleToggleOnline = async () => {
        if (!isOnline) {
            // Going ONLINE - Start location tracking
            setLocationLoading(true);
            setLocationError("");

            try {
                // Get initial location
                const coords = await getCurrentGPSLocation();
                const address = await reverseGeocode(coords.lat, coords.lng);
                
                setCurrentLocation({ ...coords, address });
                await updateLocationInDB(coords.lat, coords.lng, address, true);
                
                setIsOnline(true);
                
                // Start periodic location updates every 30 seconds
                locationIntervalRef.current = setInterval(async () => {
                    try {
                        const newCoords = await getCurrentGPSLocation();
                        const newAddress = await reverseGeocode(newCoords.lat, newCoords.lng);
                        setCurrentLocation({ ...newCoords, address: newAddress });
                        await updateLocationInDB(newCoords.lat, newCoords.lng, newAddress, true);
                    } catch (err) {
                        console.error("Location update error:", err);
                    }
                }, 30000);

                // Start auto-refresh for ride requests
                startAutoRefresh();

                // Request notification permission
                if (Notification.permission === "default") {
                    Notification.requestPermission();
                }

            } catch (error) {
                console.error("GPS Error:", error);
                if (error.code === 1) {
                    setLocationError("Location permission denied. Please enable GPS.");
                } else if (error.code === 2) {
                    setLocationError("Location unavailable. Check your device settings.");
                } else {
                    setLocationError("Failed to get location. Try again.");
                }
            } finally {
                setLocationLoading(false);
            }

        } else {
            // Going OFFLINE - Stop tracking
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }
            
            // Stop auto-refresh
            stopAutoRefresh();

            // Update DB to offline status
            if (currentLocation) {
                await updateLocationInDB(
                    currentLocation.lat, 
                    currentLocation.lng, 
                    currentLocation.address, 
                    false
                );
            }

            setIsOnline(false);
            setLocationError("");
        }
    };

    // Start auto-refresh (every 30 seconds)
    const startAutoRefresh = () => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
        }

        refreshIntervalRef.current = setInterval(() => {
            if (user) {
                fetchDashboardData(user.id, true); // silent refresh
            }
        }, 30000); // 30 seconds
    };

    // Stop auto-refresh
    const stopAutoRefresh = () => {
        if (refreshIntervalRef.current) {
            clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = null;
        }
    };

    // Manual refresh button
    const handleManualRefresh = () => {
        if (user) {
            fetchDashboardData(user.id, false);
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
            
            // Check existing location status
            fetch(`/api/driver/location?userId=${parsed.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.location) {
                        setCurrentLocation({
                            lat: data.location.lat,
                            lng: data.location.lng,
                            address: data.location.address
                        });
                        const wasOnline = data.location.isOnline || false;
                        setIsOnline(wasOnline);
                        
                        // If driver was online, start auto-refresh
                        if (wasOnline) {
                            startAutoRefresh();
                        }
                    }
                })
                .catch(err => console.error("Load location error:", err));
        }

        // Cleanup intervals on unmount
        return () => {
            if (locationIntervalRef.current) {
                clearInterval(locationIntervalRef.current);
            }
            stopAutoRefresh();
        };
    }, [router]);

    const handleLogout = () => {
        if (locationIntervalRef.current) {
            clearInterval(locationIntervalRef.current);
        }
        stopAutoRefresh();
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
                fetchDashboardData(user.id, true);
            }
        } catch (error) {
            console.error('Action Error:', error);
            // Revert on error by fetching fresh data
            fetchDashboardData(user.id, true);
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
                <div className="flex items-center gap-4">
                    {/* Auto-refresh indicator */}
                    {isOnline && (
                        <div className="flex items-center gap-2 text-sm">
                            <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                            <span className="text-gray-700">
                                {isRefreshing ? 'Refreshing...' : lastRefreshTime ? `Updated ${lastRefreshTime.toLocaleTimeString()}` : 'Live'}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition duration-150"
                    >
                        Logout
                    </button>
                </div>
            </header>

            {/* ---------------------- MAIN CONTENT GRID ----------------------- */}
            <div className="flex">
                {/* LEFT SIDEBAR NAVIGATION */}
                <nav className="w-64 bg-gray-200 p-4 min-h-[calc(100vh-68px)] flex flex-col space-y-4">
                    {/* ONLINE/OFFLINE TOGGLE */}
                    <div className="bg-white rounded-lg p-4 shadow-md mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-gray-800">Status</span>
                            <span className={`text-xs font-bold px-2 py-1 rounded ${isOnline ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>
                                {isOnline ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>
                        
                        <button
                            onClick={handleToggleOnline}
                            disabled={locationLoading}
                            className={`w-full py-2 rounded-lg font-semibold transition ${
                                isOnline 
                                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                                    : 'bg-green-500 hover:bg-green-600 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {locationLoading ? "Getting GPS..." : isOnline ? "Go Offline" : "Go Online (Auto GPS)"}
                        </button>

                        {/* Manual Location Button */}
                        <button
                            onClick={() => router.push("/driver/manual-location")}
                            className="w-full mt-2 py-2 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition text-sm"
                        >
                            📍 Set Location Manually
                        </button>

                        {/* Manual Refresh Button */}
                        {isOnline && (
                            <button
                                onClick={handleManualRefresh}
                                disabled={isRefreshing}
                                className="w-full mt-2 py-2 rounded-lg font-semibold bg-purple-500 hover:bg-purple-600 text-white transition text-sm disabled:opacity-50"
                            >
                                {isRefreshing ? "Refreshing..." : "🔄 Refresh Now"}
                            </button>
                        )}

                        {locationError && (
                            <p className="text-xs text-red-600 mt-2">{locationError}</p>
                        )}

                        {currentLocation && (
                            <div className="mt-3 text-xs text-gray-600">
                                <p className="font-semibold">📍 Current Location:</p>
                                <p className="truncate">{currentLocation.address}</p>
                                <p className="text-gray-400 mt-1">
                                    {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
                                </p>
                            </div>
                        )}

                        {/* Auto-refresh status */}
                        {isOnline && (
                            <div className="mt-3 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                                <p className="font-semibold">🔄 Auto-Refresh: ON</p>
                                <p>Updates every 30 seconds</p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setActiveTab('requests')}
                        className={`text-left px-4 py-2 rounded-lg font-semibold ${activeTab === 'requests' ? 'bg-gray-400 text-white' : 'bg-white text-gray-800 hover:bg-gray-300'}`}
                    >
                        Dashboard
                        {dashboardData.rideRequestsCount > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {dashboardData.rideRequestsCount}
                            </span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveTab('accepted')}
                        className={`text-left px-4 py-2 rounded-lg font-semibold ${activeTab === 'accepted' ? 'bg-gray-400 text-white' : 'bg-white text-gray-800 hover:bg-gray-300'}`}
                    >
                        Accepted Rides
                        {dashboardData.acceptedRides.length > 0 && (
                            <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                {dashboardData.acceptedRides.length}
                            </span>
                        )}
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
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-300 mr-4"></div> 
                            <h2 className="text-2xl font-bold text-gray-800">{dashboardData.driverName}</h2>
                        </div>
                        {activeTab === 'history' && (
                            <button
                                onClick={() => router.push("/driver/ride-history")}
                                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                            >
                                📄 View & Download History
                            </button>
                        )}
                    </div>

                    {/* DYNAMIC CONTENT AREA */}
                    {activeTab === 'requests' && (
                        <>
                            {!isOnline && (
                                <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                                    <p className="text-yellow-800 font-semibold">⚠️ You are currently OFFLINE</p>
                                    <p className="text-sm text-yellow-700 mt-1">Go online to receive ride requests</p>
                                </div>
                            )}
                            <RideTable 
                                title="Ride Requests (Within 5km)" 
                                data={dashboardData.rideRequests} 
                                showActions={true}
                                actionType="request"
                                onAction={handleRideAction}
                                processingRides={processingRides}
                            />
                        </>
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
