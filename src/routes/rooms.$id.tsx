import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import type { MuseRoom } from "../server/rooms";

export const Route = createFileRoute("/rooms/$id")({
  component: RoomDetailPage,
});

function RoomDetailPage() {
  const { id } = Route.useParams();
  const [room, setRoom] = useState<MuseRoom | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch(`/api/rooms/${encodeURIComponent(id)}`, {
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (response.status === 401) {
          globalThis.location.replace("/");
          return;
        }
        if (!response.ok) {
          throw new Error(await response.text() || "Room not found.");
        }
        const loaded = await response.json() as MuseRoom;
        if (!controller.signal.aborted) {
          setRoom(loaded);
          setName(loaded.name);
          setDescription(loaded.description || "");
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load room.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id]);

  const saveRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!room || !name.trim()) return;
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/rooms/${encodeURIComponent(id)}`, {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description }),
      });
      if (!response.ok) {
        throw new Error(await response.text() || "Unable to save room.");
      }
      const result = await response.json() as { room: MuseRoom };
      setRoom(result.room);
      setName(result.room.name);
      setDescription(result.room.description || "");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Unable to save room.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRoom = async () => {
    if (!room || !globalThis.confirm(`Delete "${room.name}"? This cannot be undone.`)) return;
    setError("");
    try {
      const response = await fetch(`/api/rooms/${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      if (!response.ok) {
        throw new Error(await response.text() || "Unable to delete room.");
      }
      globalThis.location.href = "/rooms";
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete room.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-[var(--muse-bg)] px-5 py-8 text-[var(--muse-text)] md:px-10 md:py-12">
      <div className="mx-auto max-w-5xl">
        <a
          href="/rooms"
          className="mb-8 flex w-fit items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
        >
          <ArrowLeft size={15} aria-hidden="true" />
          All rooms
        </a>

        {error && (
          <p role="alert" className="mb-6 rounded-2xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="rounded-3xl border border-[var(--muse-border)] p-8 text-[var(--muse-muted)]">Loading room…</p>
        ) : room ? (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <section>
              <p className="mb-4 text-xs uppercase tracking-[0.25em] text-canvas-primary">
                {room.category || "Room"}
              </p>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                {room.emoji ? `${room.emoji} ` : ""}{room.name}
              </h1>
              <p className="mt-5 max-w-2xl font-serif text-lg italic text-[var(--muse-muted)]">
                {room.description || "A new space for your signals."}
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-[var(--muse-border)] bg-[var(--muse-surface)] p-5">
                  <p className="text-xs uppercase tracking-widest text-[var(--muse-muted)]">Artifacts</p>
                  <p className="mt-2 text-3xl font-semibold">{room.count}</p>
                </div>
                <div className="rounded-3xl border border-[var(--muse-border)] bg-[var(--muse-surface)] p-5">
                  <p className="text-xs uppercase tracking-widest text-[var(--muse-muted)]">Visibility</p>
                  <p className="mt-2 text-lg font-semibold">{room.isPublic ? "Public" : "Private"}</p>
                </div>
                <div className="rounded-3xl border border-[var(--muse-border)] bg-[var(--muse-surface)] p-5">
                  <p className="text-xs uppercase tracking-widest text-[var(--muse-muted)]">Mood</p>
                  <p className="mt-2 text-lg font-semibold capitalize">{room.mood || "Focus"}</p>
                </div>
              </div>
            </section>

            <aside className="h-fit rounded-3xl border border-[var(--muse-border)] bg-[var(--muse-surface)] p-6">
              <h2 className="text-lg font-semibold">Room details</h2>
              <form className="mt-5 space-y-4" onSubmit={saveRoom}>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                  Name
                  <input
                    value={name}
                    onChange={(event) => setName(event.currentTarget.value)}
                    maxLength={255}
                    required
                    className="mt-2 w-full rounded-2xl border border-[var(--muse-border)] bg-black/20 px-4 py-3 text-sm normal-case tracking-normal text-[var(--muse-text)] outline-none focus:border-canvas-primary"
                  />
                </label>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                  Description
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.currentTarget.value)}
                    rows={5}
                    className="mt-2 w-full resize-none rounded-2xl border border-[var(--muse-border)] bg-black/20 px-4 py-3 text-sm normal-case tracking-normal text-[var(--muse-text)] outline-none focus:border-canvas-primary"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isSaving || !name.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--muse-text)] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[var(--muse-bg)] disabled:opacity-50"
                >
                  <Save size={15} aria-hidden="true" />
                  {isSaving ? "Saving…" : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={deleteRoom}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-red-400/30 px-4 py-3 text-xs font-bold uppercase tracking-widest text-red-300"
                >
                  <Trash2 size={15} aria-hidden="true" />
                  Delete room
                </button>
              </form>
            </aside>
          </div>
        ) : (
          <p className="rounded-3xl border border-[var(--muse-border)] p-8 text-[var(--muse-muted)]">Room not found.</p>
        )}
      </div>
    </main>
  );
}
