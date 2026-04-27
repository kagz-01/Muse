import { useMemo, useState } from "preact/hooks";
import {
  ArrowRight,
  Archive,
  Globe,
  Layout,
  Layers,
  Lock,
  Pin,
  Plus,
  Sparkles,
  Star,
  Users,
} from "lucide-preact";
import { roomsSignal, type Room, type RoomTheme } from "../../signals/rooms.ts";
import { collaboratorsSignal } from "../../signals/connections.ts";
import CreateRoomModal from "../modals/CreateRoomModal.tsx";

const themeGradients: Record<RoomTheme, string> = {
  indigo: 'from-indigo-600/40',
  emerald: 'from-emerald-600/40',
  amber: 'from-amber-600/40',
  rose: 'from-rose-600/40',
  cyan: 'from-cyan-600/40',
  slate: 'from-slate-600/40',
};

type RoomTab = 'all' | 'vault' | 'archived' | 'starred' | 'collab';
type RoomSort = 'latest' | 'alphabetical' | 'most-artifacts' | 'least-artifacts';
type RoomView = 'grid' | 'carousel';

const tabConfig: { id: RoomTab; label: string; helper: string }[] = [
  { id: 'all', label: 'All', helper: 'Everything active' },
  { id: 'vault', label: 'Vault', helper: 'Private rooms' },
  { id: 'archived', label: 'Archived', helper: 'Stored away' },
  { id: 'starred', label: 'Starred', helper: 'Pinned favorites' },
  { id: 'collab', label: 'Collab', helper: 'Shared rooms' },
];

const sortOptions: { id: RoomSort; label: string }[] = [
  { id: 'latest', label: 'Latest' },
  { id: 'alphabetical', label: 'A-Z' },
  { id: 'most-artifacts', label: 'Most artifacts' },
  { id: 'least-artifacts', label: 'Least artifacts' },
];

function RoomActionButton({
  variant,
  label,
  active,
  onClick,
}: {
  variant: 'pin' | 'star' | 'archive' | 'sparkles';
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  const Icon = variant === 'pin' ? Pin : variant === 'star' ? Star : variant === 'archive' ? Archive : Sparkles;

  return (
    <button
      type="button"
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
        active
          ? 'border-white/20 bg-white/15 text-white'
          : 'border-white/10 bg-black/30 text-gray-400 hover:border-white/20 hover:text-white'
      }`}
    >
      <Icon size={12} className={active ? 'text-white' : 'text-current'} />
    </button>
  );
}

function RoomCard({
  room,
  mode,
  pinned,
  starred,
  archived,
  onOpen,
  onPin,
  onStar,
  onArchive,
}: {
  room: Room;
  mode: RoomView;
  pinned: boolean;
  starred: boolean;
  archived: boolean;
  onOpen: () => void;
  onPin: () => void;
  onStar: () => void;
  onArchive: () => void;
}) {
  const glowClass = themeGradients[room.themeColor as RoomTheme] || themeGradients.indigo;

  if (mode === 'carousel') {
    return (
      <div
        onClick={onOpen}
        className={`group relative min-w-[300px] md:min-w-[360px] h-[440px] snap-start overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#111] transition-all duration-500 cursor-pointer card-glow glow-${room.themeColor}`}
      >
        {/* Background Image - Always Visible but Subtle */}
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
          {room.coverImage ? (
            <img src={room.coverImage} className="h-full w-full object-cover opacity-50 group-hover:opacity-70 transition-opacity" alt="" />
          ) : (
            <div className={`h-full w-full bg-linear-to-br ${glowClass} to-transparent opacity-20`} />
          )}
          <div className="absolute inset-0 room-image-overlay" />
        </div>

        <div className="absolute inset-0 flex flex-col justify-between p-8 z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {pinned && <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-white shadow-lg backdrop-blur-md">Pinned</span>}
              {starred && <span className="rounded-full border border-white/10 bg-amber-500/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-amber-300 shadow-lg backdrop-blur-md">Starred</span>}
            </div>
            <div className="flex items-center gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <RoomActionButton variant="star" label="Star room" active={starred} onClick={onStar} />
              <RoomActionButton variant="archive" label="Archive room" active={archived} onClick={onArchive} />
            </div>
          </div>

          <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <div className="mb-4 flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full animate-pulse bg-current ${themeGradients[room.themeColor as RoomTheme]?.replace('from-', 'text-').replace('/40', '') || 'text-indigo-400'}`} />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40">
                {room.isPublic ? 'Collective' : 'Vault'}
              </span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight text-white drop-shadow-2xl group-hover:text-canvas-primary transition-colors duration-300">{room.name}</h3>
            <p className="mt-4 line-clamp-2 text-base text-gray-300 font-serif italic leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
              {room.description || "A curated sanctuary for your artifacts."}
            </p>
            <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
               <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-1">Artifacts</span>
                    <span className="text-sm font-bold text-white">{room.count}</span>
                  </div>
               </div>
               <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                  <ArrowRight size={20} />
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div
      onClick={onOpen}
      className={`group relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#111] transition-all duration-500 cursor-pointer card-glow glow-${room.themeColor}`}
    >
      {/* Background Image - Always Visible but Subtle */}
      <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-110">
        {room.coverImage ? (
          <img src={room.coverImage} className="h-full w-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="" />
        ) : (
          <div className={`h-full w-full bg-linear-to-br ${glowClass} to-transparent opacity-20`} />
        )}
        <div className="absolute inset-0 room-image-overlay" />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-between p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="mb-4 flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full animate-pulse bg-current ${themeGradients[room.themeColor as RoomTheme]?.replace('from-', 'text-').replace('/40', '') || 'text-indigo-400'}`} />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">
                {room.isPublic ? 'Collective Space' : 'Private Vault'}
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-canvas-primary transition-colors duration-300">{room.name}</h3>
          </div>
          <div className="flex flex-col gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
            <RoomActionButton variant="star" label="Star room" active={starred} onClick={onStar} />
            <RoomActionButton variant="archive" label="Archive room" active={archived} onClick={onArchive} />
            <RoomActionButton variant="pin" label="Pin room" active={pinned} onClick={onPin} />
          </div>
        </div>

        <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <p className="mt-4 line-clamp-2 text-sm text-gray-300 font-serif italic leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
            {room.description || "A curated space for your digital consciousness."}
          </p>
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Artifacts</span>
                <span className="text-xs font-bold text-white">{room.count}</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Theme</span>
                <span className={`text-xs font-bold uppercase ${themeGradients[room.themeColor as RoomTheme]?.replace('from-', 'text-').replace('/40', '') || 'text-indigo-400'}`}>{room.themeColor}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-500">
              <ArrowRight size={16} />
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
  const [activeTab, setActiveTab] = useState<RoomTab>('all');
  const [sortBy, setSortBy] = useState<RoomSort>('latest');
  const [viewMode, setViewMode] = useState<RoomView>('grid');
  const [pinnedIds, setPinnedIds] = useState<string[]>(rooms.slice(0, 2).map((room) => room.id));
  const [starredIds, setStarredIds] = useState<string[]>([]);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  const roomOrder = useMemo(() => new Map(rooms.map((room, index) => [room.id, index])), [rooms]);

  const activeRooms = useMemo(() => rooms.filter((room) => !archivedIds.includes(room.id)), [rooms, archivedIds]);
  const archivedRooms = useMemo(() => rooms.filter((room) => archivedIds.includes(room.id)), [rooms, archivedIds]);
  const vaultRooms = useMemo(() => activeRooms.filter((room) => !room.isPublic), [activeRooms]);
  const collabRooms = useMemo(() => activeRooms.filter((room) => room.isPublic), [activeRooms]);
  const starredRooms = useMemo(() => activeRooms.filter((room) => starredIds.includes(room.id)), [activeRooms, starredIds]);

  const tabRooms = useMemo(() => {
    switch (activeTab) {
      case 'vault':
        return vaultRooms;
      case 'archived':
        return archivedRooms;
      case 'starred':
        return starredRooms;
      case 'collab':
        return collabRooms;
      default:
        return activeRooms;
    }
  }, [activeTab, activeRooms, archivedRooms, collabRooms, starredRooms, vaultRooms]);

  const sortedRooms = useMemo(() => {
    const list = [...tabRooms];
    switch (sortBy) {
      case 'alphabetical':
        return list.sort((a, b) => a.name.localeCompare(b.name));
      case 'most-artifacts':
        return list.sort((a, b) => b.count - a.count);
      case 'least-artifacts':
        return list.sort((a, b) => a.count - b.count);
      case 'latest':
      default:
        return list.sort((a, b) => (roomOrder.get(b.id) ?? 0) - (roomOrder.get(a.id) ?? 0));
    }
  }, [roomOrder, sortBy, tabRooms]);

  const pinnedRooms = useMemo(
    () => activeRooms.filter((room) => pinnedIds.includes(room.id)).sort((a, b) => (roomOrder.get(a.id) ?? 0) - (roomOrder.get(b.id) ?? 0)),
    [activeRooms, pinnedIds, roomOrder]
  );

  const visibleRooms = sortedRooms.filter((room) => !pinnedIds.includes(room.id));

  const togglePin = (id: string) => {
    setPinnedIds((current) => current.includes(id) ? current.filter((roomId) => roomId !== id) : [...current, id]);
  };

  const toggleStar = (id: string) => {
    setStarredIds((current) => current.includes(id) ? current.filter((roomId) => roomId !== id) : [...current, id]);
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
    globalThis.location.href = `/rooms/${id}`;
  };

  return (
    <>
      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}

      <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24 md:pb-10 space-y-12">
        <section className="relative overflow-hidden rounded-[3rem] border border-white/5 bg-[#0d0d0d] p-10 md:p-16 shadow-2xl">
          <div className="absolute top-0 right-0 h-full w-1/2 bg-linear-to-l from-canvas-primary/10 to-transparent blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-canvas-primary">
                <div className="w-1.5 h-1.5 rounded-full bg-canvas-primary animate-pulse" />
                Collection Engine
              </div>
              <h1 className="mt-8 text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] text-white">
                Curate Your 
                <span className="italic font-serif text-canvas-primary bg-clip-text text-transparent bg-gradient-to-r from-canvas-primary to-indigo-400 ml-3">Digital Soul.</span>
              </h1>
              <p className="mt-8 max-w-3xl text-gray-400 text-lg md:text-xl leading-relaxed font-serif italic border-l-2 border-white/10 pl-8">
                Your Rooms are more than just digital storage. They are the sanctuary for your collected artifacts—the raw materials of your consciousness, secured by blockchain and refined by intelligence.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="w-full lg:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-white px-8 py-5 text-[12px] font-bold uppercase tracking-[0.2em] text-black shadow-[0_20px_50px_rgba(255,255,255,0.15)] transition-all hover:-translate-y-1 hover:shadow-[0_30px_60px_rgba(255,255,255,0.25)] active:scale-95"
              >
                + Initialize Room
              </button>
              <button
                type="button"
                onClick={() => setViewMode(viewMode === 'grid' ? 'carousel' : 'grid')}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-white transition-all hover:border-white/20 hover:bg-white/10"
              >
                {viewMode === 'grid' ? <Layers size={14} /> : <Layout size={14} />}
                {viewMode === 'grid' ? 'Carousel' : 'Grid'} View
              </button>
            </div>
          </div>

          <div className="relative z-10 mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.75rem] border border-white/5 bg-black/20 p-5">
              <div className="flex flex-wrap items-center gap-2">
                {tabConfig.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      activeTab === tab.id
                        ? 'border-canvas-primary/40 bg-canvas-primary/15 text-canvas-primary'
                        : 'border-white/10 bg-white/5 text-gray-500 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600">
                {tabConfig.find((tab) => tab.id === activeTab)?.helper}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/5 bg-black/20 p-5">
              <div className="flex flex-wrap items-center gap-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSortBy(option.id)}
                    className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                      sortBy === option.id
                        ? 'border-white/20 bg-white text-black'
                        : 'border-white/10 bg-white/5 text-gray-500 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-600">
                Pin multiple rooms, then sort the rest by the order you want.
              </p>
            </div>
          </div>
        </section>

        {pinnedRooms.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3 px-1">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Pinned Rooms</h2>
                <p className="text-sm text-gray-500 font-serif italic">Stack the rooms you want at the top.</p>
              </div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                {pinnedRooms.length} pinned
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
              {pinnedRooms.map((room) => (
                <div key={room.id} className="snap-start">
                  <RoomCard
                    room={room}
                    mode="carousel"
                    pinned
                    starred={starredIds.includes(room.id)}
                    archived={archivedIds.includes(room.id)}
                    onOpen={() => openRoom(room.id)}
                    onPin={() => togglePin(room.id)}
                    onStar={() => toggleStar(room.id)}
                    onArchive={() => toggleArchive(room.id)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4 rounded-[2rem] border border-white/5 bg-white/[0.02] p-5 md:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">
                  {activeTab === 'archived' ? 'Archived Rooms' : activeTab === 'vault' ? 'Vault Rooms' : activeTab === 'starred' ? 'Starred Rooms' : activeTab === 'collab' ? 'Collab Rooms' : 'All Rooms'}
                </h2>
                <p className="mt-1 text-sm text-gray-400 font-serif italic">
                  {activeTab === 'archived'
                    ? 'Stored away, but still available when needed.'
                    : activeTab === 'vault'
                    ? 'Private rooms that stay out of public view.'
                    : activeTab === 'starred'
                    ? 'Rooms you have marked as especially important.'
                    : activeTab === 'collab'
                    ? 'Public rooms shared with your broader network.'
                    : 'Your active room system, ready to explore.'}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <ArrowRight size={12} className="text-canvas-primary" />
                {visibleRooms.length} rooms
              </div>
            </div>

            {visibleRooms.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/10 bg-black/20 px-6 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-xl font-bold text-white">No rooms in this tab yet</h3>
                <p className="mt-2 max-w-md text-sm text-gray-400 font-serif italic leading-relaxed">
                  This section will fill as you start pinning, archiving, starring, or locking rooms away.
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
                {visibleRooms.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    mode="grid"
                    pinned={pinnedIds.includes(room.id)}
                    starred={starredIds.includes(room.id)}
                    archived={archivedIds.includes(room.id)}
                    onOpen={() => openRoom(room.id)}
                    onPin={() => togglePin(room.id)}
                    onStar={() => toggleStar(room.id)}
                    onArchive={() => toggleArchive(room.id)}
                  />
                ))}

                <button
                  onClick={() => setShowCreate(true)}
                  type="button"
                  className="min-h-[270px] rounded-[2rem] border-2 border-dashed border-white/10 bg-transparent p-6 text-left transition-all hover:border-white/25 hover:bg-white/[0.02] cursor-pointer"
                >
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-gray-600 text-gray-500 transition-colors group-hover:border-white">
                      <Plus size={24} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Create Expressive Room</span>
                    <p className="mt-2 text-xs text-gray-600 font-serif italic">Use the template-first flow.</p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
                {visibleRooms.map((room) => (
                  <div key={room.id} className="snap-start">
                    <RoomCard
                      room={room}
                      mode="carousel"
                      pinned={pinnedIds.includes(room.id)}
                      starred={starredIds.includes(room.id)}
                      archived={archivedIds.includes(room.id)}
                      onOpen={() => openRoom(room.id)}
                      onPin={() => togglePin(room.id)}
                      onStar={() => toggleStar(room.id)}
                      onArchive={() => toggleArchive(room.id)}
                    />
                  </div>
                ))}

                <button
                  onClick={() => setShowCreate(true)}
                  type="button"
                  className="min-w-[280px] md:min-w-[320px] rounded-[2rem] border-2 border-dashed border-white/10 bg-transparent px-6 py-8 text-left transition-all hover:border-white/25 hover:bg-white/[0.02] cursor-pointer snap-start"
                >
                  <div className="flex h-full min-h-[270px] flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-gray-600 text-gray-500 transition-colors hover:border-white">
                      <Plus size={24} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-500">Create Expressive Room</span>
                    <p className="mt-2 text-xs text-gray-600 font-serif italic">Use the template-first flow.</p>
                  </div>
                </button>
              </div>
            )}
          </div>

          <aside className="space-y-4 rounded-[2rem] border border-white/5 bg-white/[0.02] p-5 md:p-6">
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white">Collaboration</h3>
                <p className="mt-1 text-sm text-gray-400 font-serif italic">What is shared, and who is around.</p>
              </div>
              <Users size={18} className="text-canvas-primary" />
            </div>

            <div className="space-y-3">
              {collaboratorsSignal.value.map((person) => (
                <div key={person.id} className="rounded-3xl border border-white/5 bg-black/20 p-4">
                  <div className="flex items-center gap-3">
                    <img src={person.avatar} alt="" className="h-11 w-11 rounded-2xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{person.name}</p>
                      <p className="text-xs text-gray-500">{person.role}</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-gray-400">
                      {person.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-gray-400 font-serif italic leading-relaxed">{person.bio}</p>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-white/5 bg-black/20 p-4">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
                <Globe size={12} className="text-emerald-300" />
                Locked / Vault note
              </div>
              <p className="mt-2 text-sm text-gray-300 leading-relaxed font-serif italic">
                Private rooms stay in the Vault tab. Public rooms are grouped into Collab, giving you a simple way to separate what is shared from what stays hidden.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </>
  );
}
