import prisma from "@/app/lib/prisma";

export async function PATCH(req, context) {
  try {
    const { params } = context;
    const { id } = await params;

    const couponId = parseInt(id, 10);

    await prisma.coupon.update({
      where: { id: couponId },
      data: { active: true },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("ACTIVATE COUPON ERROR:", err);
    return Response.json(
      { error: "Failed to activate coupon" },
      { status: 500 }
    );
  }
}
