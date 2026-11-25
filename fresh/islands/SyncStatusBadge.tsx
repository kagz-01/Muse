import { useEffect, useState } from "preact/hooks";
import { subscribeToQueue } from "../utils/syncQueue.ts";

export default function SyncStatusBadge() {
  const [pendingCount, setPendingCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Listen for queue changes
    const unsubscribe = subscribeToQueue((count) => {
      setPendingCount(count);
    });

    // Listen for network status changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);
    globalThis.addEventListener("online", handleOnline);
    globalThis.addEventListener("offline", handleOffline);

    return () => {
      unsubscribe();
      globalThis.removeEventListener("online", handleOnline);
      globalThis.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (pendingCount === 0 && isOnline) {
    return null; // Hide when fully synced and online
  }

  return (
    <div
      class={`fixed bottom-4 right-4 px-3 py-1.5 rounded-full shadow-lg text-sm font-medium transition-all duration-300 z-50 flex items-center gap-2
        ${
        !isOnline
          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 backdrop-blur-md"
          : "bg-blue-500/10 text-blue-500 border border-blue-500/20 backdrop-blur-md"
      }`}
    >
      <div class="relative flex h-2.5 w-2.5">
        {!isOnline
          ? (
            <span class="absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75">
            </span>
          )
          : (
            <>
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75">
              </span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500">
              </span>
            </>
          )}
      </div>
      {!isOnline
        ? `Offline (${pendingCount} pending)`
        : `Syncing ${pendingCount} items...`}
    </div>
  );
}
