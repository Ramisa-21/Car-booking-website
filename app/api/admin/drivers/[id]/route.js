// This file exists ONLY to activate the dynamic [id] segment.
// Without it, Next.js does NOT register nested routes like /approve, /block, etc.

export async function GET(req, { params }) {
  return Response.json({
    message: "Driver ID route active",
    id: params.id
  });
}
