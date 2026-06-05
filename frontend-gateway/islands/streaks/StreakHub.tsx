import { useState, useEffect } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  streaksSignal,
  getStreakState,
  extendStreak,
  startStreak,
  removeStreak,
  pruneBrokenStreaks,
} from "../../signals/streaks.ts";

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m remaining`;
}

function formatRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(diff / 3600000);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / 86400000);
  return `${days}d ago`;
}

export default function StreakHub() {
  const [now, setNow] = useState(Date.now());
  const streaks = streaksSignal.value;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [extendNote, setExtendNote] = useState<Record<string, string>>({});

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000); // every 30s
    return () => clearInterval(interval);
  }, []);

  const sortedStreaks = [...streaks].sort((a, b) => {
    const stateA = getStreakState(a);
    const stateB = getStreakState(b);
    if (stateA === "fading" && stateB !== "fading") return -1;
    if (stateB === "fading" && stateA !== "fading") return 1;
    if (stateA === "broken" && stateB !== "broken") return 1;
    if (stateB === "broken" && stateA !== "broken") return -1;
    return b.count - a.count;
  });

  const activeCount = streaks.filter((s) => getStreakState(s) !== "broken").length;
  const fadingCount = streaks.filter((s) => getStreakState(s) === "fading").length;
  const longestStreak = streaks.reduce((max, s) => Math.max(max, s.count), 0);

  const handleStartStreak = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    startStreak(`u-${Date.now()}`, trimmed);
    setNewName("");
    setShowNewForm(false);
  };

  const handleExtend = (streakId: string) => {
    const note = extendNote[streakId]?.trim() || "Extended thought";
    extendStreak(streakId, note);
    setExtendNote((prev) => ({ ...prev, [streakId]: "" }));
  };

  const handlePrune = () => {
    const removed = pruneBrokenStreaks();
    if (removed === 0) {
      // nothing to prune
    }
  };

  const stateConfig = {
    ignition: { color: "text-sky-400", glow: "bg-sky-400", glowHex: "rgb(56,189,248)", label: "Ignition" },
    resonance: { color: "text-emerald-400", glow: "bg-emerald-400", glowHex: "rgb(52,211,153)", label: "Resonance" },
    fading: { color: "text-rose-400", glow: "bg-rose-400", glowHex: "rgb(251,113,133)", label: "Fading" },
    broken: { color: "text-gray-600", glow: "bg-gray-600", glowHex: "rgb(75,85,99)", label: "Broken" },
  };

  return (
    <div className="w-full pt-4 pb-32 flex flex-col items-center animate-in fade-in duration-1000">
      <div className="w-full space-y-16">
        
        {/* HERO */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-8">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.9] text-white">
              Active Links.<br />
              <span className="italic font-serif text-gray-400 font-light">Your cognitive streaks.</span>
            </h1>
            <p className="max-w-xl text-gray-500 text-base md:text-lg leading-relaxed font-serif italic opacity-90">
              A streak in Muse is a sustained cognitive connection. Extend a thought, add to a shared room, or anchor an artifact every 24 hours to keep the link alive.
            </p>
          </div>

          <div className="flex gap-3 self-start md:self-auto">
            {streaks.some((s) => getStreakState(s) === "broken") && (
              <button
                type="button"
                onClick={handlePrune}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-widest hover:bg-rose-500/20 transition-all cursor-pointer"
              >
                <Icons.Trash2 size={14} />
                Clear Broken
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowNewForm(!showNewForm)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 text-white border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
            >
              <Icons.Plus size={14} />
              New Link
            </button>
          </div>
        </section>

        {/* NEW STREAK FORM */}
        {showNewForm && (
          <section className="px-4 md:px-8 animate-in slide-in-from-top-4 duration-300">
            <div className="p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Connection Name</label>
                <input
                  type="text"
                  value={newName}
                  onInput={(e) => setNewName((e.target as HTMLInputElement).value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStartStreak()}
                  placeholder="Who are you linking with?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-canvas-primary/50 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleStartStreak}
                disabled={!newName.trim()}
                className="px-6 py-3 rounded-xl bg-canvas-primary/20 text-canvas-primary border border-canvas-primary/30 text-xs font-bold uppercase tracking-widest hover:bg-canvas-primary/30 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed whitespace-nowrap"
              >
                Start Chain
              </button>
            </div>
          </section>
        )}

        {/* SUMMARY STRIP */}
        <section className="flex flex-wrap items-center gap-4 p-2 bg-white/[0.02] border-y md:border border-white/5 md:rounded-full backdrop-blur-3xl shadow-2xl w-full">
          <div className="flex-1 flex items-center justify-between px-6 py-4 border-r border-white/5">
            <div className="flex items-center gap-3">
              <Icons.Link2 size={18} className="text-emerald-400" />
              <span className="text-2xl font-bold text-white font-mono">{activeCount}</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden sm:block">Active Links</span>
          </div>
          <div className="flex-1 flex items-center justify-between px-6 py-4 border-r border-white/5">
            <div className="flex items-center gap-3">
              <Icons.AlertTriangle size={18} className="text-rose-400" />
              <span className="text-2xl font-bold text-white font-mono">{fadingCount}</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden sm:block">Fading</span>
          </div>
          <div className="flex-1 flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <Icons.Trophy size={18} className="text-amber-400" />
              <span className="text-2xl font-bold text-white font-mono">{longestStreak}</span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-gray-500 font-bold hidden sm:block">Longest Chain</span>
          </div>
        </section>

        {/* THE LINK BOARD */}
        <section className="px-4 md:px-8 w-full space-y-6">
          {sortedStreaks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center border border-white/5 rounded-[2.5rem] bg-white/[0.02]">
              <Icons.Link2Off size={48} className="text-gray-600 mb-6" />
              <p className="text-gray-400 text-lg font-serif mb-2">No active links.</p>
              <p className="text-gray-500 text-sm mb-6">Start a synthesis chain with someone.</p>
              <button
                type="button"
                onClick={() => setShowNewForm(true)}
                className="px-6 py-3 rounded-2xl bg-white/5 text-white border border-white/10 text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all cursor-pointer"
              >
                <Icons.Plus size={14} className="inline mr-2" />
                Create First Link
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedStreaks.map((streak) => {
                const state = getStreakState(streak);
                const cfg = stateConfig[state];
                const timeRemaining = streak.expiresAt - now;
                const isExpanded = expandedId === streak.id;

                return (
                  <div 
                    key={streak.id}
                    className={`relative rounded-[2.5rem] bg-white/[0.02] border transition-all overflow-hidden ${
                      state === "fading" ? "border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.1)]" 
                      : state === "broken" ? "border-gray-800 opacity-60"
                      : "border-white/5 hover:bg-white/[0.04]"
                    }`}
                  >
                    {/* Glowing progress bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                      <div 
                        className={`h-full ${cfg.glow} ${state === "fading" ? "animate-pulse" : ""} transition-all duration-1000`} 
                        style={{ 
                          width: `${Math.max(0, Math.min(100, (timeRemaining / (1000 * 60 * 60 * 24)) * 100))}%`,
                          boxShadow: `0 0 10px ${cfg.glowHex}, 0 0 20px ${cfg.glowHex}`
                        }}
                      />
                    </div>

                    {/* Main card content */}
                    <div 
                      className="p-8 cursor-pointer" 
                      onClick={() => setExpandedId(isExpanded ? null : streak.id)}
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                            {streak.partnerAvatar ? (
                              <img src={streak.partnerAvatar} alt={streak.partnerName} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg font-bold text-gray-300">{streak.partnerName.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white tracking-tight">{streak.partnerName}</h3>
                            <div className={`text-[10px] uppercase tracking-widest font-bold mt-1 flex items-center gap-1.5 ${cfg.color}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${cfg.glow}`} />
                              {cfg.label}
                            </div>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (state === "broken") removeStreak(streak.id);
                            else setExpandedId(isExpanded ? null : streak.id);
                          }}
                          className="p-2 rounded-xl hover:bg-white/5 transition-colors text-gray-500 hover:text-white cursor-pointer"
                        >
                          {state === "broken" ? <Icons.X size={16} /> : <Icons.ChevronDown size={16} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />}
                        </button>
                      </div>

                      <div className="flex items-end justify-between">
                        <div className="flex items-baseline gap-2">
                          <span className={`text-5xl font-mono font-bold tracking-tighter ${cfg.color}`}>
                            {streak.count}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Days</span>
                        </div>
                        <div className="text-right">
                          {state === "fading" ? (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-400 animate-pulse flex items-center gap-1.5 justify-end">
                              <Icons.Clock size={12} />
                              {formatTimeRemaining(timeRemaining)}
                            </p>
                          ) : state === "broken" ? (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 flex items-center gap-1.5 justify-end">
                              <Icons.LinkIcon size={12} />
                              Expired
                            </p>
                          ) : (
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-1.5 justify-end">
                              <Icons.CheckCircle2 size={12} className="text-emerald-400" />
                              Secure today
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* EXPANDED: History + Extend Action */}
                    {isExpanded && state !== "broken" && (
                      <div className="border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                        
                        {/* Extend thought input */}
                        <div className="p-6 border-b border-white/5">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 block">Extend This Link</label>
                          <div className="flex gap-3">
                            <input
                              type="text"
                              value={extendNote[streak.id] || ""}
                              onInput={(e) => setExtendNote((prev) => ({ ...prev, [streak.id]: (e.target as HTMLInputElement).value }))}
                              onKeyDown={(e) => e.key === "Enter" && handleExtend(streak.id)}
                              placeholder="What did you share today?"
                              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-canvas-primary/50 transition-colors"
                            />
                            <button
                              type="button"
                              onClick={() => handleExtend(streak.id)}
                              className="px-5 py-2.5 rounded-xl bg-canvas-primary/20 text-canvas-primary border border-canvas-primary/30 text-xs font-bold uppercase tracking-widest hover:bg-canvas-primary/30 transition-all cursor-pointer"
                            >
                              <Icons.Send size={14} />
                            </button>
                          </div>
                        </div>

                        {/* History timeline */}
                        <div className="p-6 max-h-60 overflow-y-auto">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">Link History</h4>
                          {streak.history.length > 0 ? (
                            <div className="space-y-3">
                              {streak.history.slice(0, 10).map((h, i) => (
                                <div key={i} className="flex items-start gap-3">
                                  <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-2 shrink-0" />
                                  <div>
                                    <p className="text-sm text-gray-300">{h.action}</p>
                                    <p className="text-[10px] text-gray-600 mt-0.5">{formatRelativeTime(h.timestamp)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600 italic font-serif">No history recorded yet.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fading quick-action */}
                    {state === "fading" && !isExpanded && (
                      <div className="px-8 pb-8">
                        <button
                          type="button"
                          onClick={() => setExpandedId(streak.id)}
                          className="w-full py-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-bold uppercase tracking-widest hover:bg-rose-500/20 transition-all cursor-pointer"
                        >
                          Extend Thought Now
                        </button>
                      </div>
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
