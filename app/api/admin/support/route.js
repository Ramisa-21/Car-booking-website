import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const tickets = await prisma.supportTicket.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json(tickets);
  } catch (err) {
    console.error("ADMIN SUPPORT LIST ERROR:", err);
    return Response.json(
      { error: "Failed to load support tickets" },
      { status: 500 }
    );
  }
}
