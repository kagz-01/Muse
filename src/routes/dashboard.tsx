import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, Plus, Sparkles } from "lucide-react";
import type { MuseRoom } from "../server/rooms";

interface SessionUser {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  isDemo: boolean;
}

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isRoomDetail = pathname.startsWith("/dashboard/rooms/");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [rooms, setRooms] = useState<MuseRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isRoomDetail) return;
    const controller = new AbortController();
    const loadDashboard = async () => {
      try {
        const sessionResponse = await fetch("/api/auth/session", {
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (sessionResponse.status === 401) {
          globalThis.location.replace("/");
          return;
        }
        if (!sessionResponse.ok) {
          throw new Error("Unable to verify your Muse session.");
        }

        const session = await sessionResponse.json() as SessionUser;
        const roomsResponse = await fetch("/api/rooms", {
          credentials: "same-origin",
          signal: controller.signal,
        });
        if (!roomsResponse.ok) {
          throw new Error(await roomsResponse.text() ||
            "Unable to load your rooms.");
        }

        const rooms = await roomsResponse.json() as MuseRoom[];
        if (!controller.signal.aborted) {
          setUser(session);
          setRooms(rooms);
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          console.error("Dashboard loading failed:", loadError);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load your dashboard.",
          );
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    void loadDashboard();
    return () => controller.abort();
  }, [isRoomDetail]);

  if (isRoomDetail) return <Outlet />;

  const handleCreateRoom = async (event: FormEvent<HTMLFormElement>) => {
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
        throw new Error(await response.text() || "Unable to create the room.");
      }

      const result = await response.json() as { room: MuseRoom };
      setRooms((currentRooms) => [result.room, ...currentRooms]);
      setRoomName("");
    } catch (createError) {
      console.error("Room creation failed:", createError);
      setError(
        createError instanceof Error
          ? createError.message
          : "Unable to create the room.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const displayName = user?.name?.trim() || user?.username || "Muse";

  return (
    <main className="min-h-screen bg-[var(--muse-bg)] px-5 py-8 text-[var(--muse-text)] md:px-10 md:py-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between border-b border-[var(--muse-border)] pb-6">
          <a className="text-xl font-bold tracking-tight" href="/">
            MUSE
          </a>
          <span className="rounded-full border border-[var(--muse-border)] px-4 py-2 text-xs uppercase tracking-widest text-[var(--muse-muted)]">
            {user?.isDemo ? "Guest session" : "Private workspace"}
          </span>
        </header>

        <section className="py-12 md:py-16">
          <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-canvas-primary">
            <Sparkles size={14} aria-hidden="true" />
            Your workspace
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
            Welcome, {displayName}.
          </h1>
          <p className="mt-4 max-w-2xl font-serif text-lg italic text-[var(--muse-muted)]">
            Gather the signals worth keeping. Your rooms are the starting point
            for everything you build in Muse.
          </p>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0">
            <div className="mb-5 flex items-end justify-between border-b border-[var(--muse-border)] pb-4">
              <div>
                <h2 className="text-2xl font-semibold">Your rooms</h2>
                <p className="mt-1 text-sm text-[var(--muse-muted)]">
                  {isLoading
                    ? "Loading your collection…"
                    : `${rooms.length} ${rooms.length === 1 ? "room" : "rooms"}`}
                </p>
              </div>
            </div>

            {isLoading
              ? (
                <p className="rounded-3xl border border-[var(--muse-border)] p-8 text-[var(--muse-muted)]">
                  Loading your workspace…
                </p>
              )
              : rooms.length === 0
              ? (
                <div className="rounded-3xl border border-dashed border-[var(--muse-border)] p-8 text-center">
                  <h3 className="text-lg font-semibold">A clear space to begin</h3>
                  <p className="mt-2 text-sm text-[var(--muse-muted)]">
                    Create a room for the ideas you want to collect and connect.
                  </p>
                </div>
              )
              : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {rooms.map((room) => (
                    <a
                      key={room.id}
                      href={`/rooms/${room.id}`}
                      className="rounded-3xl border border-[var(--muse-border)] bg-[var(--muse-surface)] p-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-widest text-[var(--muse-muted)]">
                            {room.category || "Room"}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold">
                            {room.emoji ? `${room.emoji} ` : ""}
                            {room.name}
                          </h3>
                        </div>
                        <ArrowRight
                          size={18}
                          className="mt-1 text-canvas-primary"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-3 line-clamp-2 min-h-10 text-sm text-[var(--muse-muted)]">
                        {room.description || "A new space for your signals."}
                      </p>
                      <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-widest text-[var(--muse-muted)]">
                        <span>{room.count} artifacts</span>
                        <span>{room.isPublic ? "Public" : "Private"}</span>
                      </div>
                    </a>
                  ))}
                </div>
              )}
          </div>

          <aside className="h-fit rounded-3xl border border-[var(--muse-border)] bg-[var(--muse-surface)] p-6">
            <h2 className="text-lg font-semibold">Create a room</h2>
            <p className="mt-2 text-sm text-[var(--muse-muted)]">
              Give a new collection a name. You can shape its details as you
              add content.
            </p>
            <form className="mt-5 space-y-3" onSubmit={handleCreateRoom}>
              <label className="sr-only" htmlFor="new-room-name">
                Room name
              </label>
              <input
                id="new-room-name"
                autoComplete="off"
                maxLength={255}
                required
                value={roomName}
                onChange={(event) => setRoomName(event.currentTarget.value)}
                placeholder="e.g. Creative systems"
                className="w-full rounded-2xl border border-[var(--muse-border)] bg-black/20 px-4 py-3 text-sm outline-none transition focus:border-canvas-primary"
              />
              <button
                type="submit"
                disabled={isCreating || !roomName.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--muse-text)] px-4 py-3 text-xs font-bold uppercase tracking-widest text-[var(--muse-bg)] transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={15} aria-hidden="true" />
                {isCreating ? "Creating…" : "Create room"}
              </button>
            </form>
          </aside>
        </section>

        {error && (
          <p
            role="alert"
            className="mt-6 rounded-2xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </p>
        )}
      </div>
    </main>
  );
}
