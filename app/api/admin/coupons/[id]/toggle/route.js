import prisma from "@/app/lib/prisma";

export async function PATCH(req, { params }) {
  const coupon = await prisma.coupon.findUnique({
    where: { id: Number(params.id) },
  });

  const updated = await prisma.coupon.update({
    where: { id: Number(params.id) },
    data: { active: !coupon.active },
  });

  return Response.json({ success: true, coupon: updated });
}
