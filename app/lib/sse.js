const clients = new Map();

export function addClient(userId, controller) {
  const key = String(userId);

  if (!clients.has(key)) {
    clients.set(key, []);
  }

  clients.get(key).push(controller);
}

export function removeClient(userId, controller) {
  const key = String(userId);
  const list = clients.get(key) || [];

  clients.set(
    key,
    list.filter((c) => c !== controller)
  );
}

export function pushSSE(userId, message) {
  const key = String(userId);
  const list = clients.get(key);

  if (!list || list.length === 0) return;

  const alive = [];

  for (const controller of list) {
    try {
      controller.enqueue(
        `data: ${JSON.stringify({ message })}\n\n`
      );
      alive.push(controller);
    } catch (err) {
      // ❌ controller already closed → silently ignore
    }
  }

  // keep only alive controllers
  clients.set(key, alive);
}
