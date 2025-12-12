"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "500px" };

export default function MapPicker({ pickup, dropoff, setPickup, setDropoff }) {
  const [pickupMarker, setPickupMarker] = useState(pickup || null);
  const [dropoffMarker, setDropoffMarker] = useState(dropoff || null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const center = { lat: 23.8103, lng: 90.4125 };

  const handleMapClick = (e) => {
    const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
    if (!pickupMarker) {
      setPickupMarker(latLng);
      setPickup(latLng);
    } else if (!dropoffMarker) {
      setDropoffMarker(latLng);
      setDropoff(latLng);
    }
  };

  const handleClear = () => {
    setPickupMarker(null);
    setDropoffMarker(null);
    setPickup(null);
    setDropoff(null);
  };

  useEffect(() => {
    if (pickup) setPickupMarker(pickup);
    if (dropoff) setDropoffMarker(dropoff);
  }, [pickup, dropoff]);

  if (!isLoaded) return <p>Loading map...</p>;

  return (
    <div style={{ width: "100%" }}>
      <button
        onClick={handleClear}
        className="mb-3 px-4 py-2 bg-red-500 text-white rounded"
      >
        Clear Map
      </button>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onClick={handleMapClick}
      >
        {pickupMarker && <Marker position={pickupMarker} label="P" />}
        {dropoffMarker && <Marker position={dropoffMarker} label="D" />}
      </GoogleMap>
    </div>
  );
}
