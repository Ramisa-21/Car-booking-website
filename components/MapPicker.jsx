"use client";

import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "500px" };

export default function MapPicker({
  pickup,
  dropoff,
  setPickup,
  setDropoff,
  pickupOnly = false, // default false
}) {
  const [pickupMarker, setPickupMarker] = useState(pickup || null);
  const [dropoffMarker, setDropoffMarker] = useState(dropoff || null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  const center = { lat: 23.8103, lng: 90.4125 };

  const handleMapClick = (e) => {
    const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };

    if (pickupOnly) {
      setPickupMarker(latLng);
      if (setPickup) setPickup(latLng);
      return;
    }

    // Two-marker mode
    if (!pickupMarker) {
      setPickupMarker(latLng);
      if (setPickup) setPickup(latLng);
      return;
    }

    setDropoffMarker(latLng);
    if (setDropoff) setDropoff(latLng);
  };

  const handleClear = () => {
    if (pickupOnly) {
      setPickupMarker(null);
      if (setPickup) setPickup(null);
    } else {
      setPickupMarker(null);
      setDropoffMarker(null);
      if (setPickup) setPickup(null);
      if (setDropoff) setDropoff(null);
    }
  };

  // Sync markers with props
  useEffect(() => {
    setPickupMarker(pickup || null);
    if (!pickupOnly) setDropoffMarker(dropoff || null);
  }, [pickup, dropoff, pickupOnly]);

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
        {!pickupOnly && dropoffMarker && <Marker position={dropoffMarker} label="D" />}
      </GoogleMap>
    </div>
  );
}
