import { addClient, removeClient } from "@/app/lib/sse";

export async function GET(req) {
  const userId = req.nextUrl.searchParams.get("userId");

  if (!userId) {
    return new Response("UserId required", { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      addClient(userId, controller);
    },
    cancel(controller) {
      removeClient(userId, controller);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
