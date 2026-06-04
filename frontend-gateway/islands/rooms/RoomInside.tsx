// Use a simple record type for inline style objects
import { useMemo, useRef, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  MOOD_OPTIONS,
  roomsSignal,
  type RoomTheme,
  toggleRoomPrivacy,
  updateRoomCover,
} from "../../signals/rooms.ts";
import { addItem, deleteItem, itemsSignal } from "../../signals/items.ts";
import { addThread, type ThreadMood } from "../../signals/threads.ts";
import EditRoomModal from "../modals/EditRoomModal.tsx";
import EmojiInput from "../../components/ui/EmojiInput.tsx";
import ArtifactExtractor from "../../components/rooms/ArtifactExtractor.tsx";
import AnalysisIndicator from "../../components/ai-feedback/AnalysisIndicator.tsx";
import { setSystemStatus } from "../../signals/intelligence.ts";
import VaultGateModal from "../modals/VaultGateModal.tsx";
import { isVaultUnlockedSignal } from "../../signals/vault.ts";

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
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showExtractor, setShowExtractor] = useState(false);
  const [mismatchAlert, setMismatchAlert] = useState<
    { active: boolean; meta: { title: string; summary: string } } | null
  >(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dialogueInput, setDialogueInput] = useState("");
  const [shareCopied, setShareCopied] = useState(false);
  const [threadShared, setThreadShared] = useState(false);
  const [newThreadId, setNewThreadId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
        <p className="text-2xl font-bold text-[var(--muse-text)] tracking-tight">
          Room not found.
        </p>
        <a
          href="/rooms"
          className="text-[var(--muse-muted)] hover:text-[var(--muse-text)] text-sm underline"
        >
          Back to Rooms
        </a>
      </div>
    );
  }

  if (room.isVault && !isVaultUnlockedSignal.value) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
        <VaultGateModal
          onUnlock={() => {
            // Re-render handled by signal
          }}
          onClose={() => {
            globalThis.location.href = "/rooms";
          }}
        />
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

  const getMoodStyle = (mood?: string) => {
    switch (mood) {
      case "zen":
        return "opacity-10 blur-[150px] animate-pulse";
      case "chaos":
        return "opacity-30 blur-[80px] mix-blend-color-dodge animate-pulse duration-700";
      case "energetic":
        return "opacity-40 blur-[100px] animate-bounce";
      case "melancholy":
        return "opacity-15 blur-[140px] animate-pulse duration-[3s]";
      case "dreamy":
        return "opacity-15 blur-[180px] animate-pulse duration-[4s]";
      case "noir":
        return "opacity-5 blur-[100px]";
      case "warm":
        return "opacity-25 blur-[160px] animate-pulse duration-[5s]";
      case "electric":
        return "opacity-35 blur-[90px] mix-blend-screen animate-pulse duration-[1.5s]";
      case "minimal":
        return "opacity-5 blur-[200px]";
      case "cosmic":
        return "opacity-20 blur-[100px] mix-blend-screen animate-pulse duration-[6s]";
      case "storm":
        return "opacity-40 blur-[70px] mix-blend-hard-light animate-pulse duration-500";
      case "focus":
      default:
        return "opacity-20 blur-[120px]";
    }
  };

  const getGridClass = (size?: string) => {
    switch (size) {
      case "small":
        return "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
      case "large":
        return "grid grid-cols-1 md:grid-cols-2 gap-8";
      case "medium":
      default:
        return "flex gap-6 overflow-x-auto pb-4 scrollbar-hide";
    }
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

  const generateDynamicInsight = (
    currentItems: typeof items,
    action: string,
  ) => {
    if (currentItems.length === 0) {
      return {
        response: "Your room is expectant. Add signals to begin synthesis.",
        keywords: [],
      };
    }

    // Very naive bag of words extraction
    const textBody = currentItems.map((i) => `${i.title} ${i.note || ""}`).join(
      " ",
    ).toLowerCase();
    const words = textBody.split(/\W+/).filter((w) => w.length > 4);
    const frequencies: Record<string, number> = {};
    words.forEach((w) => {
      if (
        !["about", "which", "there", "their", "where", "would", "https"]
          .includes(w)
      ) {
        frequencies[w] = (frequencies[w] || 0) + 1;
      }
    });

    const sortedWords = Object.entries(frequencies).sort((a, b) => b[1] - a[1])
      .slice(0, 3).map((e) => e[0]);
    const capitalizedWords = sortedWords.map((w) =>
      w.charAt(0).toUpperCase() + w.slice(1)
    );
    const keywordString = capitalizedWords.join("' and '");

    if (action === "Identify core themes") {
      return {
        response:
          `Neural mapping complete. Your collection focuses heavily on '${keywordString}'. ${
            Math.floor(Math.random() * 20) + 70
          }% of artifacts share these semantic nodes.`,
        keywords: capitalizedWords,
      };
    } else if (action === "Find contradictions") {
      return {
        response: `Conflict analysis complete. We detected a tension between '${
          capitalizedWords[0] || "Unknown"
        }' and other thematic signals in your latest artifact.`,
        keywords: capitalizedWords,
      };
    } else if (action === "Suggest next collection") {
      return {
        response:
          `The collective suggests searching for external signals related to '${
            capitalizedWords[capitalizedWords.length - 1] || "New patterns"
          }' to reinforce the current thematic resonance.`,
        keywords: capitalizedWords,
      };
    } else if (action === "Synthesize to Thread") {
      return {
        response:
          `Sovereign synthesis ready. The patterns are stable enough to be woven into a formal intelligence document centered around '${
            capitalizedWords.join(", ")
          }'. This thread has been published to the community.`,
        keywords: capitalizedWords,
      };
    }

    return {
      response:
        `Your neural query has been synthesized around the concepts of '${keywordString}'. The patterns in this room are maturing toward deep resonance.`,
      keywords: capitalizedWords,
    };
  };

  const handleDialogueAction = (action: string) => {
    setIsAnalyzing(true);
    setSystemStatus("Analyzing");
    setAiResponse(null);

    // Simulate complex neural processing
    setTimeout(() => {
      const { response, keywords } = generateDynamicInsight(items, action);

      if (action === "Synthesize to Thread" && !threadShared) {
        const generatedTitle = keywords.length > 0
          ? `The Patterns of ${keywords.join(" & ")}`
          : "AI Pattern Synthesis";
        const threadId = addThread({
          title: generatedTitle,
          description:
            `A synthesized thread derived from the ${room.name} room, focusing on ${
              keywords.join(", ")
            }.`,
          mood: "focus" as ThreadMood, // Fallback, would match room theme normally
          format: "essay",
          depth: "deep",
          itemIds: items.map((i) => i.id),
          sourceRoomIds: [room.id],
          isPublic: true, // Auto share to community
          coverImage: room.coverImage || "",
          thesis: `By analyzing the resonance of ${
            keywords.join(" and ") || "these artifacts"
          }, we can uncover the underlying truth of this collection.`,
          isVault: room.isVault, // Inherit vault status
        });

        setNewThreadId(threadId);
        setThreadShared(true);
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[var(--muse-bg)]/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#151515] border border-amber-500/30 rounded-[3rem] p-10 max-w-xl w-full shadow-3xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Icons.AlertTriangle size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--muse-text)] tracking-tight">
                  Thematic Mismatch
                </h2>
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mt-1">
                  Real-Time Context Audit
                </p>
              </div>
            </div>

            <p className="text-[var(--muse-muted)] font-serif italic text-lg leading-relaxed mb-10">
              "This artifact (related to{" "}
              <span className="text-amber-500 font-bold">Romance/Sex</span>)
              shows low resonance with your current room{" "}
              <span className="text-[var(--muse-text)] font-bold">
                "{room.name}"
              </span>. Do you truly wish to store this signal here?"
            </p>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => processCollection(mismatchAlert.meta)}
                className="flex-1 py-4 bg-[var(--muse-text)] text-[var(--muse-bg)] font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:bg-gray-200 transition-all cursor-pointer"
              >
                Store Anyway
              </button>
              <button
                type="button"
                onClick={() => setMismatchAlert(null)}
                className="flex-1 py-4 bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/10 text-[var(--muse-muted)] font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:text-[var(--muse-text)] hover:bg-[var(--muse-text)]/10 transition-all cursor-pointer"
              >
                Discard Signal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pb-24 md:pb-10 min-h-screen bg-[#0a0a0a] relative overflow-hidden">
        <div
          className={`fixed inset-0 pointer-events-none transition-all duration-1000 ${
            getMoodStyle(room.mood)
          } ${!customHex ? theme.bg : ""}`}
          style={customHex
            ? {
              background:
                `linear-gradient(135deg, ${customHex}40, transparent)`,
            }
            : undefined}
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
            : (
              <div
                className={`absolute inset-0 ${!customHex ? theme.bg : ""}`}
                style={customHex
                  ? {
                    background:
                      `linear-gradient(135deg, ${customHex}40, transparent)`,
                  }
                  : undefined}
              />
            )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
          <div className="absolute inset-0 bg-[var(--muse-bg)]/20 group-hover:bg-[var(--muse-bg)]/30 transition-colors" />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 w-full z-10">
            <div className="flex justify-between items-center">
              <a
                href="/rooms"
                className="w-10 h-10 rounded-full bg-[var(--muse-bg)]/40 backdrop-blur-md border border-[var(--muse-text)]/10 flex items-center justify-center text-[var(--muse-text)] hover:bg-[var(--muse-text)]/10 transition-all shadow-lg"
              >
                <Icons.ArrowLeft size={18} />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleRoomPrivacy(room.id)}
                  type="button"
                  className={`px-3.5 py-2 rounded-full backdrop-blur-md border shadow-lg flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                    room.isPublic
                      ? "bg-[var(--muse-text)]/10 border-[var(--muse-text)]/20 text-[var(--muse-text)]"
                      : "bg-[var(--muse-bg)]/50 border-black/40 text-[var(--muse-muted)]"
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

            <div className="relative z-10 bg-[var(--muse-bg)]/50 backdrop-blur-2xl border border-[var(--muse-text)]/10 rounded-3xl p-6 md:p-8 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <div
                className={`absolute inset-0 ${theme.bg} blur-2xl opacity-30 mix-blend-overlay pointer-events-none`}
              />

              <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-[var(--muse-text)] mb-3 [text-shadow:0_2px_20px_rgba(0,0,0,0.8),0_0_40px_rgba(0,0,0,0.6)]">
                    {room.name}
                  </h1>
                  {room.description && (
                    <p className="text-[var(--muse-muted)] font-serif italic text-base md:text-lg max-w-2xl leading-relaxed line-clamp-2">
                      {room.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => setIsEditOpen(true)}
                    type="button"
                    className="w-11 h-11 rounded-full bg-[var(--muse-bg)]/50 backdrop-blur-lg border border-[var(--muse-text)]/10 flex items-center justify-center text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-text)]/10 transition-all shadow-xl cursor-pointer"
                  >
                    <Icons.Edit2 size={17} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(globalThis.location.href);
                      setShareCopied(true);
                      setTimeout(() => setShareCopied(false), 2000);
                    }}
                    className="px-6 py-3 bg-[var(--muse-text)] text-[var(--muse-bg)] font-bold uppercase tracking-widest text-[11px] rounded-full shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer w-28 justify-center"
                  >
                    <Icons.Share2 size={15} />{" "}
                    {shareCopied ? "Copied" : "Share"}
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
                  ? "bg-[var(--muse-text)] text-[var(--muse-bg)] shadow-2xl scale-105"
                  : "bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/10 text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
              }`}
            >
              <Icons.Layers size={16} /> Collection Phase
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("dialogue")}
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer ${
                activeTab === "dialogue"
                  ? "bg-[var(--muse-text)] text-[var(--muse-bg)] shadow-2xl scale-105"
                  : "bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/10 text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
              }`}
            >
              <Icons.MessageSquare size={16} /> Contemplation Pulse
            </button>
          </div>

          {activeTab === "collection"
            ? (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <section className="mb-8">
                  <div className="rounded-[2rem] border border-[var(--muse-text)]/5 bg-[var(--muse-text)]/[0.03] p-6 md:p-8 backdrop-blur-sm">
                    {/* Room label + emoji */}
                    <div className="flex items-center gap-3 mb-5">
                      {room.emoji && (
                        <span className="text-3xl">{room.emoji}</span>
                      )}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--muse-muted)]">
                        <span className="rounded-full border border-[var(--muse-text)]/10 bg-[var(--muse-text)]/5 px-2.5 py-1 text-[var(--muse-text)]">
                          {room.category || "Workspace"}
                        </span>
                        <span>Room Detail</span>
                      </div>
                    </div>

                    {/* Room name + description */}
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[var(--muse-text)] mb-3">
                      {room.name}
                    </h2>
                    <p className="max-w-3xl text-[var(--muse-muted)] font-serif italic leading-relaxed">
                      {room.description ||
                        "This room is where consumed content gets collected, refined, and held until it is ready to become a pattern."}
                    </p>

                    {/* Integrated stats row */}
                    <div className="mt-6 pt-5 border-t border-[var(--muse-text)]/5 flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Icons.Layers
                          size={13}
                          className="text-[var(--muse-muted)]"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                          Artifacts
                        </span>
                        <span className="text-sm font-bold text-[var(--muse-text)] ml-1">
                          {items.length}
                        </span>
                      </div>
                      <div className="w-px h-4 bg-[var(--muse-text)]/10" />
                      <div className="flex items-center gap-2">
                        {room.isPublic
                          ? (
                            <Icons.Globe
                              size={13}
                              className="text-[var(--muse-muted)]"
                            />
                          )
                          : (
                            <Icons.Lock
                              size={13}
                              className="text-[var(--muse-muted)]"
                            />
                          )}
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                          Access
                        </span>
                        <span className="text-sm font-bold text-[var(--muse-text)] ml-1">
                          {room.isPublic ? "Community" : "Vault"}
                        </span>
                      </div>
                      <div className="w-px h-4 bg-[var(--muse-text)]/10" />
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: customHex || hex }}
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                          Theme
                        </span>
                        <span
                          className="text-sm font-bold ml-1"
                          style={{ color: customHex || undefined }}
                        >
                          {customHex ? "Custom" : room.themeColor}
                        </span>
                      </div>
                      <div className="w-px h-4 bg-[var(--muse-text)]/10" />
                      <div className="flex items-center gap-2">
                        <Icons.Activity
                          size={13}
                          className="text-[var(--muse-muted)]"
                        />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                          Mood
                        </span>
                        <span className="text-sm font-bold text-[var(--muse-text)] ml-1">
                          {MOOD_OPTIONS.find((m) => m.id === room.mood)
                            ?.emoji || "🎯"}{" "}
                          <span className="capitalize">
                            {room.mood || "Focus"}
                          </span>
                        </span>
                      </div>
                      {room.category && (
                        <>
                          <div className="w-px h-4 bg-[var(--muse-text)]/10" />
                          <div className="flex items-center gap-2">
                            <Icons.FolderOpen
                              size={13}
                              className="text-[var(--muse-muted)]"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                              Category
                            </span>
                            <span className="text-sm font-bold text-[var(--muse-text)] ml-1 capitalize">
                              {room.category}
                            </span>
                          </div>
                        </>
                      )}
                      {room.size && (
                        <>
                          <div className="w-px h-4 bg-[var(--muse-text)]/10" />
                          <div className="flex items-center gap-2">
                            <Icons.LayoutGrid
                              size={13}
                              className="text-[var(--muse-muted)]"
                            />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)]">
                              Size
                            </span>
                            <span className="text-sm font-bold text-[var(--muse-text)] ml-1 capitalize">
                              {room.size}
                            </span>
                          </div>
                        </>
                      )}
                      {room.tags && room.tags.length > 0 && (
                        <>
                          <div className="w-px h-4 bg-[var(--muse-text)]/10" />
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {room.tags.slice(0, 4).map((tag) => (
                              <span
                                key={tag}
                                className="px-2.5 py-0.5 rounded-full border border-[var(--muse-text)]/8 bg-[var(--muse-text)]/[0.04] text-[9px] font-bold uppercase tracking-widest text-[var(--muse-muted)]"
                              >
                                {tag}
                              </span>
                            ))}
                            {room.tags.length > 4 && (
                              <span className="text-[9px] text-[var(--muse-muted)] font-bold">
                                +{room.tags.length - 4}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </section>

                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold text-[var(--muse-text)] tracking-tight flex items-center gap-4">
                    <Icons.Layers
                      size={32}
                      className="text-[var(--muse-muted)]"
                    />{" "}
                    Curated Artifacts
                  </h3>
                  <button
                    onClick={() => setShowExtractor(!showExtractor)}
                    type="button"
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer shadow-xl hover:-translate-y-1 ${
                      showExtractor
                        ? "bg-[var(--muse-text)]/10 text-[var(--muse-text)] border border-[var(--muse-text)]/20"
                        : "bg-[var(--muse-text)] text-[var(--muse-bg)]"
                    }`}
                  >
                    {showExtractor
                      ? <Icons.X size={18} />
                      : <Icons.Plus size={18} />}
                    {showExtractor ? "Close Terminal" : "Collect Artifact"}
                  </button>
                </div>

                {showExtractor && (
                  <div className="mb-12 animate-in slide-in-from-top-8 duration-500">
                    <ArtifactExtractor onExtract={handleExtracted} />
                  </div>
                )}

                {items.length === 0
                  ? (
                    <div className="flex flex-col items-center justify-center py-32 bg-[#111318]/50 backdrop-blur-md rounded-[3rem] border border-[var(--muse-text)]/5">
                      <div
                        className={`w-20 h-20 ${theme.bg} rounded-3xl mb-6 flex items-center justify-center shadow-2xl`}
                      >
                        <Icons.Plus size={28} className={theme.text} />
                      </div>
                      <p className="text-[var(--muse-text)] text-2xl font-bold tracking-tight mb-2">
                        This space is expectant.
                      </p>
                      <p className="text-[var(--muse-muted)] font-serif italic text-lg max-w-lg text-center">
                        Your artifacts will appear here as clusters of
                        intelligence. Open the Multi-Signal Terminal to begin
                        extraction.
                      </p>
                    </div>
                  )
                  : (
                    <div className={getGridClass(room.size)}>
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className={`bg-[#111] rounded-[2.5rem] border border-[var(--muse-text)]/5 overflow-hidden group transition-all duration-500 ${
                            room.size === "small" || room.size === "large"
                              ? "w-full"
                              : "min-w-[320px] flex-shrink-0"
                          }`}
                          style={glowStyle}
                        >
                          <div
                            className="h-40 relative overflow-hidden"
                            style={{
                              background: customHex
                                ? `linear-gradient(135deg, ${customHex}40, transparent)`
                                : undefined,
                            }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-white/5 opacity-50" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                              <Icons.ExternalLink
                                size={40}
                                className={theme.text}
                              />
                            </div>
                            <a
                              href={item.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[var(--muse-bg)]/60 backdrop-blur-md flex items-center justify-center text-[var(--muse-muted)] hover:text-[var(--muse-text)] opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-xl"
                            >
                              <Icons.ExternalLink size={14} />
                            </a>
                          </div>

                          <div className="p-7">
                            <div className="flex flex-col gap-1 mb-4">
                              <span
                                className={`text-[8px] font-bold uppercase tracking-[0.2em] ${theme.text}`}
                              >
                                Artifact
                              </span>
                              <h4 className="font-bold text-lg leading-tight text-[var(--muse-text)]/90 group-hover:text-[var(--muse-text)] transition-colors line-clamp-2">
                                {item.title}
                              </h4>
                            </div>

                            {item.note && (
                              <p className="text-sm text-[var(--muse-muted)] line-clamp-2 mb-6 font-serif italic border-l-2 border-[var(--muse-text)]/10 pl-4 py-1 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">
                                "{item.note}"
                              </p>
                            )}

                            <div className="flex items-center justify-between mt-auto pt-5 border-t border-[var(--muse-text)]/5">
                              <span className="text-[9px] uppercase font-bold tracking-[0.15em] truncate max-w-[70%] text-[var(--muse-muted)]">
                                Sourced from collective
                              </span>
                              <button
                                onClick={() => deleteItem(item.id)}
                                type="button"
                                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muse-muted)] hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer opacity-0 group-hover:opacity-100"
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
                <div className="bg-[var(--muse-text)]/2 border border-[var(--muse-text)]/5 rounded-[3.5rem] p-12 md:p-20 text-center relative overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 w-full h-full ${theme.bg} blur-[120px] opacity-10 pointer-events-none`}
                  />

                  <div className="relative z-10 max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-6 mb-10">
                      <div className="w-16 h-16 rounded-3xl bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/10 flex items-center justify-center text-canvas-primary shadow-2xl">
                        <Icons.MessageSquare size={32} />
                      </div>
                      <div className="h-px w-20 bg-linear-to-r from-transparent via-white/20 to-transparent" />
                      <div className="w-16 h-16 rounded-3xl bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/10 flex items-center justify-center text-canvas-primary shadow-2xl">
                        <Icons.Aperture size={32} />
                      </div>
                    </div>

                    <h2 className="text-4xl md:text-6xl font-bold text-[var(--muse-text)] mb-8 tracking-tight">
                      Contemplate the{" "}
                      <span className={`italic font-serif ${theme.text}`}>
                        Patterns.
                      </span>
                    </h2>
                    <p className="text-xl md:text-2xl text-[var(--muse-muted)] font-serif italic leading-relaxed mb-12">
                      "Dialogue is the bridge between consumption and synthesis.
                      Talk to your room to discover the hidden lineage of your
                      collected signals."
                    </p>

                    <div className="relative max-w-2xl mx-auto">
                      <EmojiInput
                        value={dialogueInput}
                        onInput={setDialogueInput}
                        placeholder="What patterns are emerging in this room?"
                        multiline
                        rows={5}
                        className="w-full bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/10 rounded-[2.5rem] px-10 py-8 text-[var(--muse-text)] placeholder-gray-700 focus:outline-none focus:border-canvas-primary/40 focus:bg-[var(--muse-text)]/[0.08] transition-all min-h-[160px] text-xl font-serif italic outline-none resize-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          handleDialogueAction(
                            dialogueInput || "General Query",
                          )}
                        disabled={isAnalyzing}
                        className={`absolute bottom-6 right-6 w-14 h-14 bg-[var(--muse-text)] text-[var(--muse-bg)] rounded-2xl flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer ${
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

                    {isAnalyzing && (
                      <div className="mt-8">
                        <AnalysisIndicator
                          stage="analyzing"
                          message="Analyzing your artifacts in real-time..."
                          progress={65}
                        />
                      </div>
                    )}

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
                          className={`px-6 py-3 rounded-full bg-[var(--muse-text)]/5 border border-[var(--muse-text)]/5 text-[9px] font-bold uppercase tracking-widest text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:border-canvas-primary transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed`}
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-8 overflow-x-auto pb-4 scrollbar-hide">
                  <div className="p-10 bg-[var(--muse-text)]/[0.02] border border-[var(--muse-text)]/5 rounded-[3rem] min-w-[420px] flex-[1.2] flex-shrink-0">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-6 flex items-center gap-2">
                      <Icons.Layers size={14} /> Cognitive Lineage
                    </h4>
                    <div className="space-y-6">
                      <p className="text-lg text-[var(--muse-text)] font-serif italic leading-relaxed">
                        "This room is showing a strong resonance with 'Aesthetic
                        Brutalism'. 3 out of 5 artifacts mention raw materials
                        as a form of honesty."
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="h-1 flex-1 bg-[var(--muse-text)]/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              theme.bg.replace("/10", "/60")
                            } w-[65%]`}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-[var(--muse-muted)]">
                          65% Synthesis
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 bg-[var(--muse-text)]/[0.02] border border-[var(--muse-text)]/5 rounded-[3rem] flex flex-col justify-center min-w-[320px] flex-[0.8] flex-shrink-0">
                    <p className="text-[var(--muse-muted)] font-serif italic text-lg leading-relaxed mb-8">
                      Ready to weave these artifacts into a living document?
                    </p>
                    {threadShared && newThreadId
                      ? (
                        <a
                          href={`/threads/${newThreadId}`}
                          className={`w-full py-5 block text-center bg-indigo-500/20 border-indigo-500/40 border text-indigo-400 font-bold uppercase tracking-widest text-[11px] rounded-2xl shadow-xl hover:-translate-y-1 transition-all cursor-pointer`}
                        >
                          View Published Thread
                        </a>
                      )
                      : (
                        <button
                          type="button"
                          onClick={() =>
                            handleDialogueAction("Synthesize to Thread")}
                          disabled={items.length === 0}
                          className={`w-full py-5 ${
                            theme.bg.replace("/10", "/80")
                          } ${theme.border} border text-[var(--muse-text)] font-bold uppercase tracking-widest text-[11px] rounded-2xl shadow-xl hover:-translate-y-1 transition-all cursor-pointer ${
                            items.length === 0
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {items.length === 0
                            ? "Add artifacts to synthesize"
                            : "Initialize Pattern Thread"}
                        </button>
                      )}
                  </div>
                </div>
              </div>
            )}
        </main>
      </div>
    </>
  );
}
