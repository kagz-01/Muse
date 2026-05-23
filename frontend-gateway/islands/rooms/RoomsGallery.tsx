// Use a simple record type for inline style objects
import { useMemo, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { type Room, roomsSignal, type RoomTheme } from "../../signals/rooms.ts";
import CreateRoomModal from "../modals/CreateRoomModal.tsx";
import VaultGateModal from "../modals/VaultGateModal.tsx";
import { isVaultUnlockedSignal } from "../../signals/vault.ts";

type RoomTab = "all" | "pinned" | "vault" | "archived" | "starred" | "collab";
type RoomSort = "latest" | "alphabetical";

const tabConfig: { id: RoomTab; label: string; helper: string }[] = [
  {
    id: "all",
    label: "All",
    helper: "Everything active (pinned rooms appear at top)",
  },
  {
    id: "pinned",
    label: "Pinned",
    helper: "Rooms you've marked to surface first",
  },
  {
    id: "vault",
    label: "Vault",
    helper: "Private chambers—only you can access these",
  },
  {
    id: "archived",
    label: "Archived",
    helper: "Stored away, but still available",
  },
  {
    id: "starred",
    label: "Starred",
    helper: "Rooms you've marked as important",
  },
  { id: "collab", label: "Collab", helper: "Public rooms you collaborate on" },
];

const sortOptions: { id: RoomSort; label: string }[] = [
  { id: "latest", label: "Latest" },
  { id: "alphabetical", label: "A-Z" },
];

const surfaceClass =
  "border border-[var(--muse-border)] bg-[var(--muse-surface)]";
const softSurfaceClass =
  "border border-[var(--muse-border)] bg-[var(--muse-surface-soft)]";
const textClass = "text-[var(--muse-text)]";
const mutedClass = "text-[var(--muse-muted)]";

function RoomActionButton({
  variant,
  label,
  active,
  onClick,
}: {
  variant: "pin" | "star" | "archive" | "sparkles";
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  const Icon = variant === "pin"
    ? Icons.Pin
    : variant === "star"
    ? Icons.Star
    : variant === "archive"
    ? Icons.Archive
    : Icons.Aperture;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`group relative flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
        active
          ? "border-white/20 bg-white/15 text-white"
          : "border-[var(--muse-border)] bg-[var(--muse-surface)] text-[var(--muse-muted)] hover:border-white/20 hover:text-white hover:bg-white/5"
      }`}
    >
      <Icon size={12} className={active ? "text-white" : "text-current"} />
      <span className="absolute right-full mr-2 px-2 py-1 rounded bg-black/80 text-white text-[10px] font-bold uppercase tracking-widest whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-white/10 z-20">
        {label}
      </span>
    </button>
  );
}

function RoomCard({
  room,
  pinned,
  starred,
  archived,
  onOpen,
  onPin,
  onStar,
  onArchive,
}: {
  room: Room;
  pinned: boolean;
  starred: boolean;
  archived: boolean;
  onOpen: () => void;
  onPin: () => void;
  onStar: () => void;
  onArchive: () => void;
}) {
  const baseHexMap: Record<RoomTheme, string> = {
    indigo: "#6366f1",
    emerald: "#10b981",
    rose: "#f43f5e",
    amber: "#f59e0b",
    cyan: "#06b6d4",
    slate: "#64748b",
  };
  const hex = room.customThemeHex || baseHexMap[room.themeColor as RoomTheme] ||
    baseHexMap.indigo;
  const glowStyle: Record<string, string> = {
    boxShadow: `0 20px 60px ${hex}33`,
    background: `linear-gradient(135deg, ${hex}22, transparent)`,
  };

  return (
    <div
      onClick={onOpen}
      className={`group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-[2.5rem] border border-[var(--muse-border)] text-[var(--muse-text)] transition-all duration-500 cursor-pointer`}
      style={glowStyle}
    >
      {room.isVault && !isVaultUnlockedSignal.value && (
        <div className="absolute top-4 right-4 z-20 rounded-md border border-[var(--muse-border)] bg-[var(--muse-surface-soft)] p-2">
          <Icons.Lock size={14} />
        </div>
      )}
      {/* Background Image - Always Visible but Subtle */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
        {room.coverImage
          ? (
            <img
              src={room.coverImage}
              className="h-full w-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
              alt=""
            />
          )
          : room.customThemeHex
          ? (
            <div
              className="h-full w-full opacity-40"
              style={{
                background:
                  `linear-gradient(135deg, ${room.customThemeHex}40, transparent)`,
              }}
            />
          )
          : (
            <div
              className="h-full w-full opacity-20"
              style={{
                background: `linear-gradient(135deg, ${hex}22, transparent)`,
              }}
            />
          )}
        <div className="absolute inset-0 room-image-overlay" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="mb-4 flex items-center gap-2">
              <span
                className={`inline-block w-2 h-2 rounded-full animate-pulse `}
                style={{ backgroundColor: room.customThemeHex || undefined }}
              >
              </span>
              <span className="rounded-full border border-[var(--muse-border)] bg-[var(--muse-surface-soft)] px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--muse-muted)]">
                {room.isPublic ? "Open room" : "Private room"}
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-[var(--muse-text)] group-hover:text-canvas-primary transition-colors duration-300">
              {room.name}
            </h3>
          </div>
          <div className="flex flex-col gap-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300">
            <RoomActionButton
              variant="star"
              label="Star room"
              active={starred}
              onClick={onStar}
            />
            <RoomActionButton
              variant="archive"
              label="Archive room"
              active={archived}
              onClick={onArchive}
            />
            <RoomActionButton
              variant="pin"
              label={pinned ? "Unpin room" : "Pin room"}
              active={pinned}
              onClick={onPin}
            />
          </div>
        </div>

        <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <p className="mt-4 line-clamp-2 text-sm text-[var(--muse-muted)] font-serif italic leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
            {room.description ||
              "A curated space for your digital consciousness."}
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-[var(--muse-border)] pt-5">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-0.5">
                  Artifacts
                </span>
                <span className="text-xs font-bold text-[var(--muse-text)]">
                  {room.count}
                </span>
              </div>
              <div className="w-px h-6 bg-[var(--muse-border)]" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-0.5">
                  Theme
                </span>
                <span
                  className={`text-xs font-bold uppercase`}
                  style={{ color: room.customThemeHex || undefined }}
                >
                  {room.customThemeHex ? "Custom" : room.themeColor}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--muse-surface-soft)] border border-[var(--muse-border)] flex items-center justify-center text-[var(--muse-text)] group-hover:bg-[var(--muse-text)] group-hover:text-[var(--muse-bg)] transition-all duration-500">
              <Icons.ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoomsGallery() {
  const rooms = roomsSignal.value;
  const [showCreate, setShowCreate] = useState(false);
  const [activeTab, setActiveTab] = useState<RoomTab>("all");
  const [sortBy, setSortBy] = useState<RoomSort>("latest");
  const [pinnedIds, setPinnedIds] = useState<string[]>(
    rooms.slice(0, 2).map((room) => room.id),
  );
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  const roomOrder = useMemo(
    () => new Map(rooms.map((room, index) => [room.id, index])),
    [rooms],
  );

  const activeRooms = useMemo(
    () => rooms.filter((room) => !archivedIds.includes(room.id)),
    [rooms, archivedIds],
  );
  const archivedRooms = useMemo(
    () => rooms.filter((room) => archivedIds.includes(room.id)),
    [rooms, archivedIds],
  );
  const vaultRooms = useMemo(
    () => activeRooms.filter((room) => !room.isPublic),
    [activeRooms],
  );
  const collabRooms = useMemo(
    () => activeRooms.filter((room) => room.isPublic),
    [activeRooms],
  );
  const starredRooms = useMemo(
    () => activeRooms.filter((room) => starredIds.includes(room.id)),
    [activeRooms, starredIds],
  );

  const tabRooms = useMemo(() => {
    switch (activeTab) {
      case "pinned":
        return activeRooms.filter((room) => pinnedIds.includes(room.id));
      case "vault":
        return vaultRooms;
      case "archived":
        return archivedRooms;
      case "starred":
        return starredRooms;
      case "collab":
        return collabRooms;
      default: // "all"
        return activeRooms;
    }
  }, [
    activeTab,
    activeRooms,
    archivedRooms,
    collabRooms,
    starredRooms,
    vaultRooms,
    pinnedIds,
  ]);

  const sortedRooms = useMemo(() => {
    const list = [...tabRooms];
    switch (sortBy) {
      case "alphabetical":
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case "latest":
      default:
        return list.sort((a, b) =>
          (roomOrder.get(b.id) ?? 0) - (roomOrder.get(a.id) ?? 0)
        );
    }
  }, [roomOrder, sortBy, tabRooms]);

  const pinnedRooms = useMemo(
    () =>
      activeRooms.filter((room) => pinnedIds.includes(room.id)).sort((a, b) =>
        (roomOrder.get(a.id) ?? 0) - (roomOrder.get(b.id) ?? 0)
      ),
    [activeRooms, pinnedIds, roomOrder],
  );

  const visibleRooms = useMemo(() => {
    // When in "all" tab, exclude pinned rooms from the main grid (they show separately above)
    // For other tabs, show all rooms that match the tab filter
    if (activeTab === "all") {
      return sortedRooms.filter((room) => !pinnedIds.includes(room.id));
    }
    return sortedRooms;
  }, [sortedRooms, activeTab, pinnedIds]);

  const togglePin = (id: string) => {
    setPinnedIds((current) =>
      current.includes(id)
        ? current.filter((roomId) => roomId !== id)
        : [...current, id]
    );
  };

  const toggleStar = (id: string) => {
    setStarredIds((current) =>
      current.includes(id)
        ? current.filter((roomId) => roomId !== id)
        : [...current, id]
    );
  };

  const toggleArchive = (id: string) => {
    setArchivedIds((current) => {
      const isArchiving = !current.includes(id);
      if (isArchiving) {
        setPinnedIds((pins) => pins.filter((roomId) => roomId !== id));
        setStarredIds((stars) => stars.filter((roomId) => roomId !== id));
        return [...current, id];
      }
      return current.filter((roomId) => roomId !== id);
    });
  };

  const openRoom = (id: string) => {
    const room = rooms.find((r) => r.id === id);
    if (!room) return;
    if (room.isVault && !isVaultUnlockedSignal.value) {
      setVaultToUnlock(id);
      return;
    }

    globalThis.location.href = `/rooms/${id}`;
  };

  const [vaultToUnlock, setVaultToUnlock] = useState<string | null>(null);

  const onVaultUnlocked = (id?: string) => {
    // After unlocking, navigate into the room
    if (id) globalThis.location.href = `/rooms/${id}`;
    else if (vaultToUnlock) {
      globalThis.location.href = `/rooms/${vaultToUnlock}`;
    }
  };

  return (
    <>
      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
      {vaultToUnlock && (
        <VaultGateModal
          onClose={() => setVaultToUnlock(null)}
          onUnlock={() => onVaultUnlocked(vaultToUnlock ?? undefined)}
        />
      )}

      <div className="w-full max-w-none px-6 md:px-10 pb-32 md:pb-28 space-y-12">
        <section
          className={`relative overflow-hidden rounded-[3rem] ${surfaceClass} p-10 md:p-16 shadow-2xl`}
        >
          <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-canvas-primary/15 to-transparent blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none [background-image:radial-gradient(circle_at_20%_20%,var(--muse-text)_1px,transparent_1px)] [background-size:36px_36px]" />

          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div
                className={`inline-flex items-center rounded-full ${softSurfaceClass} px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-canvas-primary`}
              >
                Collect your thoughts
              </div>
              <h1
                className={`mt-8 max-w-4xl text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] ${textClass}`}
              >
                Rooms that welcome the mind.
                <span className="mt-3 block max-w-3xl text-4xl md:text-6xl italic font-serif text-canvas-primary bg-gradient-to-r from-canvas-primary to-indigo-400 bg-clip-text text-transparent">
                  Curate your digital soul.
                </span>
              </h1>
              <p
                className={`mt-8 max-w-3xl text-lg md:text-xl leading-relaxed font-serif italic border-l-2 ${mutedClass} border-[var(--muse-border)] pl-8`}
              >
                Your rooms are not bins. They are chambers of attention, built
                to hold the artifacts that matter and present them with quiet
                gravity. Each room should feel discovered from a distance,
                entered with intention, and remembered as a place where your
                thinking finally had architecture.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="group relative w-full lg:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-[var(--muse-text)] px-10 py-6 text-[13px] font-bold uppercase tracking-[0.2em] text-[var(--muse-bg)] shadow-[0_20px_50px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-2 hover:shadow-[0_50px_100px_rgba(0,0,0,0.4)] hover:scale-110 active:scale-95 animate-in fade-in slide-in-from-bottom-4 duration-700 overflow-hidden"
              >
                {/* Animated background shimmer */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />

                {/* Animated glow ring */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-offset-2 ring-offset-[var(--muse-bg)] ring-[var(--muse-text)] opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300 -z-10" />

                <span className="inline-block group-hover:animate-bounce">
                  +
                </span>{" "}
                Create a Room
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className={`rounded-[1.75rem] ${softSurfaceClass} p-5`}>
              <div className="flex flex-wrap items-center gap-2">
                {tabConfig.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeTab === tab.id
                        ? "border-canvas-primary/40 bg-canvas-primary/15 text-canvas-primary"
                        : "border-[var(--muse-border)] bg-[var(--muse-surface)] text-[var(--muse-muted)] hover:border-canvas-primary/25 hover:text-[var(--muse-text)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--muse-muted)]">
                {tabConfig.find((tab) => tab.id === activeTab)?.helper}
              </p>
            </div>

            <div className={`rounded-[1.75rem] ${softSurfaceClass} p-5`}>
              <div className="flex flex-wrap items-center gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSortBy(option.id)}
                    className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      sortBy === option.id
                        ? "border-canvas-primary/30 bg-canvas-primary text-[var(--muse-bg)]"
                        : "border-[var(--muse-border)] bg-[var(--muse-surface)] text-[var(--muse-muted)] hover:border-canvas-primary/25 hover:text-[var(--muse-text)]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--muse-muted)]">
                Compact carousel view: 5-6 rooms across, scroll horizontally.
              </p>
            </div>
          </div>
        </section>

        {pinnedRooms.length > 0 && activeTab === "all" && (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3 px-1">
              <div>
                <h2 className={`text-xl font-bold tracking-tight ${textClass}`}>
                  Pinned Rooms
                </h2>
                <p className={`text-sm font-serif italic ${mutedClass}`}>
                  The first rooms people should notice when they arrive.
                </p>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                {pinnedRooms.length} pinned
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {pinnedRooms.map((room) => (
                <div key={room.id} className="flex-shrink-0 w-80">
                  <RoomCard
                    room={room}
                    pinned
                    starred={starredIds.includes(room.id)}
                    archived={archivedIds.includes(room.id)}
                    onOpen={() =>
                      openRoom(room.id)}
                    onPin={() =>
                      togglePin(room.id)}
                    onStar={() => toggleStar(room.id)}
                    onArchive={() => toggleArchive(room.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section
          className={`space-y-4 rounded-[2rem] ${softSurfaceClass} p-5 md:p-6`}
        >
          <div className="flex items-center justify-between gap-3 border-b border-[var(--muse-border)] pb-4">
            <div>
              <h2 className={`text-2xl font-bold tracking-tight ${textClass}`}>
                {activeTab === "archived"
                  ? "Archived Rooms"
                  : activeTab === "vault"
                  ? "Vault Rooms"
                  : activeTab === "starred"
                  ? "Starred Rooms"
                  : activeTab === "collab"
                  ? "Collab Rooms"
                  : activeTab === "pinned"
                  ? "Pinned Rooms"
                  : "All Rooms"}
              </h2>
              <p className={`mt-1 text-sm font-serif italic ${mutedClass}`}>
                {activeTab === "archived"
                  ? "Stored away, but still available when needed."
                  : activeTab === "vault"
                  ? "Private chambers—only you can access these."
                  : activeTab === "starred"
                  ? "Rooms you've marked as important and worth revisiting."
                  : activeTab === "collab"
                  ? "Public rooms you collaborate on with others. Share thoughts, weave context."
                  : activeTab === "pinned"
                  ? "Rooms you've pinned to surface first when viewing all your chambers."
                  : "Your active room system—all non-archived chambers, with pinned rooms at the top."}
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
              <Icons.ArrowRight size={12} className="text-canvas-primary" />
              {visibleRooms.length} rooms
            </div>
          </div>

          {visibleRooms.length === 0
            ? (
              <div
                className={`flex min-h-[260px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-[var(--muse-border)] bg-[var(--muse-surface)] px-6 text-center`}
              >
                <div
                  className={`mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--muse-border)] bg-[var(--muse-surface-soft)] ${textClass}`}
                >
                  <Icons.Aperture size={20} />
                </div>
                <h3 className={`text-xl font-bold ${textClass}`}>
                  No rooms in this tab yet
                </h3>
                <p
                  className={`mt-2 max-w-md text-sm font-serif italic leading-relaxed ${mutedClass}`}
                >
                  This chamber will fill as you begin pinning, archiving,
                  starring, and sharing rooms with purpose.
                </p>
              </div>
            )
            : (
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {visibleRooms.map((room) => (
                  <div key={room.id} className="flex-shrink-0 w-80">
                    <RoomCard
                      room={room}
                      pinned={pinnedIds.includes(room.id)}
                      starred={starredIds.includes(room.id)}
                      archived={archivedIds.includes(room.id)}
                      onOpen={() =>
                        openRoom(room.id)}
                      onPin={() =>
                        togglePin(room.id)}
                      onStar={() => toggleStar(room.id)}
                      onArchive={() => toggleArchive(room.id)}
                    />
                  </div>
                ))}

                <button
                  onClick={() => setShowCreate(true)}
                  type="button"
                  className="flex-shrink-0 w-80 min-h-[270px] rounded-[2rem] border-2 border-dashed border-[var(--muse-border)] bg-transparent p-6 text-left transition-all hover:border-canvas-primary/25 hover:bg-[var(--muse-surface)] cursor-pointer"
                >
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-[var(--muse-border)] text-[var(--muse-muted)] transition-colors group-hover:border-[var(--muse-text)]">
                      <Icons.Plus size={24} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                      Create a room
                    </span>
                    <p className="mt-2 text-xs text-[var(--muse-muted)] font-serif italic">
                      Start with a chamber, then shape its atmosphere.
                    </p>
                  </div>
                </button>
              </div>
            )}
          {/* Collab tab now uses one surface: shared rooms only. */}
          {activeTab === "collab" && (
            <div
              className={`mt-8 space-y-4 rounded-[2rem] ${softSurfaceClass} p-5 md:p-6`}
            >
              <div className="flex items-center justify-between gap-3 border-b border-[var(--muse-border)] pb-4">
                <div>
                  <h2
                    className={`text-2xl font-bold tracking-tight ${textClass}`}
                  >
                    Collab Rooms
                  </h2>
                  <p className={`mt-1 text-sm font-serif italic ${mutedClass}`}>
                    Collaboration and collab rooms now share the same surface.
                  </p>
                </div>
                <Icons.Users size={18} className="text-canvas-primary" />
              </div>

              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {collabRooms.map((room) => (
                  <div key={room.id} className="flex-shrink-0 w-80">
                    <RoomCard
                      room={room}
                      pinned={pinnedIds.includes(room.id)}
                      starred={starredIds.includes(room.id)}
                      archived={archivedIds.includes(room.id)}
                      onOpen={() =>
                        openRoom(room.id)}
                      onPin={() =>
                        togglePin(room.id)}
                      onStar={() => toggleStar(room.id)}
                      onArchive={() => toggleArchive(room.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
