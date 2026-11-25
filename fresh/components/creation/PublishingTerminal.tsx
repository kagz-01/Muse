import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { threadsSignal } from "../../signals/threads.ts";
import { publishThought } from "../../signals/publications.ts";
import { userSignal } from "../../signals/user.ts";

export default function PublishingTerminal() {
  const threads = threadsSignal.value;
  const user = userSignal.value;

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [isImmutable, setIsImmutable] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  const handlePublish = () => {
    if (!content.trim()) return;
    setIsPublishing(true);

    // Simulate final synthesis and publication
    setTimeout(() => {
      publishThought({
        authorId: user.id,
        authorName: user.name,
        authorAura: user.auraColor,
        title: selectedThread?.title || "Synthesized Insight",
        content,
        sourceThreadId: selectedThreadId || undefined,
        lineageRoomIds: selectedThread?.sourceRoomIds || [],
        auraGradients: selectedThread?.customStyling?.auraGradients ||
          [user.auraColor, "#10b981"],
        isImmutable,
      });
      setContent("");
      setSelectedThreadId(null);
      setIsPublishing(false);
    }, 2000);
  };

  return (
    <div className="bg-[#111318] border border-white/10 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-3xl">
      <div className="absolute top-0 right-0 h-full w-1/3 bg-canvas-primary/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 space-y-12">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
            <Icons.Zap size={14} className="text-canvas-primary" />{" "}
            Creation Terminal
          </h3>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[9px] font-bold uppercase tracking-widest text-emerald-500">
              Collective Ready
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* SOURCE SELECTION */}
          <div className="space-y-8">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
              Select Synthesis Source
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-2 pr-1 scrollbar-hide snap-x snap-mandatory">
              {threads.map((thread) => (
                <button
                  type="button"
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`min-w-[260px] lg:min-w-[300px] snap-start p-6 rounded-[2rem] border text-left transition-all ${
                    selectedThreadId === thread.id
                      ? "bg-canvas-primary/10 border-canvas-primary shadow-xl"
                      : "bg-white/5 border-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white">
                      {thread.title}
                    </span>
                    <Icons.GitCommit
                      size={14}
                      className="text-canvas-primary"
                    />
                  </div>
                  <p className="text-[10px] text-gray-500 font-serif italic line-clamp-1">
                    {thread.thesis}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* PUBLISHING CONTROLS */}
          <div className="space-y-8">
            <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
              Sovereignty Options
            </h4>
            <div className="flex flex-col gap-4">
              <button
                type="button"
                onClick={() => setIsImmutable(!isImmutable)}
                className={`p-6 rounded-[2rem] border text-left transition-all flex items-center justify-between ${
                  isImmutable
                    ? "bg-white/5 border-white/20"
                    : "bg-transparent border-white/5"
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white mb-1">
                    Immutable Thought
                  </div>
                  <p className="text-[9px] text-gray-600 uppercase tracking-widest">
                    Seal this synthesis on the ledger
                  </p>
                </div>
                {isImmutable
                  ? <Icons.Shield size={20} className="text-canvas-primary" />
                  : <Icons.Lock size={20} className="text-gray-800" />}
              </button>
              <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 text-center">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                  Final Resonance Predictor
                </p>
                <div className="text-2xl font-bold text-white">
                  84% Predicted Impact
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT EDITOR */}
        <div className="space-y-6">
          <h4 className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
            Final Synthesis
          </h4>
          <textarea
            value={content}
            onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
            placeholder="Flesh out your final thought. How should the collective perceive this pattern?"
            className="w-full bg-white/[0.03] border border-white/10 rounded-[2.5rem] p-10 text-xl text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.05] transition-all min-h-[250px] font-serif italic outline-none resize-none shadow-inner"
          />
        </div>

        <div className="flex items-center gap-8 pt-8 border-t border-white/5">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-2">
              <Icons.Cpu
                size={16}
                className="text-canvas-primary animate-spin-slow"
              />
              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
                Synthesizing Collective Aura...
              </span>
            </div>
            <p className="text-[10px] text-gray-600 font-serif italic">
              This thought will be broadcasted with your signature aura to all
              active collective nodes.
            </p>
          </div>
          <button
            type="button"
            onClick={handlePublish}
            disabled={!content.trim() || isPublishing}
            className="px-16 py-6 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.15)] hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-30"
          >
            {isPublishing
              ? <Icons.Activity size={18} className="animate-pulse" />
              : <Icons.Globe size={18} />}
            {isPublishing ? "Publishing Thought..." : "Broadcast to Collective"}
          </button>
        </div>
      </div>
    </div>
  );
}
