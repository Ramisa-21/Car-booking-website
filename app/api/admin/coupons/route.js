import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { id: "asc" },
    });

    return Response.json(coupons);
  } catch (err) {
    console.error("LOAD COUPONS ERROR:", err);
    return Response.json(
      { error: "Failed to load coupons" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const { code, discount, expiry } = await req.json();

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(), // ✅ FORCE CAPITAL LETTER
        discount: Number(discount),
        expiry: new Date(expiry),
        active: true,
      },
    });

    return Response.json({ success: true, coupon });
  } catch (err) {
    console.error("CREATE COUPON ERROR:", err);
    return Response.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
