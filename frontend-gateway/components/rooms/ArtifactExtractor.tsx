import { useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import { roomsSignal } from "../../signals/rooms.ts";

interface ExtractedMetadata {
  title: string;
  source: string;
  type: "Post" | "Article" | "Image" | "Thread" | "Raw Text" | "Video";
  summary: string;
  image?: string;
  suggestedRoomId?: string;
}

type InputType = "link" | "text" | "file";

export default function ArtifactExtractor(
  { onExtract }: { onExtract: (meta: ExtractedMetadata) => void },
) {
  const [inputType, setInputType] = useState<InputType>("link");
  const [input, setInput] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(null);

  const rooms = roomsSignal.value;

  const simulateExtraction = () => {
    if (!input.trim()) return;
    setIsExtracting(true);
    setStep(1);

    // Simulation steps
    setTimeout(() => setStep(2), 800);
    setTimeout(() => setStep(3), 1600);
    setTimeout(() => {
      let meta: ExtractedMetadata;

      if (inputType === "link") {
        meta = {
          title: input.includes("x.com")
            ? "The Future of Digital Sovereignty"
            : "Aesthetic Brutalism in Modern Web",
          source: input.includes("x.com") ? "X (Twitter)" : "Instagram",
          type: input.includes("x.com") ? "Post" : "Image",
          summary:
            "An exploration into how decentralized protocols are reshaping user agency in the 2026 landscape.",
          image:
            "https://images.unsplash.com/photo-1518005020250-58003994bf3b?auto=format&fit=crop&w=1200&q=80",
          suggestedRoomId: rooms[0]?.id,
        };
      } else {
        meta = {
          title: "Raw Intellectual Fragment",
          source: "Manual Entry",
          type: "Raw Text",
          summary: input.slice(0, 100) + "...",
          suggestedRoomId: rooms[1]?.id,
        };
      }

      setMetadata(meta);
      setIsExtracting(false);
      setStep(4);
    }, 2400);
  };

  const handleReset = () => {
    setInput("");
    setMetadata(null);
    setStep(0);
  };

  return (
    <div className="bg-[#111318] border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 h-full w-1/3 bg-canvas-primary/5 blur-[100px] pointer-events-none" />

      {!metadata
        ? (
          <div className="space-y-8 relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-500 flex items-center gap-3">
                <Icons.Aperture size={14} className="text-canvas-primary" />
                {" "}
                Multi-Signal Extraction Terminal
              </h3>
              <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                {(["link", "text", "file"] as InputType[]).map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setInputType(type)}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                      inputType === type
                        ? "bg-white text-black"
                        : "text-gray-500 hover:text-white"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              {inputType === "text"
                ? (
                  <textarea
                    value={input}
                    onInput={(e) =>
                      setInput((e.target as HTMLTextAreaElement).value)}
                    placeholder="Paste raw data fragments, thoughts, or copy-pasted signals..."
                    disabled={isExtracting}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 min-h-[160px] text-lg text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.08] transition-all font-serif italic outline-none resize-none"
                  />
                )
                : (
                  <input
                    value={input}
                    onInput={(e) =>
                      setInput((e.target as HTMLInputElement).value)}
                    placeholder={inputType === "link"
                      ? "Paste social signal (X, Reddit, Notion, etc.)..."
                      : "Drop file signal..."}
                    disabled={isExtracting}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-8 py-6 text-xl text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.08] transition-all font-serif italic outline-none"
                  />
                )}
              {!isExtracting && (
                <button
                  type="button"
                  onClick={simulateExtraction}
                  className={`absolute bottom-6 right-6 w-12 h-12 bg-white text-black rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl ${
                    inputType !== "text" ? "top-1/2 -translate-y-1/2" : ""
                  }`}
                >
                  <Icons.Aperture size={20} />
                </button>
              )}
            </div>

            {isExtracting && (
              <div className="space-y-4">
                {[
                  {
                    label: `Establishing connection to ${inputType} signal...`,
                    active: step >= 1,
                  },
                  {
                    label: "Bypassing algorithm noise & sanitizing...",
                    active: step >= 2,
                  },
                  {
                    label: "Synthesizing data type & recommending room...",
                    active: step >= 3,
                  },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${
                      s.active ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {s.active
                      ? <Icons.Check size={12} className="text-emerald-500" />
                      : (
                        <div className="w-3 h-3 rounded-full border border-gray-800" />
                      )}
                    {s.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        )
        : (
          <div className="relative z-10 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                  Signal Extraction Complete
                </div>
                <div className="flex items-center gap-2 text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                  <Icons.Clipboard size={10} /> Copied to Buffer
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
              >
                Discard Signal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              {metadata.image && (
                <div className="md:col-span-4 aspect-square rounded-3xl overflow-hidden border border-white/5">
                  <img
                    src={metadata.image}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
              )}
              <div
                className={`${
                  metadata.image ? "md:col-span-8" : "md:col-span-12"
                } flex flex-col justify-center`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-canvas-primary">
                    {metadata.source}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-gray-700" />
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    {metadata.type === "Post" && <Icons.Hash size={12} />}
                    {metadata.type === "Image" && <Icons.Image size={12} />}
                    {metadata.type === "Article" && (
                      <Icons.FileText
                        size={12}
                      />
                    )}
                    {metadata.type === "Video" && <Icons.Video size={12} />}
                    {metadata.type === "Raw Text" && (
                      <Icons.MessageSquare
                        size={12}
                      />
                    )}
                    {metadata.type}
                  </span>
                </div>
                <h4 className="text-3xl font-bold text-white mb-6 tracking-tight leading-tight">
                  {metadata.title}
                </h4>
                <p className="text-lg text-gray-400 font-serif italic leading-relaxed border-l-4 border-white/10 pl-8 mb-8">
                  {metadata.summary}
                </p>

                {metadata.suggestedRoomId && (
                  <div className="mb-10 p-5 bg-canvas-primary/5 border border-canvas-primary/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-canvas-primary/20 flex items-center justify-center text-canvas-primary">
                        <Icons.Aperture size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          AI Recommendation
                        </p>
                        <p className="text-xs font-bold text-white">
                          Suggested Room:{" "}
                          <span className="text-canvas-primary">
                            {rooms.find((r) =>
                              r.id === metadata.suggestedRoomId
                            )?.name}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-[9px] font-bold uppercase tracking-widest text-canvas-primary hover:underline"
                    >
                      Change Room
                    </button>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => onExtract(metadata)}
                    className="px-10 py-4 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:-translate-y-1 transition-all shadow-xl cursor-pointer"
                  >
                    Collect to Room
                  </button>
                  <button
                    type="button"
                    className="px-10 py-4 bg-white/5 border border-white/10 text-white font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Open Original
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
