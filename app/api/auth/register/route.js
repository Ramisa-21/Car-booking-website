import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDbConnection } from "../../../lib/db";

export async function POST(request) {
  try {
    const { name, email, password, role, phone } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Name, email, password and role are required" },
        { status: 400 }
      );
    }

    const finalRole = ["USER", "DRIVER", "ADMIN"].includes(role)
      ? role
      : "USER";

    const conn = await getDbConnection();

    // check if email exists
    const [rows] = await conn.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (rows.length > 0) {
      await conn.end();
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const [result] = await conn.execute(
      "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
      [name, email, hashed, phone || null, finalRole]
    );

    await conn.end();

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: result.insertId,
          name,
          email,
          phone: phone || null,
          role: finalRole
        }
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


