import prisma from "@/app/lib/prisma";

export async function PATCH(req, context) {
  try {
    const { params } = context;
    const { id } = await params; // ✅ Next.js 16 fix

    const couponId = parseInt(id, 10);

    await prisma.coupon.update({
      where: { id: couponId },
      data: { active: false },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("DEACTIVATE COUPON ERROR:", err);
    return Response.json(
      { error: "Failed to deactivate coupon" },
      { status: 500 }
    );
  }
}
