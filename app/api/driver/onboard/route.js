import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { licenseNo, vehicleModel, vehiclePlate } = await req.json();

    const existingDriver = await prisma.driver.findUnique({
      where: { userId: decoded.id },
    });

    if (existingDriver) {
      return NextResponse.json(
        { message: "Driver profile already exists" },
        { status: 400 }
      );
    }

    await prisma.driver.create({
      data: {
        userId: decoded.id,
        licenseNo,
        vehicleModel,
        vehiclePlate,
      },
    });

    return NextResponse.json({ message: "Onboarding complete!" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
