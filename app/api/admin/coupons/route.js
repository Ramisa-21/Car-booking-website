import prisma from "@/app/lib/prisma";

export async function GET() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { id: "asc" },
  });
  return Response.json(coupons);
}

export async function POST(req) {
  const { code, discount, expiry } = await req.json();

  const coupon = await prisma.coupon.create({
    data: {
      code,
      discount: Number(discount),
      expiry: new Date(expiry),
    },
  });

  return Response.json({ success: true, coupon });
}
