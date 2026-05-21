import {
  addDialogueLayer,
  type DialogueLayer,
  threadsSignal,
} from "../../signals/threads.ts";
import { userSignal } from "../../signals/user.ts";
import {
  AlertCircle,
  Aperture,
  GitCommit,
  Heart,
  MessageSquare,
  Send,
  Zap,
} from "lucide-preact";
import { useState } from "preact/hooks";

export default function DialogueHub({ threadId }: { threadId: string }) {
  const thread = threadsSignal.value.find((t) => t.id === threadId);
  const user = userSignal.value;

  const [content, setContent] = useState("");
  const [activeType, setActiveType] = useState<DialogueLayer["type"]>(
    "insight",
  );
  const [isSending, setIsSending] = useState(false);

  if (!thread) return null;

  const handleSend = () => {
    if (!content.trim()) return;
    setIsSending(true);

    setTimeout(() => {
      addDialogueLayer(threadId, {
        userId: user.id,
        userName: user.name,
        content,
        type: activeType,
      });
      setContent("");
      setIsSending(false);
    }, 1000);
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
          <MessageSquare size={14} className="text-canvas-primary" />{" "}
          Dialogue Layers
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
            <Heart size={10} className="text-rose-500" />
            <span className="text-[9px] font-bold text-white uppercase tracking-widest">
              {thread.resonanceMetrics.connections} Resonance Connections
            </span>
          </div>
        </div>
      </div>

      {/* INPUT AREA */}
      <div className="bg-[#111318] border border-white/10 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-4">
            {(["insight", "challenge", "signal"] as DialogueLayer["type"][])
              .map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-6 py-2.5 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                    activeType === type
                      ? "bg-white text-black border-white shadow-xl scale-105"
                      : "bg-white/5 border-white/5 text-gray-500 hover:text-white"
                  }`}
                >
                  {type === "insight" && <Aperture size={12} />}
                  {type === "challenge" && <AlertCircle size={12} />}
                  {type === "signal" && <Zap size={12} />}
                  {type}
                </button>
              ))}
          </div>

          <div className="relative">
            <textarea
              value={content}
              onInput={(e) =>
                setContent((e.target as HTMLTextAreaElement).value)}
              placeholder={activeType === "insight"
                ? "Contribute an intellectual pattern..."
                : activeType === "challenge"
                ? "Identify a cognitive contradiction..."
                : "Add a new signal to this synthesis..."}
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-6 min-h-[120px] text-lg text-white placeholder-gray-800 focus:outline-none focus:border-canvas-primary/40 transition-all font-serif italic outline-none resize-none"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!content.trim() || isSending}
              className="absolute bottom-6 right-6 w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* DIALOGUE LIST */}
      <div className="space-y-6">
        {thread.dialogueLayers.map((layer: DialogueLayer) => (
          <div
            key={layer.id}
            className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] group hover:bg-white/[0.04] transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-canvas-primary/20 border border-canvas-primary/30 flex items-center justify-center text-canvas-primary font-bold text-xs">
                  {layer.userName[0]}
                </div>
                <div>
                  <p className="text-[11px] font-bold text-white uppercase tracking-widest">
                    {layer.userName}
                  </p>
                  <p className="text-[9px] text-gray-600 uppercase tracking-widest">
                    {new Date(layer.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div
                className={`px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest ${
                  layer.type === "insight"
                    ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                    : layer.type === "challenge"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                {layer.type}
              </div>
            </div>

            <p className="text-lg text-gray-300 font-serif italic leading-relaxed mb-8">
              "{layer.content}"
            </p>

            <div className="flex items-center gap-6 pt-6 border-t border-white/5">
              <button type="button" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-colors">
                <GitCommit size={14} className="text-canvas-primary" />{" "}
                Woven Pattern ({layer.resonanceScore})
              </button>
              <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:text-white transition-colors ml-auto">
                Acknowledge
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
