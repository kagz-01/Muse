import { useState, useEffect } from "preact/hooks";
import * as Icons from "lucide-preact";
import { streaksSignal, getStreakState, UserStreak } from "../../signals/streaks.ts";

function formatTimeRemaining(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m remaining`;
}

export default function StreakHub() {
  const [now, setNow] = useState(Date.now());
  const streaks = streaksSignal.value;

  useEffect(() => {
    // Tick every minute to update timers
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Sort streaks: fading first, then highest count
  const sortedStreaks = [...streaks].sort((a, b) => {
    const stateA = getStreakState(a);
    const stateB = getStreakState(b);
    if (stateA === "fading" && stateB !== "fading") return -1;
    if (stateB === "fading" && stateA !== "fading") return 1;
    return b.count - a.count;
  });

  return (
    <div className="w-full pt-4 pb-32 flex flex-col items-center animate-in fade-in duration-1000">
      <div className="w-full space-y-16">
        
        {/* HERO */}
        <section className="text-center md:text-left space-y-6 px-4 md:px-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-white">
            Active Links.<br />
            <span className="italic font-serif text-gray-400 font-light">Your cognitive streaks.</span>
          </h1>
          <p className="max-w-xl text-gray-500 text-base md:text-lg leading-relaxed font-serif italic opacity-90">
            A streak in Muse is not just a tap. It is a sustained cognitive connection. Extend a thought, add to a shared room, or anchor an artifact every 24 hours to keep the link alive.
          </p>
        </section>

        {/* THE LINK BOARD */}
        <section className="px-4 md:px-8 w-full space-y-4">
          {sortedStreaks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-[2.5rem] bg-white/[0.02]">
              <Icons.Link2Off size={48} className="text-gray-600 mb-6" />
              <p className="text-gray-400 text-lg font-serif mb-2">No active links.</p>
              <p className="text-gray-500 text-sm">Start a synthesis chain with someone.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedStreaks.map((streak) => {
                const state = getStreakState(streak);
                const timeRemaining = streak.expiresAt - now;

                let stateColor = "";
                let stateGlow = "";
                let stateLabel = "";

                switch (state) {
                  case "ignition":
                    stateColor = "text-sky-400";
                    stateGlow = "bg-sky-400";
                    stateLabel = "Ignition";
                    break;
                  case "resonance":
                    stateColor = "text-emerald-400";
                    stateGlow = "bg-emerald-400";
                    stateLabel = "Resonance";
                    break;
                  case "fading":
                    stateColor = "text-rose-400";
                    stateGlow = "bg-rose-400";
                    stateLabel = "Fading";
                    break;
                  case "broken":
                  default:
                    stateColor = "text-gray-600";
                    stateGlow = "bg-gray-600";
                    stateLabel = "Broken";
                    break;
                }

                return (
                  <div 
                    key={streak.id}
                    className={`relative p-8 rounded-[2.5rem] bg-white/[0.02] border transition-all hover:bg-white/[0.04] cursor-pointer overflow-hidden ${
                      state === "fading" ? "border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.1)]" : "border-white/5"
                    }`}
                  >
                    {/* The Visual Link (Glowing Line) */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                      <div 
                        className={`h-full ${stateGlow} ${state === "fading" ? "animate-pulse" : ""}`} 
                        style={{ 
                          width: `${Math.max(0, Math.min(100, (timeRemaining / (1000 * 60 * 60 * 24)) * 100))}%`,
                          boxShadow: `0 0 10px ${stateGlow}, 0 0 20px ${stateGlow}`
                        }}
                      />
                    </div>

                    <div className="flex justify-between items-start mb-10">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                          {streak.partnerAvatar ? (
                            <img src={streak.partnerAvatar} alt={streak.partnerName} className="w-full h-full object-cover" />
                          ) : (
                            <Icons.User size={20} className="text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white tracking-tight">{streak.partnerName}</h3>
                          <div className={`text-[10px] uppercase tracking-widest font-bold mt-1 flex items-center gap-1.5 ${stateColor}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${stateGlow}`} />
                            {stateLabel}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-5xl font-mono font-bold tracking-tighter ${stateColor}`}>
                            {streak.count}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Days</span>
                        </div>
                      </div>

                      <div className="text-right">
                        {state === "fading" ? (
                           <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 animate-pulse flex items-center gap-1.5 justify-end">
                             <Icons.Clock size={12} />
                             {formatTimeRemaining(timeRemaining)}
                           </p>
                        ) : (
                           <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5 justify-end">
                             <Icons.CheckCircle2 size={12} className="text-emerald-400" />
                             Secure today
                           </p>
                        )}
                      </div>
                    </div>

                    {/* "Restore" button if broken/fading */}
                    {state === "fading" && (
                      <button className="mt-8 w-full py-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-widest hover:bg-rose-500/20 transition-all">
                        Extend Thought Now
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
