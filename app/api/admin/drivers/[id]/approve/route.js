import prisma from "@/app/lib/prisma";

export async function PATCH(req, context) {
  try {
    const { params } = context;
    const { id } = await params; // ✅ REQUIRED IN NEXT 16

    const driverId = parseInt(id, 10);

    await prisma.driver.update({
      where: { id: driverId },
      data: { approved: true },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("APPROVE DRIVER ERROR:", err);
    return Response.json(
      { error: "Failed to approve driver" },
      { status: 500 }
    );
  }
}
