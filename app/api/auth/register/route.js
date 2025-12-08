import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
// 👇 same relative path as login
import prisma from "../../../lib/prisma";

export async function POST(request) {
  try {
    const { name, email, password, role, phone } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const allowedRoles = ["USER", "DRIVER", "ADMIN"];
    const finalRole = allowedRoles.includes(role) ? role : "USER";

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        phone: phone || null,
        role: finalRole,
      },
    });

    const { password: _pw, ...safeUser } = user;

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: safeUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
