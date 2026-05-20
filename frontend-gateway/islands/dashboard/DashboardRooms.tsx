import { useState } from "preact/hooks";
import { Globe, Lock, Plus } from "lucide-preact";
import { roomsSignal, type RoomTheme } from "../../signals/rooms.ts";
import CreateRoomModal from "../modals/CreateRoomModal.tsx";

const themeGradients: Record<RoomTheme, string> = {
  indigo: "from-indigo-600/30",
  emerald: "from-emerald-600/30",
  amber: "from-amber-600/30",
  rose: "from-rose-600/30",
  cyan: "from-cyan-600/30",
  slate: "from-slate-600/30",
};

export default function DashboardRooms() {
  const rooms = roomsSignal.value;
  const [showCreate, setShowCreate] = useState(false);

  return (
    <>
      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}

      <section className="px-6 md:px-10">
        <header className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your Rooms</h2>
            <p className="text-sm text-gray-500 mt-1 font-serif italic">
              Highly personalized and expressive curation spaces.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/rooms"
              className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors"
            >
              View All
            </a>
            <button
              onClick={() => setShowCreate(true)}
              type="button"
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white transition-all cursor-pointer"
            >
              <Plus size={16} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const glowClass = themeGradients[room.themeColor] ||
              themeGradients["indigo"];
            return (
              <a
                key={room.id}
                href={`/rooms/${room.id}`}
                className="relative h-56 rounded-4xl overflow-hidden cursor-pointer group shadow-xl border border-white/5 hover:border-white/20 transition-all transform hover:-translate-y-1 w-full text-left"
              >
                <img
                  src={room.coverImage}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                <div
                  className={`absolute inset-0 bg-linear-to-t ${glowClass} via-canvas-bg-dark/60 to-canvas-bg-dark opacity-60 group-hover:opacity-80 transition-opacity duration-500`}
                >
                </div>
                <div className="absolute inset-0 bg-linear-to-t from-canvas-bg-dark via-canvas-bg-dark/40 to-transparent opacity-90">
                </div>

                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div className="flex justify-end">
                    {room.isPublic
                      ? (
                        <div className="bg-white/10 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold text-white shadow-sm border border-white/10 flex items-center gap-1.5">
                          <Globe size={12} /> Public
                        </div>
                      )
                      : (
                        <div className="bg-black/40 backdrop-blur-md px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-widest font-bold text-gray-300 shadow-sm border border-white/5 flex items-center gap-1.5">
                          <Lock size={12} /> Private
                        </div>
                      )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-white mb-2 drop-shadow-lg group-hover:text-white transition-colors">
                      {room.name}
                    </h3>
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-300/80 drop-shadow-md">
                      {room.count} Artifacts
                    </span>
                  </div>
                </div>
              </a>
            );
          })}

          <button
            onClick={() => setShowCreate(true)}
            type="button"
            className="relative h-56 bg-[#1c1c1c] border-2 border-dashed border-white/10 rounded-4xl hover:border-canvas-primary/30 hover:bg-white/2 transition-colors cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-white group w-full"
          >
            <div className="w-14 h-14 rounded-full border border-dashed border-gray-600 group-hover:border-canvas-primary flex items-center justify-center mb-4 text-2xl font-light transition-colors">
              +
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest group-hover:text-canvas-primary transition-colors">
              Create Expressive Room
            </span>
          </button>
        </div>
      </section>
    </>
  );
}
