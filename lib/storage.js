// Storage wrapper for per-catchment snapshots, backed by a Redis store.
// Uses the standard REDIS_URL connection string (provided by Vercel's Redis /
// Upstash storage), via the `redis` client.
//
// Keys: snapshot:<catchmentId>  and  snapshot:index (list of catchment ids + meta)

import { createClient } from "redis";

const keyFor = (id) => `snapshot:${id}`;
const INDEX_KEY = "snapshot:index";

// In serverless (Vercel) we reuse a single connected client across invocations
// where the container is warm, and reconnect when it isn't.
let client;

async function getClient() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error("REDIS_URL is not set");

  if (client && client.isOpen) return client;

  client = createClient({ url });
  client.on("error", (err) => console.error("Redis client error:", err));
  if (!client.isOpen) await client.connect();
  return client;
}

export async function saveSnapshot(id, snapshot) {
  const c = await getClient();
  await c.set(keyFor(id), JSON.stringify(snapshot));
}

export async function getSnapshot(id) {
  const c = await getClient();
  const v = await c.get(keyFor(id));
  return v ? JSON.parse(v) : null;
}

export async function saveIndex(index) {
  const c = await getClient();
  await c.set(INDEX_KEY, JSON.stringify(index));
}

export async function getIndex() {
  const c = await getClient();
  const v = await c.get(INDEX_KEY);
  return v ? JSON.parse(v) : null;
}
