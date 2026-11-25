import { pushToQueue, SyncEntity, SyncMethod } from "./syncQueue.ts";

export interface SafeFetchOptions extends RequestInit {
  entity: SyncEntity;
  tempId?: string;
}

/**
 * A wrapper around `fetch` that automatically queues failed write operations
 * (POST, PUT, DELETE) if the network is offline or unreachable.
 *
 * If a network error occurs, it returns a synthetic successful Response so the
 * caller (optimistic UI) can proceed as if the operation succeeded.
 */
export async function safeFetch(
  url: string,
  options: SafeFetchOptions,
): Promise<Response> {
  const method = (options.method || "GET").toUpperCase() as SyncMethod;
  const isWrite = ["POST", "PUT", "DELETE", "PATCH"].includes(method);

  try {
    const response = await fetch(url, options);

    // If it's a server error (500s) we might want to queue it, but usually
    // we only queue network failures. Let's just return the response and let
    // the caller handle HTTP errors. The queue will handle its own retries later.
    return response;
  } catch (error) {
    // TypeError is typically thrown for network errors (Failed to fetch)
    if (isWrite && error instanceof TypeError) {
      console.warn(`[safeFetch] Network offline. Queuing ${method} ${url}`);

      // Parse payload if present
      let payload: unknown = undefined;
      if (options.body && typeof options.body === "string") {
        try {
          payload = JSON.parse(options.body);
        } catch {
          /* keep as string if not JSON */
          payload = options.body;
        }
      }

      pushToQueue({
        method,
        url,
        payload,
        entity: options.entity,
        tempId: options.tempId,
      });

      // Return a synthetic successful response to keep the optimistic UI happy
      return new Response(JSON.stringify({ success: true, queued: true }), {
        status: 202, // Accepted
        headers: { "Content-Type": "application/json" },
      });
    }

    // Rethrow if it's a GET or not a network error
    throw error;
  }
}
