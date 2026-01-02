import prisma from "@/app/lib/prisma";

export async function PATCH(req) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return Response.json(
        { error: "userId required" },
        { status: 400 }
      );
    }

    await prisma.notification.updateMany({
      where: {
        userId: Number(userId),
        seen: false,
      },
      data: {
        seen: true,
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("MARK SEEN ERROR:", err);
    return Response.json(
      { error: "Failed to mark seen" },
      { status: 500 }
    );
  }
}
