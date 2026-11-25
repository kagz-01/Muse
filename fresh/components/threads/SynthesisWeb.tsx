import { roomsSignal } from "../../signals/rooms.ts";
import { threadsSignal } from "../../signals/threads.ts";
import * as Icons from "lucide-preact";

export default function SynthesisWeb({ threadId }: { threadId: string }) {
  const thread = threadsSignal.value.find((t) => t.id === threadId);
  const rooms = roomsSignal.value;

  if (!thread) return null;

  const sourceRooms = rooms.filter((r) => thread.sourceRoomIds.includes(r.id));

  return (
    <div className="relative bg-white/2 border border-white/5 rounded-[3rem] p-10 md:p-12 overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 h-full w-1/3 bg-canvas-primary/5 blur-[100px] pointer-events-none" />

      <div className="relative z-10 space-y-10">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
            <Icons.Layers size={14} className="text-canvas-primary" />{" "}
            Synthesis Web
          </h3>
          <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <Icons.Aperture size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">
              {thread.synthesisScore}% Resonance
            </span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 py-10">
          {sourceRooms.map((room, _i) => (
            <div key={room.id} className="relative group">
              <div
                className={`w-32 h-32 rounded-[2.5rem] border border-white/10 bg-black/40 flex items-center justify-center overflow-hidden transition-all duration-700 group-hover:scale-110 group-hover:border-canvas-primary/40 shadow-2xl`}
              >
                {room.coverImage
                  ? (
                    <img
                      src={room.coverImage}
                      className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity"
                      alt=""
                    />
                  )
                  : (
                    <div
                      className="w-full h-full"
                      style={{
                        background: room.customThemeHex
                          ? `linear-gradient(135deg, ${room.customThemeHex}40, transparent)`
                          : undefined,
                      }}
                    />
                  )}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <Icons.Hash size={20} className="text-gray-500 mb-2" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-white leading-tight">
                    {room.name}
                  </p>
                </div>
              </div>

              {/* WEB LINE */}
              <div className="hidden md:block absolute top-1/2 left-full w-12 h-px bg-linear-to-r from-canvas-primary/40 to-transparent pointer-events-none" />
            </div>
          ))}

          <div className="relative">
            <div className="w-40 h-40 rounded-full border-2 border-dashed border-canvas-primary/40 flex items-center justify-center animate-[spin_40s_linear_infinite]">
              <div className="w-32 h-32 rounded-full border border-canvas-primary/20" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-3xl bg-canvas-primary/20 border border-canvas-primary/40 flex items-center justify-center shadow-[0_0_80px_rgba(99,102,241,0.3)]">
                <Icons.GitCommit size={40} className="text-canvas-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-white/2 border border-white/5 rounded-[2.5rem] backdrop-blur-sm">
          <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-4">
            Master Thesis Pattern
          </h4>
          <p className="text-xl md:text-2xl font-serif italic text-gray-200 leading-relaxed">
            "{thread.thesis}"
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            className="flex-1 py-4 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:bg-gray-200 transition-all shadow-xl"
          >
            Publish to Collective
          </button>
          <button
            type="button"
            className="flex-1 py-4 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:bg-white/10 transition-all"
          >
            Analyze New Connections
          </button>
        </div>
      </div>
    </div>
  );
}
