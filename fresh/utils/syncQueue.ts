/**
 * syncQueue.ts
 * -----------
 * Offline-first sync queue. Stores failed write operations in localStorage
 * and replays them automatically when the user reconnects.
 */

const QUEUE_KEY = "muse_sync_queue";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

export type SyncMethod = "POST" | "PUT" | "DELETE" | "PATCH";
export type SyncEntity = "journal" | "room" | "thread" | "item" | "settings" | "streak";

export interface SyncOperation {
  /** Unique ID for this queued operation */
  id: string;
  /** The HTTP method */
  method: SyncMethod;
  /** The API URL to call */
  url: string;
  /** The request body payload (for POST/PUT) */
  payload?: unknown;
  /** Which signal entity this affects */
  entity: SyncEntity;
  /** Timestamp the op was queued */
  queuedAt: number;
  /** Number of retry attempts so far */
  retryCount: number;
  /** If true, the op has been tried MAX_RETRIES times and failed with a server error */
  failed?: boolean;
  /**
   * Optional temp ID (for POST operations) — the local signal was given a
   * temporary ID. Once replayed, we get the real server ID back.
   */
  tempId?: string;
}

// ─── Storage helpers ───────────────────────────────────────────────────────

function readQueue(): SyncOperation[] {
  try {
    const raw = globalThis.localStorage?.getItem(QUEUE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SyncOperation[];
  } catch {
    return [];
  }
}

function writeQueue(ops: SyncOperation[]): void {
  try {
    globalThis.localStorage?.setItem(QUEUE_KEY, JSON.stringify(ops));
  } catch { /* quota exceeded — silently ignore */ }
}

// ─── Public API ────────────────────────────────────────────────────────────

/** Add a failed operation to the pending sync queue. */
export function pushToQueue(
  op: Omit<SyncOperation, "id" | "queuedAt" | "retryCount">,
): SyncOperation {
  const entry: SyncOperation = {
    ...op,
    id: crypto.randomUUID(),
    queuedAt: Date.now(),
    retryCount: 0,
  };
  const queue = readQueue();
  queue.push(entry);
  writeQueue(queue);
  notifyQueueChanged();
  return entry;
}

/** Remove a specific operation from the queue by ID. */
export function removeFromQueue(id: string): void {
  const queue = readQueue().filter((op) => op.id !== id);
  writeQueue(queue);
  notifyQueueChanged();
}

/** Get the count of pending (non-failed) operations. */
export function getQueueCount(): number {
  return readQueue().filter((op) => !op.failed).length;
}

/** Get all pending operations. */
export function getQueue(): SyncOperation[] {
  return readQueue();
}

/** Clear all operations from the queue. */
export function clearQueue(): void {
  writeQueue([]);
  notifyQueueChanged();
}

// ─── Flush / Replay ────────────────────────────────────────────────────────

/** Callbacks to call when a POST succeeds and we have a real server ID to swap in. */
const idSwapCallbacks: Map<
  SyncEntity,
  (tempId: string, realId: string) => void
> = new Map();

/** Register a callback that swaps out a temp ID when a POST is replayed. */
export function registerIdSwapCallback(
  entity: SyncEntity,
  callback: (tempId: string, realId: string) => void,
): void {
  idSwapCallbacks.set(entity, callback);
}

let isFlushing = false;

/**
 * Attempt to replay all queued operations against the backend.
 * Called automatically when `online` event fires.
 */
export async function flushQueue(): Promise<void> {
  if (isFlushing) return;
  isFlushing = true;

  const queue = readQueue();
  const remaining: SyncOperation[] = [];

  for (const op of queue) {
    if (op.failed) {
      remaining.push(op);
      continue;
    }

    try {
      const response = await fetch(op.url, {
        method: op.method,
        headers: op.payload ? { "Content-Type": "application/json" } : {},
        body: op.payload ? JSON.stringify(op.payload) : undefined,
      });

      if (response.ok) {
        // If this was a POST with a temp ID, fire the swap callback
        if (op.method === "POST" && op.tempId) {
          try {
            const data = await response.json();
            const realId = data?.entry?.id ?? data?.room?.id ??
              data?.thread?.id ?? data?.item?.id;
            if (realId) {
              const cb = idSwapCallbacks.get(op.entity);
              if (cb) cb(op.tempId, realId);
            }
          } catch { /* ignore swap errors */ }
        }
        // Successfully replayed — don't add back to queue
      } else if (response.status >= 400 && response.status < 500) {
        // Client error (e.g. 404, 403) — don't retry, mark as failed
        remaining.push({ ...op, failed: true });
      } else {
        // Server error — increment retry count and keep
        const updated = { ...op, retryCount: op.retryCount + 1 };
        if (updated.retryCount >= MAX_RETRIES) {
          remaining.push({ ...updated, failed: true });
        } else {
          remaining.push(updated);
        }
      }
    } catch (_networkErr) {
      // Still offline — keep in queue with incremented retry
      const updated = { ...op, retryCount: op.retryCount + 1 };
      remaining.push(updated);
    }

    // Small delay between replays to avoid hammering the server
    await new Promise((r) => setTimeout(r, 300));
  }

  writeQueue(remaining);
  notifyQueueChanged();
  isFlushing = false;
}

// ─── Event bus (so the UI badge can reactively update) ─────────────────────

type QueueListener = (count: number) => void;
const queueListeners: Set<QueueListener> = new Set();

export function subscribeToQueue(listener: QueueListener): () => void {
  queueListeners.add(listener);
  return () => queueListeners.delete(listener);
}

function notifyQueueChanged(): void {
  const count = getQueueCount();
  queueListeners.forEach((fn) => fn(count));
}

// ─── Auto-sync on reconnect ────────────────────────────────────────────────

let syncListenerAttached = false;

/**
 * Call once at app boot. Attaches the `online` event listener and schedules
 * an immediate flush attempt if there are pending ops.
 */
export function startSyncListener(): void {
  if (
    syncListenerAttached || typeof globalThis.addEventListener !== "function"
  ) {
    return;
  }
  syncListenerAttached = true;

  globalThis.addEventListener("online", () => {
    setTimeout(() => {
      if (getQueueCount() > 0) {
        flushQueue();
      }
    }, RETRY_DELAY_MS);
  });

  // If there are queued ops from a previous session, try to flush immediately
  if (getQueueCount() > 0 && globalThis.navigator?.onLine) {
    flushQueue();
  }
}
