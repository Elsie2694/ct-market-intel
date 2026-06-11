// Thin wrapper around Vercel KV for storing per-catchment snapshots.
// Keys: snapshot:<catchmentId>  and  snapshot:index (list of catchment ids + meta)

import { kv } from "@vercel/kv";

const keyFor = (id) => `snapshot:${id}`;
const INDEX_KEY = "snapshot:index";

export async function saveSnapshot(id, snapshot) {
  await kv.set(keyFor(id), snapshot);
}

export async function getSnapshot(id) {
  return (await kv.get(keyFor(id))) || null;
}

export async function saveIndex(index) {
  await kv.set(INDEX_KEY, index);
}

export async function getIndex() {
  return (await kv.get(INDEX_KEY)) || null;
}
