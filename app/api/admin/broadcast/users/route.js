import prisma from "@/app/lib/prisma";
import { pushSSE } from "@/app/lib/sse";

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // 1️⃣ Get all USERS
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      select: { id: true },
    });

    // 2️⃣ Send notification to each user
    for (const user of users) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          message,
        },
      });

      // Realtime (best-effort)
      try {
        pushSSE(user.id, message);
      } catch (e) {}
    }

    return Response.json({
      success: true,
      sentTo: users.length,
    });
  } catch (err) {
    console.error("ADMIN BROADCAST ERROR:", err);
    return Response.json(
      { error: "Broadcast failed" },
      { status: 500 }
    );
  }
}
