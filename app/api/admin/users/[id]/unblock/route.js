import prisma from "@/app/lib/prisma";

export async function PATCH(req, { params }) {
  const { id } = params;

  const updated = await prisma.user.update({
    where: { id: Number(id) },
    data: { blocked: false },
  });

  return Response.json({ success: true, user: updated });
}
