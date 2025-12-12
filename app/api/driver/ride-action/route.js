import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function POST(request) {
    try {
        const body = await request.json();
        const { rideId, action, userId } = body;

        // Validate input
        if (!rideId || !action || !userId) {
            return NextResponse.json(
                { message: "Missing required fields" },
                { status: 400 }
            );
        }

        // Get driver record
        const driver = await prisma.driver.findUnique({
            where: { userId: Number(userId) },
        });

        if (!driver) {
            return NextResponse.json(
                { message: "Driver not found" },
                { status: 404 }
            );
        }

        // Handle ACCEPT action
        if (action === 'accept') {
            const booking = await prisma.booking.findUnique({
                where: { id: Number(rideId) },
            });

            if (!booking) {
                return NextResponse.json(
                    { message: "Booking not found" },
                    { status: 404 }
                );
            }

            if (booking.status !== 'PENDING') {
                return NextResponse.json(
                    { message: "Ride is not in PENDING status" },
                    { status: 400 }
                );
            }

            // Update booking status to ACCEPTED
            await prisma.booking.update({
                where: { id: Number(rideId) },
                data: { 
                    status: 'ACCEPTED',
                    driverId: driver.id,
                },
            });

            return NextResponse.json({
                message: "Ride accepted successfully!",
                success: true,
            });
        }

        // Handle COMPLETE action
        if (action === 'complete') {
            const booking = await prisma.booking.findUnique({
                where: { id: Number(rideId) },
            });

            if (!booking) {
                return NextResponse.json(
                    { message: "Booking not found" },
                    { status: 404 }
                );
            }

            if (!['ACCEPTED', 'ONGOING'].includes(booking.status)) {
                return NextResponse.json(
                    { message: "Ride must be ACCEPTED or ONGOING to complete" },
                    { status: 400 }
                );
            }

            // Update booking status to COMPLETED
            await prisma.booking.update({
                where: { id: Number(rideId) },
                data: { 
                    status: 'COMPLETED',
                },
            });

            // Update driver's total earnings
            const ridePrice = booking.price || 0;
            await prisma.driver.update({
                where: { id: driver.id },
                data: {
                    totalEarnings: {
                        increment: ridePrice,
                    },
                },
            });

            return NextResponse.json({
                message: `Ride completed! Earned ${ridePrice} BDT`,
                success: true,
            });
        }

        return NextResponse.json(
            { message: "Invalid action" },
            { status: 400 }
        );

    } catch (error) {
        console.error("Ride Action Error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
