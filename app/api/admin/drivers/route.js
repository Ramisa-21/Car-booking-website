import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      include: { user: true },
      orderBy: { id: "asc" }
    });

    return Response.json(drivers);
  } catch (err) {
    console.error("DRIVER LIST ERROR:", err);
    return Response.json({ error: "Failed to load drivers" }, { status: 500 });
  }
}
