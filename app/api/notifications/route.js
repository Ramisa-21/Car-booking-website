import prisma from "@/app/lib/prisma";
// import { sendEmail } from "@/app/lib/mailer"; // keep commented for now
import { pushSSE } from "@/app/lib/sse";

export async function POST(req) {
  try {
    const { userId, message, email } = await req.json();

    if (!userId || !message) {
      return Response.json(
        { error: "userId and message required" },
        { status: 400 }
      );
    }

    // 1️⃣ Always save notification to DB (source of truth)
    await prisma.notification.create({
      data: {
        userId: Number(userId),
        message,
      },
    });

    // 2️⃣ Realtime alert (SSE) — NEVER allow this to crash API
    try {
      pushSSE(userId, message);
    } catch (e) {
      // silently ignore realtime failure
      // (client refresh / disconnect / dev reload)
    }

    // 3️⃣ Email (intentionally skipped for now)
    /*
    if (email) {
      await sendEmail({
        to: email,
        subject: "Ridemate Update",
        text: message,
      });
    }
    */

    return Response.json({ success: true });
  } catch (err) {
    console.error("NOTIFICATION ERROR:", err);
    return Response.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
