import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  perspectivesSignal as persSig,
  submitPerspective as subPers,
} from "../../signals/connections.ts";
import {
  feedFilterSignal,
  filterPerspectivesByFollowing,
  setFeedFilter,
} from "../../signals/feed-filter.ts";
import { followersSignal } from "../../signals/followers.ts";

export default function ThoughtStream() {
  const [newThought, setNewThought] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<"public" | "followers-only">(
    "public",
  );

  const allPerspectives = persSig.value;
  const feedFilter = feedFilterSignal.value;
  const followers = followersSignal.value;

  // Apply filter based on selection
  const perspectives = filterPerspectivesByFollowing(
    allPerspectives,
    followers.following,
    feedFilter.type,
  );

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (!newThought.trim()) return;
    subPers(newThought, replyingTo || undefined);
    setNewThought("");
    setReplyingTo(null);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* INPUT HUB */}
      <div className="bg-white/2 border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-full w-1/3 bg-canvas-primary/5 blur-[80px] pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
              <Icons.MessageSquare size={14} className="text-canvas-primary" />
              {" "}
              Contribute Perspective
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                <Icons.ShieldCheck size={12} /> Ledger Active
              </div>
              {replyingTo && (
                <button
                  type="button"
                  onClick={() => setReplyingTo(null)}
                  className="text-[9px] font-bold uppercase tracking-widest text-canvas-primary hover:text-white transition-colors"
                >
                  Cancel Reply
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={newThought}
              onInput={(e) =>
                setNewThought((e.target as HTMLTextAreaElement).value)}
              placeholder={replyingTo
                ? "Synthesize your response..."
                : "What patterns are you noticing?"}
              className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-8 text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.07] transition-all min-h-[160px] text-xl font-serif italic outline-none"
            />
            <button
              type="submit"
              className="absolute bottom-8 right-8 w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            >
              <Icons.ArrowRight
                size={28}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </form>

          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Intuition", icon: Icons.Aperture },
                { label: "Logic", icon: Icons.Activity },
                { label: "Skepticism", icon: Icons.Zap },
                { label: "Curiosity", icon: Icons.MessageSquare },
              ].map((tone) => (
                <button
                  key={tone.label}
                  type="button"
                  className="px-6 py-3 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:border-canvas-primary transition-all flex items-center gap-2"
                >
                  <tone.icon size={12} className="text-canvas-primary" />{" "}
                  {tone.label}
                </button>
              ))}
            </div>

            {/* Visibility Toggle */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/5 rounded-full">
              <button
                type="button"
                onClick={() => setVisibility("public")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
                  visibility === "public"
                    ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                <Icons.Globe size={12} /> Public
              </button>
              <button
                type="button"
                onClick={() => setVisibility("followers-only")}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
                  visibility === "followers-only"
                    ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-400"
                    : "text-gray-500 hover:text-white"
                }`}
              >
                <Icons.Users size={12} /> Followers Only
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FEED FILTER CONTROLS */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
          <Icons.GitBranch size={14} className="text-canvas-primary" />
          Community Thought Stream
        </h3>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setFeedFilter("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
              feedFilter.type === "all"
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                : "bg-white/5 border border-white/10 text-gray-500 hover:text-white"
            }`}
          >
            <Icons.Globe size={12} /> All Posts
          </button>

          <button
            type="button"
            onClick={() => setFeedFilter("following")}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all ${
              feedFilter.type === "following"
                ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-400"
                : "bg-white/5 border border-white/10 text-gray-500 hover:text-white"
            }`}
          >
            <Icons.Users size={12} /> From Following
          </button>
        </div>
      </div>

      {/* THE STREAM */}
      <div className="relative space-y-10">
        <div className="absolute left-8 top-0 bottom-0 w-px bg-linear-to-b from-canvas-primary/40 via-white/5 to-transparent pointer-events-none" />

        {perspectives.map((pers, i) => (
          <div
            key={pers.id}
            className={`relative pl-24 animate-in fade-in slide-in-from-left-4 duration-500`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div
              className={`absolute left-7 top-8 w-4 h-4 rounded-full border-4 border-[#0a0a0a] z-10 transition-all duration-700`}
              style={{
                backgroundColor: pers.author.aura,
                boxShadow: `0 0 20px ${pers.author.aura}`,
              }}
            />

            <div
              className={`group relative bg-white/[0.03] border border-white/5 rounded-[3rem] p-10 transition-all hover:bg-white/[0.05] hover:border-white/10 ${
                pers.relationship === "Challenging" ? "border-amber-500/20" : ""
              }`}
            >
              {/* ANALYZING OVERLAY */}
              {pers.isAnalyzing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-[3rem] z-20 flex items-center justify-center gap-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3 px-6 py-3 bg-white/10 border border-white/10 rounded-2xl">
                    <Icons.Cpu
                      size={16}
                      className="text-canvas-primary animate-pulse"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                      Parallel Analysis Node #4 Active
                    </span>
                    <Icons.RefreshCcw
                      size={14}
                      className="text-gray-500 animate-spin"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[12px] font-bold border border-white/10`}
                      style={{
                        backgroundColor: `${pers.author.aura}15`,
                        color: pers.author.aura,
                      }}
                    >
                      {pers.author.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-white">
                          {pers.author.name}
                        </span>
                        <Icons.CheckCircle
                          size={12}
                          className="text-emerald-400"
                        />
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">
                          {pers.timestamp}
                        </span>
                        {pers.source && (
                          <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-canvas-primary/60">
                            {pers.source === "Journal"
                              ? <Icons.BookOpen size={10} />
                              : <Icons.Layout size={10} />}
                            {pers.source}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap justify-end">
                    {/* Visibility Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <Icons.Globe size={11} className="text-amber-400" />
                      <span className="text-[8px] font-bold uppercase tracking-widest text-amber-400">
                        Public
                      </span>
                    </div>

                    {/* Immutability Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <Icons.Lock size={11} className="text-emerald-400" />
                      <span className="text-[8px] font-bold uppercase tracking-widest text-emerald-400">
                        Immutable
                      </span>
                    </div>

                    {/* Real-time Analysis Badge */}
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      <span className="text-[8px] font-bold uppercase tracking-widest text-indigo-400">
                        Analyzing
                      </span>
                    </div>
                  </div>
                </div>

                {/* Circle Placements - "You're in X circles" */}
                <div className="flex items-center gap-2 text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                  <Icons.Circle size={12} className="text-purple-400/60" />
                  <span>You're in 3 circles with this thinker</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {pers.txId && (
                    <div className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[8px] font-mono text-gray-600 group-hover:text-emerald-500/60 transition-colors">
                      TX: {pers.txId}
                    </div>
                  )}
                  {pers.relationship !== "Initial" && (
                    <div
                      className={`px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border ${
                        pers.relationship === "Challenging"
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                          : pers.relationship === "Resonating"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                          : "bg-canvas-primary/10 border-canvas-primary/30 text-canvas-primary"
                      }`}
                    >
                      {pers.relationship}
                    </div>
                  )}
                </div>

                {/* Resonance Score */}
                <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                  <Icons.Zap size={12} className="text-amber-400" />
                  <span className="text-[9px] font-bold text-amber-300">
                    87 Resonance
                  </span>
                </div>
              </div>

              <p className="text-2xl font-serif italic text-gray-200 leading-relaxed max-w-none">
                {pers.content}
              </p>

              <div className="mt-8 pt-8 border-t border-white/[0.03] flex flex-wrap items-center gap-6">
                <button
                  type="button"
                  onClick={() => setReplyingTo(pers.id)}
                  className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors group/btn"
                >
                  <Icons.CornerDownRight
                    size={16}
                    className="group-hover/btn:translate-x-1 transition-transform"
                  />{" "}
                  Synthesize Perspective
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-emerald-400 transition-colors"
                >
                  <Icons.Heart size={16} /> 24 Collaborators
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-indigo-400 transition-colors"
                >
                  <Icons.MessageCircle size={16} /> 18 Comments
                </button>

                <button
                  type="button"
                  className="flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-amber-400 transition-colors"
                >
                  <Icons.TrendingUp size={16} /> 342 Views
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
