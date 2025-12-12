// app/api/booking/calculate-route-price/route.js
import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// Vehicle pricing rates (BDT) - MANUAL RATES (OpenRouteService doesn't provide this)
const VEHICLE_RATES = {
  SEDAN: { base: 50, perKm: 15, perMin: 2 },
  SUV: { base: 80, perKm: 20, perMin: 3 },
  BIKE: { base: 30, perKm: 10, perMin: 1.5 },
  MICRO: { base: 40, perKm: 12, perMin: 1.8 },
  MINIVAN: { base: 100, perKm: 25, perMin: 4 },
};

export async function POST(req) {
  try {
    const { pickupLocation, dropoffLocation, vehicleType, couponCode } = await req.json();

    if (!pickupLocation || !dropoffLocation || !vehicleType) {
      return NextResponse.json(
        { error: "Pickup, dropoff, and vehicle type required" },
        { status: 400 }
      );
    }

    // Step 1: Geocode pickup location - RESTRICT TO BANGLADESH
    const pickupGeoRes = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${process.env.OPENROUTE_API_KEY}&text=${encodeURIComponent(pickupLocation)}&boundary.country=BD`
    );
    const pickupGeoData = await pickupGeoRes.json();

    if (!pickupGeoData.features || pickupGeoData.features.length === 0) {
      return NextResponse.json(
        { error: "Could not find pickup location in Bangladesh" },
        { status: 400 }
      );
    }

    const pickupCoords = pickupGeoData.features[0].geometry.coordinates; // [lng, lat]

    // Step 2: Geocode dropoff location - RESTRICT TO BANGLADESH
    const dropoffGeoRes = await fetch(
      `https://api.openrouteservice.org/geocode/search?api_key=${process.env.OPENROUTE_API_KEY}&text=${encodeURIComponent(dropoffLocation)}&boundary.country=BD`
    );
    const dropoffGeoData = await dropoffGeoRes.json();

    if (!dropoffGeoData.features || dropoffGeoData.features.length === 0) {
      return NextResponse.json(
        { error: "Could not find dropoff location in Bangladesh" },
        { status: 400 }
      );
    }

    const dropoffCoords = dropoffGeoData.features[0].geometry.coordinates; // [lng, lat]

    // Step 3: Get route directions (distance & duration) - OpenRouteService provides this
    const directionsRes = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.OPENROUTE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coordinates: [pickupCoords, dropoffCoords],
        }),
      }
    );

    const directionsData = await directionsRes.json();

    if (!directionsData.routes || directionsData.routes.length === 0) {
      return NextResponse.json(
        { error: "Could not calculate route" },
        { status: 400 }
      );
    }

    const route = directionsData.routes[0];
    const distanceKm = (route.summary.distance / 1000).toFixed(2); // meters to km
    const durationMin = (route.summary.duration / 60).toFixed(0); // seconds to minutes

    // Step 4: Calculate pricing - MANUAL RATES (not from OpenRouteService)
    if (!VEHICLE_RATES[vehicleType]) {
      return NextResponse.json(
        { error: "Invalid vehicle type" },
        { status: 400 }
      );
    }

    const rates = VEHICLE_RATES[vehicleType];
    const basePrice = rates.base;
    const distancePrice = parseFloat(distanceKm) * rates.perKm;
    const timePrice = parseFloat(durationMin) * rates.perMin;
    const subtotal = basePrice + distancePrice + timePrice;

    let discount = 0;
    let couponDetails = null;
    let finalPrice = subtotal;

    // Step 5: Apply coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.active && new Date(coupon.expiry) > new Date()) {
        discount = (subtotal * coupon.discount) / 100;
        finalPrice = subtotal - discount;

        couponDetails = {
          code: coupon.code,
          discountPercent: coupon.discount,
          discountAmount: discount,
        };
      }
    }

    // Return complete pricing data
    return NextResponse.json({
      success: true,
      route: {
        pickupLocation,
        dropoffLocation,
        distanceKm: parseFloat(distanceKm),
        durationMin: parseFloat(durationMin),
      },
      pricing: {
        vehicleType,
        breakdown: {
          baseFare: basePrice,
          distanceFare: distancePrice,
          timeFare: timePrice,
        },
        subtotal: subtotal,
        discount: discount,
        finalPrice: finalPrice,
        currency: "BDT",
        coupon: couponDetails,
      },
    });
  } catch (error) {
    console.error("Route pricing error:", error);
    return NextResponse.json(
      { error: "Failed to calculate route price" },
      { status: 500 }
    );
  }
}
