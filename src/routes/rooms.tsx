import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Plus, Search, Sparkles } from "lucide-react";
import type { MuseRoom } from "../server/rooms";

export const Route = createFileRoute("/rooms")({
  component: RoomsPage,
});

function RoomsPage() {
  const [rooms, setRooms] = useState<MuseRoom[]>([]);
  const [query, setQuery] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const session = await fetch("/api/auth/session", {
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (session.status === 401) {
          globalThis.location.replace("/");
          return;
        }
        if (!session.ok) throw new Error("Unable to verify your session.");

        const response = await fetch("/api/rooms", {
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(await response.text() || "Unable to load rooms.");
        }
        if (!controller.signal.aborted) {
          setRooms(await response.json() as MuseRoom[]);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(
            loadError instanceof Error ? loadError.message : "Unable to load rooms.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const createRoom = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = roomName.trim();
    if (!name) return;

    setIsCreating(true);
    setError("");
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!response.ok) {
        throw new Error(await response.text() || "Unable to create room.");
      }
      const result = await response.json() as { room: MuseRoom };
      setRooms((current) => [result.room, ...current]);
      setRoomName("");
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : "Unable to create room.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const visibleRooms = rooms.filter((room) => {
    const needle = query.trim().toLowerCase();
    return !needle ||
      room.name.toLowerCase().includes(needle) ||
      room.description?.toLowerCase().includes(needle) ||
      room.category?.toLowerCase().includes(needle);
  });

  return (
    <main className="min-h-screen bg-[var(--muse-bg)] px-5 py-8 text-[var(--muse-text)] md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-[var(--muse-border)] pb-6">
          <a href="/dashboard" className="text-xl font-bold tracking-tight">MUSE</a>
          <nav className="flex gap-5 text-xs font-bold uppercase tracking-widest text-[var(--muse-muted)]">
            <a href="/dashboard" className="hover:text-[var(--muse-text)]">Dashboard</a>
            <a href="/rooms" className="text-canvas-primary">Rooms</a>
          </nav>
        </header>

        <section className="flex flex-col gap-6 py-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-canvas-primary">
              <Sparkles size={14} aria-hidden="true" />
              Knowledge rooms
            </p>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Your collection.</h1>
          </div>
          <form onSubmit={createRoom} className="flex gap-2">
            <label className="sr-only" htmlFor="room-name">Room name</label>
            <input
              id="room-name"
              value={roomName}
              onChange={(event) => setRoomName(event.currentTarget.value)}
              placeholder="New room name"
              maxLength={255}
              className="w-56 rounded-full border border-[var(--muse-border)] bg-[var(--muse-surface)] px-4 py-3 text-sm outline-none focus:border-canvas-primary"
            />
            <button
              type="submit"
              disabled={isCreating || !roomName.trim()}
              className="flex h-12 items-center gap-2 rounded-full bg-[var(--muse-text)] px-5 text-xs font-bold uppercase tracking-widest text-[var(--muse-bg)] disabled:opacity-50"
            >
              <Plus size={15} aria-hidden="true" />
              Create
            </button>
          </form>
        </section>

        <div className="mb-6 flex items-center gap-3 rounded-full border border-[var(--muse-border)] px-4 py-3">
          <Search size={16} className="text-[var(--muse-muted)]" aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search rooms"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {error && (
          <p role="alert" className="mb-6 rounded-2xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        {isLoading ? (
          <p className="rounded-3xl border border-[var(--muse-border)] p-8 text-[var(--muse-muted)]">Loading rooms…</p>
        ) : visibleRooms.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--muse-border)] p-10 text-center">
            <h2 className="text-xl font-semibold">No rooms found</h2>
            <p className="mt-2 text-sm text-[var(--muse-muted)]">
              {query ? "Try a broader search." : "Create the first room for your signals."}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleRooms.map((room) => (
              <a
                key={room.id}
                href={`/rooms/${room.id}`}
                className="group min-h-72 rounded-[2rem] border border-[var(--muse-border)] bg-[var(--muse-surface)] p-6 transition hover:-translate-y-1 hover:border-canvas-primary/50"
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl" aria-hidden="true">{room.emoji || "◈"}</span>
                  <ArrowRight size={18} className="text-[var(--muse-muted)] transition group-hover:text-canvas-primary" />
                </div>
                <p className="mt-12 text-xs uppercase tracking-widest text-[var(--muse-muted)]">
                  {room.category || "Room"}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{room.name}</h2>
                <p className="mt-3 line-clamp-3 text-sm text-[var(--muse-muted)]">
                  {room.description || "A new space for your signals."}
                </p>
                <p className="mt-6 text-xs uppercase tracking-widest text-[var(--muse-muted)]">
                  {room.count} artifacts · {room.isPublic ? "Public" : "Private"}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
