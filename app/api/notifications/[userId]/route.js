import prisma from "@/app/lib/prisma";

export async function GET(req, context) {
  try {
    const { userId } = await context.params;

    const notifications = await prisma.notification.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(notifications);
  } catch (err) {
    console.error("FETCH NOTIFICATIONS ERROR:", err);
    return Response.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}
