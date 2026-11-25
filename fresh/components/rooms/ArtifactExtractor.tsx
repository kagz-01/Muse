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
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [metadata, setMetadata] = useState<ExtractedMetadata | null>(null);

  const rooms = roomsSignal.value;

  const performExtraction = async () => {
    if (inputType !== "file" && !input.trim()) return;
    if (inputType === "file" && !fileInput) return;

    setIsExtracting(true);
    setStep(1);

    try {
      let meta: ExtractedMetadata;

      if (inputType === "link") {
        setStep(2);
        // Call the real API
        const res = await fetch(
          `/api/extract?url=${encodeURIComponent(input)}`,
        );
        if (!res.ok) throw new Error("Failed to extract");

        const data = await res.json();
        setStep(3);

        meta = {
          title: data.title,
          source: data.source,
          type: data.type as any,
          summary: data.summary,
          image: data.image,
          suggestedRoomId: rooms[0]?.id,
        };
      } else if (inputType === "file" && fileInput) {
        setStep(2);
        await new Promise((resolve) => setTimeout(resolve, 600)); // simulate reading time
        setStep(3);
        const isImage = fileInput.type.startsWith("image/");
        meta = {
          title: fileInput.name,
          source: "Local Upload",
          type: isImage ? "Image" : "Raw Text",
          summary: `Size: ${(fileInput.size / 1024).toFixed(2)} KB. Type: ${
            fileInput.type || "Unknown"
          }`,
          suggestedRoomId: rooms[1]?.id,
        };
      } else {
        // text
        setStep(2);
        await new Promise((resolve) => setTimeout(resolve, 400));
        setStep(3);
        const textPreview = input.slice(0, 150) +
          (input.length > 150 ? "..." : "");
        const titleSnippet = input.slice(0, 40).split("\n")[0] +
          (input.length > 40 ? "..." : "");
        meta = {
          title: titleSnippet || "Raw Intellectual Fragment",
          source: "Manual Entry",
          type: "Raw Text",
          summary: textPreview || "Empty transmission",
          suggestedRoomId: rooms[1]?.id,
        };
      }

      setStep(4);
      setMetadata(meta);
    } catch (err) {
      console.error(err);
      // Fallback on error
      setStep(4);
      setMetadata({
        title: "Unknown Signal",
        source: "Extraction Failed",
        type: "Article",
        summary: "Could not establish connection to the provided signal.",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleReset = () => {
    setInput("");
    setMetadata(null);
    setStep(0);
  };

  return (
    <div className="bg-[#111318] border border-[var(--muse-text)]/10 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 h-full w-1/3 bg-canvas-primary/5 blur-[100px] pointer-events-none" />

      {!metadata
        ? (
          <div className="space-y-8 relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--muse-muted)] flex items-center gap-3">
                <Icons.Aperture size={14} className="text-canvas-primary" />
                {" "}
                Multi-Signal Extraction Terminal
              </h3>
              <div className="flex items-center gap-2 p-1 bg-[var(--muse-text)]/5 rounded-xl border border-[var(--muse-text)]/5">
                {(["link", "text", "file"] as InputType[]).map((type) => (
                  <button
                    type="button"
                    key={type}
                    onClick={() => setInputType(type)}
                    className={`px-4 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all ${
                      inputType === type
                        ? "bg-[var(--muse-text)] text-[var(--muse-bg)]"
                        : "text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
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
                    className="w-full bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/10 rounded-2xl px-8 py-6 min-h-[160px] text-lg text-[var(--muse-text)] placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-[var(--muse-text)]/[0.08] transition-all font-serif italic outline-none resize-none"
                  />
                )
                : inputType === "file"
                ? (
                  <div className="w-full bg-[var(--muse-text)]/5 border border-dashed border-[var(--muse-text)]/20 hover:border-canvas-primary/50 rounded-2xl px-8 py-10 min-h-[160px] flex items-center justify-center transition-all relative overflow-hidden group">
                    <input
                      type="file"
                      onChange={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (target.files && target.files.length > 0) {
                          setFileInput(target.files[0]);
                        }
                      }}
                      disabled={isExtracting}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Icons.UploadCloud
                        size={28}
                        className="text-gray-600 group-hover:text-canvas-primary transition-colors"
                      />
                      <span className="text-gray-500 font-bold uppercase tracking-widest text-xs group-hover:text-[var(--muse-text)] transition-colors">
                        {fileInput
                          ? fileInput.name
                          : "Click or Drop File Signal Here"}
                      </span>
                    </div>
                  </div>
                )
                : (
                  <input
                    value={input}
                    onInput={(e) =>
                      setInput((e.target as HTMLInputElement).value)}
                    placeholder="Paste social signal (X, Reddit, Notion, etc.)..."
                    disabled={isExtracting}
                    className="w-full bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/10 rounded-2xl px-8 py-6 text-xl text-[var(--muse-text)] placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-[var(--muse-text)]/[0.08] transition-all font-serif italic outline-none"
                  />
                )}
              {!isExtracting && (
                <button
                  type="button"
                  onClick={performExtraction}
                  className={`absolute bottom-6 right-6 w-12 h-12 bg-[var(--muse-text)] text-[var(--muse-bg)] rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl ${
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
                      s.active
                        ? "text-[var(--muse-text)]"
                        : "text-[var(--muse-muted)]"
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
                <div className="flex items-center gap-2 text-[9px] text-[var(--muse-muted)] font-bold uppercase tracking-widest">
                  <Icons.Clipboard size={10} /> Copied to Buffer
                </div>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-[9px] font-bold uppercase tracking-widest text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors"
              >
                Discard Signal
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              {metadata.image && (
                <div className="md:col-span-4 aspect-square rounded-3xl overflow-hidden border border-[var(--muse-text)]/5">
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
                  <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
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
                <h4 className="text-3xl font-bold text-[var(--muse-text)] mb-6 tracking-tight leading-tight">
                  {metadata.title}
                </h4>
                <p className="text-lg text-[var(--muse-muted)] font-serif italic leading-relaxed border-l-4 border-[var(--muse-text)]/10 pl-8 mb-8">
                  {metadata.summary}
                </p>

                {metadata.suggestedRoomId && (
                  <div className="mb-10 p-5 bg-canvas-primary/5 border border-canvas-primary/20 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-canvas-primary/20 flex items-center justify-center text-canvas-primary">
                        <Icons.Aperture size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                          AI Recommendation
                        </p>
                        <p className="text-xs font-bold text-[var(--muse-text)]">
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
                    className="px-10 py-4 bg-[var(--muse-text)] text-[var(--muse-bg)] font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:-translate-y-1 transition-all shadow-xl cursor-pointer"
                  >
                    Collect to Room
                  </button>
                  <button
                    type="button"
                    className="px-10 py-4 bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/10 text-[var(--muse-text)] font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:bg-[var(--muse-text)]/10 transition-all cursor-pointer"
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
