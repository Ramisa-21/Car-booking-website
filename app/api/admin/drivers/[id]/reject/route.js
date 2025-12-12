import prisma from "@/app/lib/prisma";

export async function PATCH(req, { params }) {
  try {
    const id = Number(params.id);

    const updated = await prisma.driver.update({
      where: { id },
      data: { approved: false }
    });

    return Response.json({ success: true, driver: updated });
  } catch (err) {
    console.error("REJECT ERROR:", err);
    return Response.json({ error: "Reject failed" }, { status: 500 });
  }
}
