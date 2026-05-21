// Use a simple record type for inline style objects
import { useMemo, useRef, useState } from "preact/hooks";
import Icons from "lucide-preact";
import {
  roomsSignal,
  type RoomTheme,
  toggleRoomPrivacy,
  updateRoomCover,
  updateRoomTheme,
} from "../../signals/rooms.ts";
import { addItem, deleteItem, itemsSignal } from "../../signals/items.ts";
import EditRoomModal from "../modals/EditRoomModal.tsx";
import ArtifactExtractor from "../../components/rooms/ArtifactExtractor.tsx";
import { setSystemStatus } from "../../signals/intelligence.ts";

const themeMapping: Record<RoomTheme, {
  border: string;
  shadow: string;
  text: string;
  bg: string;
  fill: string;
}> = {
  indigo: {
    border: "border-indigo-500/50",
    shadow: "shadow-indigo-500/20",
    text: "text-indigo-400",
    bg: "bg-indigo-500/10",
    fill: "bg-indigo-500",
  },
  emerald: {
    border: "border-emerald-500/50",
    shadow: "shadow-emerald-500/20",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    fill: "bg-emerald-500",
  },
  rose: {
    border: "border-rose-500/50",
    shadow: "shadow-rose-500/20",
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    fill: "bg-rose-500",
  },
  amber: {
    border: "border-amber-500/50",
    shadow: "shadow-amber-500/20",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    fill: "bg-amber-500",
  },
  cyan: {
    border: "border-cyan-500/50",
    shadow: "shadow-cyan-500/20",
    text: "text-cyan-400",
    bg: "bg-cyan-500/10",
    fill: "bg-cyan-500",
  },
  slate: {
    border: "border-slate-500/50",
    shadow: "shadow-slate-500/20",
    text: "text-slate-400",
    bg: "bg-slate-500/10",
    fill: "bg-slate-500",
  },
};

const paletteColors: { name: RoomTheme; hex: string }[] = [
  { name: "indigo", hex: "#6366f1" },
  { name: "emerald", hex: "#10b981" },
  { name: "rose", hex: "#f43f5e" },
  { name: "amber", hex: "#f59e0b" },
  { name: "cyan", hex: "#06b6d4" },
  { name: "slate", hex: "#64748b" },
];

export default function RoomInside({ roomId }: { roomId: string }) {
  const room = roomsSignal.value.find((r) => r.id === roomId);
  const allItems = itemsSignal.value;
  const items = useMemo(() => allItems.filter((i) => i.roomId === roomId), [
    allItems,
    roomId,
  ]);

  const [activeTab, setActiveTab] = useState<"collection" | "dialogue">(
    "collection",
  );
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showExtractor, setShowExtractor] = useState(false);
  const [mismatchAlert, setMismatchAlert] = useState<
    { active: boolean; meta: { title: string; summary: string } } | null
  >(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dialogueInput, setDialogueInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
        <p className="text-2xl font-bold text-white tracking-tight">
          Room not found.
        </p>
        <a
          href="/rooms"
          className="text-gray-400 hover:text-white text-sm underline"
        >
          Back to Rooms
        </a>
      </div>
    );
  }

  const theme = themeMapping[room.themeColor] || themeMapping["indigo"];
  const customHex = room.customThemeHex;
  const baseHexMap: Record<RoomTheme, string> = {
    indigo: "#6366f1",
    emerald: "#10b981",
    rose: "#f43f5e",
    amber: "#f59e0b",
    cyan: "#06b6d4",
    slate: "#64748b",
  };
  const hex = customHex || baseHexMap[room.themeColor] || baseHexMap.indigo;
  const glowStyle: Record<string, string> = {
    boxShadow: `0 20px 60px ${hex}33`,
    background: `linear-gradient(135deg, ${hex}22, transparent)`,
  };

  const handleImageUpload = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () =>
        updateRoomCover(room.id, reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleExtracted = (meta: { title: string; summary: string }) => {
    // Context Audit (Real-Time Analysis)
    const isMismatch = (room.name.toLowerCase().includes("sports") &&
      meta.summary.toLowerCase().includes("romance")) ||
      (room.name.toLowerCase().includes("brutalism") &&
        meta.summary.toLowerCase().includes("nature"));

    if (isMismatch) {
      setMismatchAlert({ active: true, meta });
    } else {
      processCollection(meta);
    }
  };

  const processCollection = (meta: { title: string; summary: string }) => {
    addItem({
      roomId: room.id,
      title: meta.title,
      sourceUrl: "https://social.signal",
      note: meta.summary,
      isPublic: false,
    });
    setShowExtractor(false);
    setMismatchAlert(null);
  };

  const handleDialogueAction = (action: string) => {
    setIsAnalyzing(true);
    setSystemStatus("Analyzing");
    setAiResponse(null);

    // Simulate complex neural processing
    setTimeout(() => {
      let response = "";
      switch (action) {
        case "Identify core themes":
          response =
            "Neural mapping complete. Your collection focuses on 'Structural Integrity' and 'Industrial Brutalism'. 85% of artifacts share these semantic nodes.";
          break;
        case "Find contradictions":
          response =
            "Conflict detected. Your latest artifact on 'Nature-Inspired Design' contrasts with the brutalist foundation of this room.";
          break;
        case "Suggest next collection":
          response =
            "The collective suggests searching for 'Modernist Concrete' to reinforce the current thematic resonance.";
          break;
        case "Synthesize to Thread":
          response =
            "Sovereign synthesis ready. The patterns are stable enough to be woven into a formal intelligence document.";
          break;
        default:
          response =
            "Your neural query has been synthesized. The patterns in this room are maturing toward deep resonance.";
      }
      setAiResponse(response);
      setIsAnalyzing(false);
      setSystemStatus("Idle");
    }, 2000);
  };

  return (
    <>
      {isEditOpen && (
        <EditRoomModal
          room={room}
          onClose={() => setIsEditOpen(false)}
          onDeleted={() => globalThis.location.href = "/rooms"}
        />
      )}

      {/* CONTEXT MISMATCH MODAL */}
      {mismatchAlert?.active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#151515] border border-amber-500/30 rounded-[3rem] p-10 max-w-xl w-full shadow-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Icons.AlertTriangle size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Thematic Mismatch
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mt-1">
                  Real-Time Context Audit
                </p>
              </div>
            </div>

            <p className="text-gray-300 font-serif italic text-lg leading-relaxed mb-10">
              "This artifact (related to{" "}
              <span className="text-amber-500 font-bold">Romance/Sex</span>)
              shows low resonance with your current room{" "}
              <span className="text-white font-bold">"{room.name}"</span>. Do
              you truly wish to store this signal here?"
            </p>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => processCollection(mismatchAlert.meta)}
                className="flex-1 py-4 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:bg-gray-200 transition-all cursor-pointer"
              >
                Store Anyway
              </button>
              <button
                type="button"
                onClick={() => setMismatchAlert(null)}
                className="flex-1 py-4 bg-white/5 border border-white/10 text-gray-500 font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              >
                Discard Signal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-24 md:pb-10 min-h-screen bg-[#0a0a0a] relative overflow-hidden">
        <div
          className={`fixed inset-0 pointer-events-none blur-[120px] opacity-20 transition-colors duration-1000 ${!customHex ? theme.bg : ""}`}
          style={customHex ? { background: `linear-gradient(135deg, ${customHex}40, transparent)` } : undefined}
        />

        <header className="relative w-full h-[52vh] min-h-[400px] overflow-hidden group">
          {room.coverImage
            ? (
              <img
                src={room.coverImage}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                alt=""
              />
            )
            : <div className={`absolute inset-0 ${!customHex ? theme.bg : ""}`} style={customHex ? { background: `linear-gradient(135deg, ${customHex}40, transparent)` } : undefined} />}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            type="button"
            className="absolute top-5 right-5 z-20 w-11 h-11 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-xl cursor-pointer opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300"
          >
            <Icons.Camera size={18} />
          </button>

          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 w-full z-10">
            <div className="flex justify-between items-center">
              <a
                href="/rooms"
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-lg"
              >
                <Icons.ArrowLeft size={18} />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRoomPrivacy(room.id)}
                  type="button"
                  className={`px-3.5 py-2 rounded-full backdrop-blur-md border shadow-lg flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                    room.isPublic
                      ? "bg-white/10 border-white/20 text-white"
                      : "bg-black/50 border-black/40 text-gray-400"
                  }`}
                >
                  {room.isPublic
                    ? (
                      <>
                        <Icons.Globe size={12} className={theme.text} /> Public
                      </>
                    )
                    : (
                      <>
                        <Icons.Lock size={12} /> Private
                      </>
                    )}
                </button>
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div
                className={`absolute inset-0 ${theme.bg} blur-2xl opacity-30 mix-blend-overlay pointer-events-none`}
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-3 drop-shadow-xl">
                    {room.name}
                  </h1>
                  {room.description && (
                    <p className="text-gray-300 font-serif italic text-base md:text-lg max-w-2xl leading-relaxed line-clamp-2">
                      {room.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* ADVANCED COLOR PICKER */}
                  <div className="relative">
                      <button
                        onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                        type="button"
                        className={`w-11 h-11 rounded-full backdrop-blur-lg border border-white/10 flex items-center justify-center transition-all shadow-xl cursor-pointer ${
                        isPaletteOpen
                          ? "bg-white/20"
                          : "bg-black/50 hover:bg-white/10"
                      }`}
                      >
                      <Icons.Palette size={18} style={{ color: customHex || undefined }} />
                    </button>
                    {isPaletteOpen && (
                      <div className="absolute bottom-full right-0 mb-3 bg-[#151515] border border-white/10 rounded-3xl p-6 shadow-3xl min-w-[280px] z-[20] animate-in slide-in-from-bottom-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6">
                          Full Spectrum Stylist
                        </h4>

                        <div className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide mb-8">
                          {paletteColors.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => {
                                updateRoomTheme(room.id, c.name);
                              }}
                              style={{ backgroundColor: c.hex }}
                              className={`w-8 h-8 flex-shrink-0 snap-start rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 cursor-pointer ${
                                room.themeColor === c.name
                                  ? "ring-2 ring-white ring-offset-2 ring-offset-[#151515]"
                                  : ""
                              }`}
                            >
                              {room.themeColor === c.name && (
                                <Icons.Check size={13} strokeWidth={3} />
                              )}
                            </button>
                          ))}
                        </div>

                        <div className="space-y-6">
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                                Aura Intensity
                              </span>
                              <span className="text-[9px] font-mono text-white">
                                85%
                              </span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  theme.bg.replace("/10", "/60")
                                } w-[85%]`}
                              />
                            </div>
                          </div>

                          <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-2">
                              Custom Hex Signal
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-canvas-primary" />
                              <span className="text-xs font-mono text-white">
                                #6366F1
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setIsEditOpen(true)}
                    type="button"
                    className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-lg border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 transition-all shadow-xl cursor-pointer"
                  >
                    <Icons.Edit2 size={17} />
                  </button>

                  <button
                    type="button"
                    className="px-6 py-3 bg-white text-black font-bold uppercase tracking-widest text-[11px] rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Icons.Share2 size={15} /> Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 md:p-10 w-full max-w-none relative z-10 -mt-4">
          {/* TAB NAVIGATION */}
          <div className="flex items-center gap-6 mb-12">
            <button
              type="button"
              onClick={() => setActiveTab("collection")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "collection"
                  ? "bg-white text-black shadow-2xl scale-105"
                  : "bg-white/5 border border-white/10 text-gray-500 hover:text-white"
              }`}
            >
              <Icons.Layers size={16} /> Collection Phase
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dialogue")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "dialogue"
                  ? "bg-white text-black shadow-2xl scale-105"
                  : "bg-white/5 border border-white/10 text-gray-500 hover:text-white"
              }`}
            >
              <Icons.MessageSquare size={16} /> Contemplation Pulse
            </button>
          </div>

          {activeTab === "collection"
            ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <section className="mb-8 grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
                  <div className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-6 md:p-7 backdrop-blur-sm">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-gray-500">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white">
                        Collect
                      </span>
                      <span>Room detail</span>
                    </div>
                    <h2 className="mt-4 text-2xl md:text-3xl font-bold tracking-tight text-white">
                      {room.name}
                    </h2>
                    <p className="mt-3 max-w-3xl text-gray-400 font-serif italic leading-relaxed">
                      {room.description ||
                        "This room is where consumed content gets collected, refined, and held until it is ready to become a pattern."}
                    </p>
                  </div>

                  <div className="flex gap-3 overflow-x-auto rounded-[2rem] border border-white/5 bg-black/25 p-4 md:p-5 backdrop-blur-sm scrollbar-hide">
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center min-w-[160px] flex-shrink-0">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Artifacts
                      </div>
                        <div className="mt-2 text-2xl font-bold text-white">
                        {items.length}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center min-w-[160px] flex-shrink-0">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Access
                      </div>
                      <div className="mt-2 text-2xl font-bold text-white">
                        {room.isPublic ? "Pub" : "Vault"}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-4 text-center min-w-[160px] flex-shrink-0">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Theme
                      </div>
                      <div className={`mt-2 text-2xl font-bold`} style={{ color: customHex || undefined }}>
                        {customHex ? "Custom" : room.themeColor}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold text-white tracking-tight flex items-center gap-4">
                    <Icons.Layers size={32} className="text-gray-800" />{" "}
                    Curated Clusters
                  </h3>
                  <button
                    onClick={() => setShowExtractor(true)}
                    type="button"
                    className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-black text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer active:scale-95 shadow-xl hover:-translate-y-1"
                  >
                    <Icons.Plus size={18} /> Collect Artifact
                  </button>
                </div>

                {showExtractor && (
                  <div className="mb-12 animate-in slide-in-from-top-8 duration-500">
                    <ArtifactExtractor onExtract={handleExtracted} />
                  </div>
                )}

                {items.length === 0
                  ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-[#111318]/50 backdrop-blur-md rounded-[3rem] border border-white/5">
                      <div
                        className={`w-20 h-20 ${theme.bg} rounded-3xl mb-6 flex items-center justify-center shadow-2xl`}
                      >
                        <Icons.Plus size={28} className={theme.text} />
                      </div>
                      <p className="text-white text-2xl font-bold tracking-tight mb-2">
                        This space is expectant.
                      </p>
                      <p className="text-gray-500 font-serif italic text-lg mb-10 max-w-lg text-center">
                        Your artifacts will appear here as clusters of
                        intelligence. Begin the collection phase.
                      </p>
                      <button
                        onClick={() => setShowExtractor(true)}
                        type="button"
                        className="px-12 py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-[12px] text-black cursor-pointer hover:-translate-y-1 active:scale-95 transition-all shadow-3xl"
                        style={{
                          backgroundColor: customHex || paletteColors.find((c) =>
                            c.name === room.themeColor
                          )?.hex || "#6366f1",
                        }}
                      >
                        Initialize Collection
                      </button>
                    </div>
                  )
                  : (
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#111] rounded-[2.5rem] border border-white/5 overflow-hidden group transition-all duration-500 min-w-[320px] flex-shrink-0"
                          style={glowStyle}
                        >
                          <div
                            className="h-40 relative overflow-hidden"
                            style={{ background: customHex ? `linear-gradient(135deg, ${customHex}40, transparent)` : undefined }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-white/5 opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                              <Icons.ExternalLink size={40} className={theme.text} />
                            </div>
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
                            >
                              <Icons.ExternalLink size={14} />
                            </a>
                          </div>

                          <div className="p-7">
                            <div className="flex flex-col gap-1 mb-4">
                              <span className={`text-[8px] font-bold uppercase tracking-[0.2em] ${theme.text}`}>
                                Artifact
                              </span>
                              <h4 className="font-bold text-lg leading-tight text-white/90 group-hover:text-white transition-colors line-clamp-2">
                                {item.title}
                              </h4>
                            </div>

                            {item.note && (
                              <p className="text-sm text-gray-400 line-clamp-2 mb-6 font-serif italic border-l-2 border-white/10 pl-4 py-1 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                "{item.note}"
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-auto pt-5 border-t border-white/5">
                              <span className="text-[9px] uppercase font-bold tracking-[0.15em] truncate max-w-[70%] text-gray-500">
                                Sourced from collective
                              </span>
                              <button
                                onClick={() => deleteItem(item.id)}
                                type="button"
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-700 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
                              >
                                <Icons.Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            )
            : (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* SAME DIALOGUE CONTENT AS BEFORE */}
                <div className="bg-white/2 border border-white/5 rounded-[3.5rem] p-12 md:p-20 text-center relative overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 w-full h-full ${theme.bg} blur-[120px] opacity-10 pointer-events-none`}
                  />

                  <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-6 mb-10">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-canvas-primary shadow-2xl">
                        <Icons.MessageSquare size={32} />
                      </div>
                      <div className="h-px w-20 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                      <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-canvas-primary shadow-2xl">
                        <Icons.Aperture size={32} />
                      </div>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">
                      Contemplate the{" "}
                      <span className={`italic font-serif ${theme.text}`}>
                        Patterns.
                      </span>
                    </h2>
                    <p className="text-xl md:text-2xl text-gray-400 font-serif italic leading-relaxed mb-12">
                      "Dialogue is the bridge between consumption and synthesis.
                      Talk to your room to discover the hidden lineage of your
                      collected signals."
                    </p>

                    <div className="relative max-w-2xl mx-auto">
                      <textarea
                        value={dialogueInput}
                        onInput={(e) =>
                          setDialogueInput(
                            (e.target as HTMLTextAreaElement).value,
                          )}
                        placeholder="What patterns are emerging in this room?"
                        className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-8 text-white placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-white/[0.08] transition-all min-h-[160px] text-xl font-serif italic outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleDialogueAction(
                            dialogueInput || "General Query",
                          )}
                        disabled={isAnalyzing}
                        className={`absolute bottom-6 right-6 w-14 h-14 bg-white text-black rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                          isAnalyzing ? "opacity-50" : ""
                        }`}
                      >
                        {isAnalyzing
                          ? (
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                          )
                          : <Icons.Aperture size={24} />}
                      </button>
                    </div>

                    {aiResponse && (
                      <div className="mt-8 p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-500">
                        <p className="text-indigo-400 font-serif italic text-lg leading-relaxed">
                          "{aiResponse}"
                        </p>
                      </div>
                    )}

                    <div className="mt-12 flex flex-wrap justify-center gap-4">
                      {[
                        "Identify core themes",
                        "Find contradictions",
                        "Suggest next collection",
                        "Synthesize to Thread",
                      ].map((action) => (
                        <button
                          type="button"
                          key={action}
                          onClick={() => handleDialogueAction(action)}
                          disabled={isAnalyzing}
                          className={`px-6 py-3 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:border-canvas-primary transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
                  <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] min-w-[420px] flex-[1.2] flex-shrink-0">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                      <Icons.Layers size={14} /> Cognitive Lineage
                    </h4>
                    <div className="space-y-6">
                      <p className="text-lg text-white font-serif italic leading-relaxed">
                        "This room is showing a strong resonance with 'Aesthetic
                        Brutalism'. 3 out of 5 artifacts mention raw materials
                        as a form of honesty."
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              theme.bg.replace("/10", "/60")
                            } w-[65%]`}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-gray-500">
                          65% Synthesis
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[3rem] flex flex-col justify-center min-w-[320px] flex-[0.8] flex-shrink-0">
                    <p className="text-gray-500 font-serif italic text-lg leading-relaxed mb-8">
                      Ready to weave these artifacts into a living document?
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleDialogueAction("Synthesize to Thread")}
                      className="w-full py-5 bg-canvas-primary text-white font-bold uppercase tracking-widest text-[11px] rounded-2xl shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
                    >
                      Initialize Pattern Thread
                    </button>
                  </div>
                </div>
              </div>
            )}
        </main>
      </div>
    </>
  );
}
