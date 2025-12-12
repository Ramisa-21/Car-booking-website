import prisma from "@/app/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { id: "asc" },
  });

  return Response.json(users);
}
