import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
<<<<<<< HEAD
=======
// 👇 RELATIVE path to app/lib/prisma.ts
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
import prisma from "../../../lib/prisma";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

<<<<<<< HEAD
    // Find user by email
=======
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

<<<<<<< HEAD
    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
=======
    const isMatch = await bcrypt.compare(password, user.password);

>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

<<<<<<< HEAD
    // Create JWT token
=======
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

<<<<<<< HEAD
    // Remove password from user object
    const { password: _pw, ...safeUser } = user;

    // Build Response
    const response = NextResponse.json(
      {
        message: "Login successful",
=======
    const { password: _pw, ...safeUser } = user;

    return NextResponse.json(
      {
        message: "Login successful",
        token,
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
        user: safeUser,
      },
      { status: 200 }
    );
<<<<<<< HEAD

    // Store JWT token in secure HttpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;

=======
>>>>>>> 1c1760b550f61ace28accbf13eadb3ff03a99cab
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
