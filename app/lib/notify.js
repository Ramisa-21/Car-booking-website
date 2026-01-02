import prisma from "@/app/lib/prisma";
import { pushSSE } from "@/app/lib/sse";

/**
 * Central notification helper
 * - Saves notification in DB (source of truth)
 * - Pushes realtime SSE (best effort)
 * - Never throws (must not break business logic)
 */
export async function notifyUser(userId, message) {
  if (!userId || !message) return;

  // 1️⃣ Save to database
  await prisma.notification.create({
    data: {
      userId: Number(userId),
      message,
    },
  });

  // 2️⃣ Realtime push (safe)
  try {
    pushSSE(userId, message);
  } catch (e) {
    // silently ignore SSE errors
  }
}
