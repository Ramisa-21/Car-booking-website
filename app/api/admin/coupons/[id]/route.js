import prisma from "@/app/lib/prisma";

export async function DELETE(req, context) {
  try {
    const { params } = context;
    const { id } = await params; // ✅ Next.js 16 fix

    const couponId = parseInt(id, 10);

    // 1️⃣ delete all redemptions first (FK safe)
    await prisma.couponRedemption.deleteMany({
      where: { couponId },
    });

    // 2️⃣ delete coupon (same idea as driver reject)
    await prisma.coupon.delete({
      where: { id: couponId },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("DELETE COUPON ERROR:", err);
    return Response.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
