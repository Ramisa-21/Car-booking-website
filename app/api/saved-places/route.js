import prisma from "../../lib/prisma";

export async function GET(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const userId = parseInt(token); // replace with real token decoding

  try {
    const places = await prisma.savedPlace.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return new Response(JSON.stringify(places));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const userId = parseInt(token);
  const { label, address, coordsLat, coordsLng } = await req.json();

  if (!label || !address || !coordsLat || !coordsLng)
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

  try {
    const place = await prisma.savedPlace.create({
      data: { label, address, coordsLat, coordsLng, userId },
    });
    return new Response(JSON.stringify(place));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function PUT(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const userId = parseInt(token);
  const { id, label, address, coordsLat, coordsLng } = await req.json();

  if (!id || !label || !address || !coordsLat || !coordsLng)
    return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });

  try {
    const updated = await prisma.savedPlace.updateMany({
      where: { id, userId },
      data: { label, address, coordsLat, coordsLng },
    });
    return new Response(JSON.stringify(updated));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function DELETE(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const userId = parseInt(token);
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id"));

  if (!id) return new Response(JSON.stringify({ error: "Missing place ID" }), { status: 400 });

  try {
    await prisma.savedPlace.deleteMany({
      where: { id, userId },
    });
    return new Response(JSON.stringify({ success: true }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
