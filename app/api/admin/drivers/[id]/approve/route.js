import prisma from "@/app/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const id = Number(params.id);

    const updated = await prisma.driver.update({
      where: { id },
      data: { approved: true }
    });

    return Response.json({ success: true, driver: updated });
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    return Response.json({ error: "Approve failed" }, { status: 500 });
  }
}
