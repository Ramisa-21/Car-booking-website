import prisma from "@/app/lib/prisma";

export async function POST(req) {
  try {
    const { subject, message, userId } = await req.json();

    if (!subject || !message || !userId) {
      return Response.json(
        { error: "Subject, message, and userId are required" },
        { status: 400 }
      );
    }

    await prisma.supportTicket.create({
      data: {
        subject,
        message,
        userId: Number(userId),
      },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("SUPPORT ERROR:", err);
    return Response.json(
      { error: "Failed to submit support ticket" },
      { status: 500 }
    );
  }
}
