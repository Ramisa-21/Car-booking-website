import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { getDbConnection } from "../../lib/db";

// Helper: get user from JWT in Authorization header
async function getUserFromRequest(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET || "myprojectsecret123"
    );
    return payload; // { id, role, iat, exp }
  } catch (err) {
    console.error("JWT verify error:", err);
    return null;
  }
}

// GET /api/profile  -> return current user info
export async function GET(request) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conn = await getDbConnection();
    const [rows] = await conn.execute(
      "SELECT id, name, email, phone, role, createdAt, updatedAt FROM users WHERE id = ?",
      [payload.id]
    );
    await conn.end();

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: rows[0] }, { status: 200 });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 }
    );
  }
}

// PUT /api/profile  -> update name/phone, optional password change
export async function PUT(request) {
  try {
    const payload = await getUserFromRequest(request);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, phone, currentPassword, newPassword } =
      await request.json();

    const conn = await getDbConnection();

    // Fetch current user
    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE id = ?",
      [payload.id]
    );

    if (rows.length === 0) {
      await conn.end();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = rows[0];

    // If password change requested, verify currentPassword then update
    let passwordToSave = user.password;

    if (currentPassword && newPassword) {
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        await conn.end();
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      passwordToSave = await bcrypt.hash(newPassword, 10);
    }

    const updatedName = name ?? user.name;
    const updatedPhone = phone ?? user.phone;

    // Update user
    await conn.execute(
      "UPDATE users SET name = ?, phone = ?, password = ? WHERE id = ?",
      [updatedName, updatedPhone, passwordToSave, payload.id]
    );

    // Return updated data (without password)
    const [updatedRows] = await conn.execute(
      "SELECT id, name, email, phone, role, createdAt, updatedAt FROM users WHERE id = ?",
      [payload.id]
    );

    await conn.end();

    return NextResponse.json(
      {
        message: "Profile updated successfully",
        user: updatedRows[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
