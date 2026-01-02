import prisma from "@/app/lib/prisma";

export async function PATCH(req, context) {
  try {
    const { params } = context;
    const { id } = await params; // ✅ REQUIRED IN NEXT.JS 16

    const couponId = parseInt(id, 10);

    // 1️⃣ Get current coupon
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      return Response.json(
        { error: "Coupon not found" },
        { status: 404 }
      );
    }

    // 2️⃣ Toggle active status
    await prisma.coupon.update({
      where: { id: couponId },
      data: { active: !coupon.active },
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("TOGGLE COUPON ERROR:", err);
    return Response.json(
      { error: "Failed to toggle coupon" },
      { status: 500 }
    );
  }
}
