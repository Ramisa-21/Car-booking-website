import prisma from "@/app/lib/prisma";

export async function PATCH(req, context) {
  try {
    const { id } = await context.params; // ✅ Next.js 16 fix
    const ticketId = parseInt(id, 10);

    await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status: "RESOLVED" },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("RESOLVE TICKET ERROR:", err);
    return Response.json(
      { error: "Failed to resolve ticket" },
      { status: 500 }
    );
  }
}
