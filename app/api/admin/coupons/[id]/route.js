import prisma from "@/app/lib/prisma";

export async function DELETE(req, { params }) {
  await prisma.coupon.delete({
    where: { id: Number(params.id) },
  });

  return Response.json({ success: true });
}
