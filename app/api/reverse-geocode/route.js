
// app/api/reverse-geocode/route.js
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ address: "Coordinates missing" }, { status: 400 });
  }

  try {
    // Use Nominatim (OpenStreetMap) for reverse geocoding
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
    );
    const data = await res.json();

    if (data && data.display_name) {
      return NextResponse.json({ address: data.display_name });
    }

    return NextResponse.json({ address: "Unknown Location" });
  } catch (err) {
    console.error("Reverse geocoding error:", err);
    return NextResponse.json({ address: "Unknown Location" }, { status: 500 });
  }
}