import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import RoomCard, { RoomData } from "./RoomCard.tsx";
import CreateRoomModal from "./CreateRoomModal.tsx";
import EmptyState from "../../components/dashboard/EmptyState.tsx";
import { userSignal } from "../../signals/user.ts";
import { DEMO_USER } from "../../utils/demo_data.ts";

interface InitialUser {
  id: string;
  name?: string;
  username: string;
  email: string;
}

export default function DashboardClientManager(
  { initialRooms, initialUser, isDemo = false }: {
    initialRooms: RoomData[];
    initialUser?: InitialUser;
    isDemo?: boolean;
  },
) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Bootstrap userSignal with server-side user data on mount.
  // This ensures the greeting uses the logged-in user's name, not the signal default.
  useEffect(() => {
    if (!initialUser) return;
    userSignal.value = {
      ...userSignal.value,
      ...(isDemo ? DEMO_USER : {}),
      id: initialUser.id,
      username: initialUser.username,
      email: initialUser.email,
      // Prefer the server-side name when available, otherwise fall back to username.
      name: initialUser.name || initialUser.username || DEMO_USER.name || "Stranger",
      links: isDemo ? DEMO_USER.links : userSignal.value.links,
      bio: isDemo ? DEMO_USER.bio : userSignal.value.bio,
      website: isDemo ? DEMO_USER.website : userSignal.value.website,
      location: isDemo ? DEMO_USER.location : userSignal.value.location,
      avatarUrl: isDemo ? DEMO_USER.avatarUrl : userSignal.value.avatarUrl,
      auraType: isDemo ? DEMO_USER.auraType : userSignal.value.auraType,
      auraColor: isDemo ? DEMO_USER.auraColor : userSignal.value.auraColor,
      cognitiveStreak: isDemo ? DEMO_USER.cognitiveStreak : userSignal.value.cognitiveStreak,
      resonance: isDemo ? DEMO_USER.resonance : userSignal.value.resonance,
    };
  }, [initialUser?.id, isDemo]);

  const handleCreateRoom = () => {
    if (isDemo) return; // silently block in demo mode
    setIsModalOpen(true);
  };

  return (
    <div className="h-full">
      {/* Persistent Demo Mode Banner */}
      {isDemo && (
        <div className="mb-6 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 flex items-center gap-3">
          <span className="text-amber-300">👁</span>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
              Demo Mode
            </p>
            <p className="text-sm text-amber-100/80 mt-0.5">
              You're exploring a sample workspace. Sign up to own your own.
            </p>
          </div>
          <a
            href="/"
            className="ml-auto text-xs font-bold text-amber-300 border border-amber-400/40 rounded-full px-3 py-1 hover:bg-amber-400/20 transition-colors"
          >
            Sign Up →
          </a>
        </div>
      )}

      {initialRooms.length === 0
        ? <EmptyState onCreateClick={handleCreateRoom} />
        : (
          <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-[var(--muse-text)] mb-2">
                  Sovereign Rooms
                </h1>
                <p className="text-[var(--muse-muted)]">
                  {isDemo
                    ? "Sample knowledge environments to explore."
                    : "Your active knowledge environments."}
                </p>
              </div>
              {!isDemo && (
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--muse-text)] text-[var(--muse-bg)] text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform"
                >
                  <Icons.Plus size={16} />
                  New Room
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialRooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  onClick={() =>
                    globalThis.location.href = `/dashboard/rooms/${room.id}`}
                />
              ))}
            </div>
          </div>
        )}

      {/* Modal */}
      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
