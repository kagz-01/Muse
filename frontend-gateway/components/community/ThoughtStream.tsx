import { publicationsSignal } from "../../signals/publications.ts";
import * as Icons from "lucide-preact";

export default function ThoughtStream() {
  const publications = publicationsSignal.value;

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
          <Icons.Globe size={14} className="text-emerald-500" />{" "}
          Collective Thought Stream
        </h3>
        <div className="flex gap-2">
          {["Live", "Resonant", "Newest"].map((tab) => (
            <button
              type="button"
              key={tab}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {publications.map((pub) => (
          <div
            key={pub.id}
            className="group min-w-[320px] md:min-w-[520px] snap-start bg-[#111318] border border-white/5 rounded-[3.5rem] p-10 md:p-12 relative overflow-hidden shadow-2xl hover:border-white/10 transition-all duration-500"
          >
            {/* THOUGHT AURA */}
            <div
              className="absolute top-0 right-0 h-full w-1/3 blur-[120px] opacity-10 pointer-events-none transition-all duration-1000 group-hover:opacity-20"
              style={{
                background: `linear-gradient(to bottom, ${
                  pub.auraGradients[0]
                }, ${pub.auraGradients[1]})`,
              }}
            />

            <div className="relative z-10 space-y-10">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-black/40 backdrop-blur-md overflow-hidden relative group-hover:border-canvas-primary/40 transition-colors">
                    <span className="text-white font-bold text-lg">
                      {pub.authorName[0]}
                    </span>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-canvas-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-tight uppercase">
                      {pub.authorName}
                    </p>
                    <div className="flex items-center gap-2">
                      <Icons.Activity size={10} className="text-gray-600" />
                      <span className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                        {new Date(pub.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                {pub.isImmutable && (
                  <div className="px-3 py-1 bg-canvas-primary/10 border border-canvas-primary/30 rounded-lg flex items-center gap-2">
                    <Icons.Shield size={10} className="text-canvas-primary" />
                    <span className="text-[8px] font-bold text-canvas-primary uppercase tracking-widest">
                      Immutable
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <h4 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight group-hover:text-canvas-primary transition-colors">
                  {pub.title}
                </h4>
                <p className="text-xl text-gray-400 font-serif italic leading-relaxed max-w-4xl">
                  "{pub.content}"
                </p>
              </div>

              <div className="flex items-center gap-10">
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                    Cognitive Lineage
                  </span>
                  <div className="flex -space-x-3">
                    {pub.lineageRoomIds.map((roomId) => (
                      <div
                        key={roomId}
                        className="w-10 h-10 rounded-full bg-white/10 border-2 border-[#111318] flex items-center justify-center text-[10px] font-bold uppercase text-white shadow-xl"
                      >
                        {roomId.toUpperCase()}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-10 w-px bg-white/5" />
                <div className="flex items-center gap-6">
                  <button type="button" className="flex items-center gap-2 group/btn">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover/btn:bg-rose-500/10 group-hover/btn:border-rose-500/30 transition-all">
                      <Icons.Heart
                        size={16}
                        className="text-gray-600 group-hover/btn:text-rose-500"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 group-hover/btn:text-white uppercase tracking-widest">
                      {pub.resonanceScore} Resonance
                    </span>
                  </button>
                  <button type="button" className="flex items-center gap-2 group/btn">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover/btn:bg-canvas-primary/10 group-hover/btn:border-canvas-primary/30 transition-all">
                      <Icons.GitCommit
                        size={16}
                        className="text-gray-600 group-hover/btn:text-canvas-primary"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 group-hover/btn:text-white uppercase tracking-widest">
                      Weave
                    </span>
                  </button>
                  <button type="button" className="flex items-center gap-2 group/btn">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center group-hover/btn:bg-emerald-500/10 group-hover/btn:border-emerald-500/30 transition-all">
                      <Icons.MessageSquare
                        size={16}
                        className="text-gray-600 group-hover/btn:text-emerald-500"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600 group-hover/btn:text-white uppercase tracking-widest">
                      Dialogue
                    </span>
                  </button>
                </div>
              </div>

              {pub.txId && (
                <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[8px] font-mono text-gray-700 uppercase tracking-widest">
                      Ledger ID: {pub.txId}
                    </span>
                  </div>
                    <button type="button" className="text-[9px] font-bold uppercase tracking-widest text-gray-700 hover:text-white transition-colors flex items-center gap-2">
                    View Source Evidence <Icons.ArrowUpRight size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
