import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import RoomCard, { RoomData } from "./RoomCard.tsx";
import CreateRoomModal from "./CreateRoomModal.tsx";
import EmptyState from "../../components/dashboard/EmptyState.tsx";

export default function DashboardClientManager({ initialRooms }: { initialRooms: RoomData[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="h-full">
      {initialRooms.length === 0 ? (
        <EmptyState onCreateClick={() => setIsModalOpen(true)} />
      ) : (
        <div className="animate-in fade-in duration-500">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[var(--muse-text)] mb-2">Sovereign Rooms</h1>
              <p className="text-[var(--muse-muted)]">Your active knowledge environments.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--muse-text)] text-[var(--muse-bg)] text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform"
            >
              <Icons.Plus size={16} />
              New Room
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialRooms.map(room => (
              <RoomCard 
                key={room.id} 
                room={room} 
                onClick={() => globalThis.location.href = `/dashboard/rooms/${room.id}`}
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
