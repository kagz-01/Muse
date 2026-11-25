import { signal } from "@preact/signals";
import { startSyncListener } from "../utils/syncQueue.ts";

export const isOnlineSignal = signal(true);

// Only run in the browser
if (
  typeof globalThis.window !== "undefined" &&
  typeof globalThis.navigator !== "undefined"
) {
  isOnlineSignal.value = globalThis.navigator.onLine;

  globalThis.addEventListener("online", () => {
    isOnlineSignal.value = true;
  });

  globalThis.addEventListener("offline", () => {
    isOnlineSignal.value = false;
  });

  // Start listening for reconnects to flush the sync queue
  startSyncListener();
}
