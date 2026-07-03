import { useEffect, useRef, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  captureMomentum,
  globalStreakSignal,
  loadGlobalStreak,
  type MomentumFeedItem,
  momentumFeedSignal,
  saveStreakPreferences,
  setSparkPermissions,
  streakPreferencesSignal,
  type UserStreak,
} from "../../signals/streaks.ts";
import { mirrorSignal } from "../../signals/mirror.ts";
import { userSignal } from "../../signals/user.ts";

const PROMPTS = [
  "Synthesize your current hyperfocus into one public insight.",
  "What abstract concept did you finally connect today?",
  "Share a raw, unpolished idea that needs community feedback.",
  "Distill today's research into a single spark for your network.",
  "What is a pattern you noticed today that others should see?",
];

const REACTIONS = ["❤️", "🤯", "🔥", "💡", "🫀"];

interface SocialRequest {
  id: string;
  requester_id: string;
  name: string;
  username: string;
  avatar_url?: string;
}

interface PartnerSpark {
  id: string;
  content: string;
  type: string;
  created_at: string;
  reactions: Array<{ emoji: string; count: number }>;
}

interface StreakCirclePartner {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerHandle?: string;
  count: number;
}

interface AttachmentItem {
  id: string;
  type: "file" | "photo" | "video" | "voice";
  name: string;
}

export default function StreakHub() {
  const [sharing, setSharing] = useState(false);
  const [circlePartners, setCirclePartners] = useState<StreakCirclePartner[]>(
    [],
  );
  const [circleLoading, setCircleLoading] = useState(false);
  const [circleLoaded, setCircleLoaded] = useState(false);
  const [justShared, setJustShared] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisContent, setSynthesisContent] = useState("");
  const [captureMode, setCaptureMode] = useState<"text" | "voice" | "camera">(
    "text",
  );
  const [destination, setDestination] = useState<string>("network");
  const [sourceType, setSourceType] = useState<
    "room" | "thread" | "journal" | "idea" | "artifact"
  >("room");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [activePrompt, setActivePrompt] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<
    UserStreak | StreakCirclePartner | null
  >(null);
  const [sparkIndex, setSparkIndex] = useState(0);
  const [partnerSparks, setPartnerSparks] = useState<PartnerSpark[]>([]);
  const [loadingSparks, setLoadingSparks] = useState(false);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState<SocialRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsLoaded, setRequestsLoaded] = useState(false);
  const [parallelMode, setParallelMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeSocialView, setActiveSocialView] = useState<
    "momentum" | "circle" | "requests"
  >("momentum");
  const pickerContainerRef = useRef<HTMLDivElement>(null);

  const streak = globalStreakSignal.value;
  const mirror = mirrorSignal.value;
  const user = userSignal.value;
  const enabledStreakTypes = streakPreferencesSignal.value;
  const circleCount = circlePartners.length;

  const mirrorPulseLabel = mirror.stats.views > 1400
    ? "a strong momentum wave"
    : mirror.stats.views > 1000
    ? "a rising network pulse"
    : mirror.stats.views > 700
    ? "a steady resonance"
    : "a quiet signal";

  const mirrorBridge = streak
    ? `Your mirror currently sees ${mirror.followerCount} nodes and ${mirror.stats.likes} upvotes. Keep the ${streak.currentStreak}-day streak alive by anchoring a spark.`
    : `Your mirror currently sees ${mirror.followerCount} nodes and ${mirror.stats.likes} upvotes. Start a streak from a captured spark to turn reflection into momentum.`;

  const recentMomentum = momentumFeedSignal.value.slice(0, 4);
  const currentStreakValue = streak?.currentStreak ?? 0;

  useEffect(() => {
    loadGlobalStreak().then(() => setIsInitializing(false));
  }, []);

  // Load pending entanglement requests when the header panel or requests tab is active
  useEffect(() => {
    if (
      !(showRequests || activeSocialView === "requests") || requestsLoading ||
      requestsLoaded
    ) {
      return;
    }
    setRequestsLoading(true);
    fetch("/api/user/social?action=requests")
      .then((r) => r.json())
      .then((d) => {
        if (d.requests) {
          setRequests(d.requests);
          setRequestsLoaded(true);
        }
      })
      .catch(console.error)
      .finally(() => setRequestsLoading(false));
  }, [showRequests, activeSocialView, requestsLoading, requestsLoaded]);

  useEffect(() => {
    if (activeSocialView !== "circle" || circleLoaded || circleLoading) return;
    setCircleLoading(true);
    fetch("/api/user/social?action=entanglements")
      .then((r) => r.json())
      .then((d) => {
        if (d.entanglements) {
          const entanglements = d.entanglements as Array<
            Record<string, unknown>
          >;
          setCirclePartners(entanglements.map((partner) => ({
            id: String(partner.partner_id ?? ""),
            partnerId: String(partner.partner_id ?? ""),
            partnerName: String(partner.partner_name ?? "Unknown"),
            partnerHandle: partner.partner_handle
              ? String(partner.partner_handle)
              : undefined,
            count: Number(partner.partner_streak ?? 0),
          })));
          setCircleLoaded(true);
        }
      })
      .catch(console.error)
      .finally(() => setCircleLoading(false));
  }, [activeSocialView, circleLoaded, circleLoading]);

  // Fetch partner sparks when a partner is selected
  const openPartnerViewer = async (
    partner: UserStreak | StreakCirclePartner,
  ) => {
    setSelectedPartner(partner);
    setSparkIndex(0);
    setMyReaction(null);
    setComment("");
    setPartnerSparks([]);
    setLoadingSparks(true);
    try {
      const res = await fetch(
        `/api/user/social?action=partner_sparks&partnerId=${partner.partnerId}`,
      );
      const data = await res.json();
      if (data.sparks) setPartnerSparks(data.sparks);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSparks(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    await fetch("/api/user/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "respond_request",
        requestId,
        accept: true,
      }),
    });
    setRequests((r: SocialRequest[]) => r.filter((x) => x.id !== requestId));
  };

  const handleAddAttachment = (attachment: AttachmentItem) => {
    setAttachments((current: AttachmentItem[]) => [attachment, ...current]);
  };

  const handleTriggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleSelectFiles = (files: FileList | null) => {
    if (!files) return;
    const added: AttachmentItem[] = [];
    for (const file of Array.from(files)) {
      added.push({ id: crypto.randomUUID(), type: "file", name: file.name });
    }
    setAttachments((current: AttachmentItem[]) => [...added, ...current]);
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      handleAddAttachment({
        id: crypto.randomUUID(),
        type: "voice",
        name: "Recorded voice note",
      });
    } else {
      setIsRecording(true);
    }
  };

  const handleIgnoreRequest = async (requestId: string) => {
    await fetch("/api/user/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "respond_request",
        requestId,
        accept: false,
      }),
    });
    setRequests((r: SocialRequest[]) => r.filter((x) => x.id !== requestId));
  };

  const handleReact = async (emoji: string, itemId: string) => {
    const next = myReaction === emoji ? null : emoji;
    setMyReaction(next);
    await fetch("/api/user/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "react", itemId, emoji }),
    });
  };

  const handleComment = async (itemId: string) => {
    if (!comment.trim()) return;
    const text = comment;
    setComment("");
    await fetch("/api/user/social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "comment", itemId, content: text }),
    });
  };

  useEffect(() => {
    if (showEmojiPicker) {
      import("emoji-picker-element").catch(console.error);
    }
  }, [showEmojiPicker]);

  useEffect(() => {
    const picker = pickerContainerRef.current?.querySelector("emoji-picker");
    if (!picker) return;
    const onEmoji = ((e: Event) => {
      const customEvent = e as CustomEvent;
      const emoji = customEvent.detail.unicode;
      const spark = partnerSparks[sparkIndex];
      if (spark) handleReact(emoji, spark.id);
      setShowEmojiPicker(false);
    }) as EventListener;
    picker.addEventListener("emoji-click", onEmoji);
    return () => picker.removeEventListener("emoji-click", onEmoji);
  }, [showEmojiPicker, sparkIndex, partnerSparks]);

  if (!user || isInitializing) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--muse-accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleSetPermission = async (
    key:
      | "show_active"
      | "show_mood"
      | "show_room_titles"
      | "show_journal_previews",
  ) => {
    setSharing(true);
    await setSparkPermissions({ [key]: !streak?.permissions?.[key] });
    setSharing(false);
  };

  const handleToggleStreakType = async (type: string) => {
    const next = enabledStreakTypes.includes(type)
      ? enabledStreakTypes.filter((value: string) => value !== type)
      : [...enabledStreakTypes, type];
    await saveStreakPreferences(next);
  };

  const handleShare = async () => {
    if (captureMode === "text" && !synthesisContent.trim()) return;

    if (isRecording) {
      setIsRecording(false);
      handleAddAttachment({
        id: crypto.randomUUID(),
        type: "voice",
        name: "Recorded voice note",
      });
    }

    setSharing(true);
    const finalContent = captureMode === "text"
      ? synthesisContent
      : `[Captured ${captureMode} artifact]`;
    const attachmentsLabel = attachments.length
      ? ` + ${attachments.length} attachment${
        attachments.length === 1 ? "" : "s"
      }`
      : "";
    const success = await captureMomentum(
      sourceType,
      `${finalContent}${attachmentsLabel}`,
      destination,
      true,
      enabledStreakTypes,
    );
    setSharing(false);

    if (success) {
      setJustShared(true);
      setIsSynthesizing(false);
      setSynthesisContent("");
      setTimeout(() => setJustShared(false), 3000);
    }
  };

  const handleOpenCapture = (
    source: "room" | "thread" | "journal" | "idea" | "artifact",
  ) => {
    setActivePrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    setIsSynthesizing(true);
    setCaptureMode("text");
    setSourceType(source);
    setDestination(
      source === "room"
        ? "network"
        : source === "thread"
        ? "thread:general"
        : "journal",
    );
    setSynthesisContent("");
    setAttachments([]);
    setIsRecording(false);
  };

  const needsOnboarding = streak && !streak.permissions;

  if (needsOnboarding || showSettings) {
    return (
      <div className="w-full min-h-screen flex flex-col p-6 lg:p-12 pb-32 bg-[#0a0a0a] animate-in fade-in duration-500 overflow-y-auto">
        <div className="max-w-4xl w-full mx-auto relative mt-8 lg:mt-16">
          {!needsOnboarding && (
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="absolute -top-16 left-0 flex items-center gap-2 text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-colors"
            >
              {/* @ts-ignore dynamic import */}
              <Icons.ArrowLeft size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">
                Back to Hub
              </span>
            </button>
          )}

          <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--muse-muted)] mb-8">
            {needsOnboarding ? "Onboarding" : "Settings"}
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-[var(--muse-text)] italic font-serif mb-12">
            {needsOnboarding ? "Configure Your Space" : "Manage Momentum"}
          </h2>

          <div className="flex flex-col gap-10">
            <section>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-4">
                Streak Permissions
              </h4>
              <div className="flex flex-col rounded-2xl bg-[#111111] border border-gray-800/50 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Activity size={20} className="text-emerald-400" />
                    <div>
                      <p className="text-base font-bold text-white">
                        Show Active Status
                      </p>
                      <p className="text-xs text-gray-400">
                        Let partners see that you synthesized today.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSetPermission("show_active")}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      streak?.permissions?.show_active
                        ? "bg-emerald-500"
                        : "bg-gray-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        streak?.permissions?.show_active
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Sparkles size={20} className="text-indigo-400" />
                    <div>
                      <p className="text-base font-bold text-white">
                        Show Mood Aura
                      </p>
                      <p className="text-xs text-gray-400">
                        Share a colorful aura representing your emotion.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSetPermission("show_mood")}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      streak?.permissions?.show_mood
                        ? "bg-indigo-500"
                        : "bg-gray-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        streak?.permissions?.show_mood
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Hash size={20} className="text-canvas-primary" />
                    <div>
                      <p className="text-base font-bold text-white">
                        Show Room Titles
                      </p>
                      <p className="text-xs text-gray-400">
                        Display the names of rooms you create.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSetPermission("show_room_titles")}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      streak?.permissions?.show_room_titles
                        ? "bg-canvas-primary"
                        : "bg-gray-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        streak?.permissions?.show_room_titles
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.DraftingCompass
                      size={20}
                      className="text-cyan-400"
                    />
                    <div>
                      <p className="text-base font-bold text-white">
                        My Streakables
                      </p>
                      <p className="text-xs text-gray-400">
                        Choose the rituals you want to count as momentum.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <div className="rounded-2xl border border-gray-800/70 bg-[#0b0b0b] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">
                          Your ritual menu
                        </p>
                        <p className="mt-1 text-xs text-gray-400">
                          Only enabled actions can extend your streak, so each
                          toggle becomes a deliberate act of intention.
                        </p>
                      </div>
                      <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300">
                        {enabledStreakTypes.length} active
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {[
                        {
                          key: "artifact",
                          label: "Artifacts",
                          description: "Share something tangible or finished.",
                        },
                        {
                          key: "room",
                          label: "Rooms",
                          description:
                            "Create a new place for thinking together.",
                        },
                        {
                          key: "thread",
                          label: "Threads",
                          description: "Carry an idea into a deeper chain.",
                        },
                        {
                          key: "synthesis",
                          label: "Syntheses",
                          description:
                            "Turn scattered insight into a clear pattern.",
                        },
                        {
                          key: "idea",
                          label: "Ideas",
                          description:
                            "Capture a fresh thought before it slips away.",
                        },
                        {
                          key: "journal",
                          label: "Journal",
                          description:
                            "Write a reflective entry that moves you forward.",
                        },
                      ].map((option) => {
                        const active = enabledStreakTypes.includes(option.key);
                        return (
                          <button
                            key={option.key}
                            type="button"
                            onClick={() => handleToggleStreakType(option.key)}
                            className={`rounded-2xl border p-3 text-left transition ${
                              active
                                ? "border-emerald-500/40 bg-emerald-500/10"
                                : "border-gray-800 bg-[#0f0f0f] hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p
                                  className={`text-sm font-semibold ${
                                    active ? "text-white" : "text-gray-300"
                                  }`}
                                >
                                  {option.label}
                                </p>
                                <p
                                  className={`mt-1 text-xs ${
                                    active ? "text-gray-300" : "text-gray-500"
                                  }`}
                                >
                                  {option.description}
                                </p>
                              </div>
                              <span
                                className={`text-[10px] uppercase tracking-[0.25em] ${
                                  active ? "text-emerald-400" : "text-gray-500"
                                }`}
                              >
                                {active ? "On" : "Off"}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <p className="mt-4 text-[11px] uppercase tracking-[0.25em] text-gray-500">
                      Your streak stays meaningful because you decide what
                      deserves a spark.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Eye size={20} className="text-rose-400" />
                    <div>
                      <p className="text-base font-bold text-white">
                        Show Journal Previews
                      </p>
                      <p className="text-xs text-gray-400">
                        Show short snippets of your journal entries.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSetPermission("show_journal_previews")}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      streak?.permissions?.show_journal_previews
                        ? "bg-rose-500"
                        : "bg-gray-800"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        streak?.permissions?.show_journal_previews
                          ? "translate-x-6"
                          : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* PREFERENCES SECTION */}
            <section>
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-4">
                Preferences
              </h4>
              <div className="flex flex-col rounded-2xl bg-[#111111] border border-gray-800/50 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors opacity-60">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Repeat size={20} className="text-gray-400" />
                    <div>
                      <p className="text-base font-bold text-white flex items-center gap-2">
                        Auto-share Sparks{" "}
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-gray-700 bg-gray-800 uppercase tracking-wider">
                          Soon
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Automatically share when you complete a synthesis.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-12 h-6 rounded-full p-1 bg-gray-800 cursor-not-allowed"
                  >
                    <div className="w-4 h-4 bg-gray-500 rounded-full" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors opacity-60">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.UserPlus size={20} className="text-gray-400" />
                    <div>
                      <p className="text-base font-bold text-white flex items-center gap-2">
                        Allow Streak Invites{" "}
                        <span className="text-[9px] px-1.5 py-0.5 rounded border border-gray-700 bg-gray-800 uppercase tracking-wider">
                          Soon
                        </span>
                      </p>
                      <p className="text-xs text-gray-400">
                        Let community members invite you to shared streaks.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="w-12 h-6 rounded-full p-1 bg-gray-800 cursor-not-allowed"
                  >
                    <div className="w-4 h-4 bg-gray-500 rounded-full" />
                  </button>
                </div>
              </div>
            </section>
          </div>

          {needsOnboarding && (
            <div className="mt-12 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm hover:scale-105 transition-transform"
              >
                Continue to Hub
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- MAIN HUB ---
  let flameColor = "text-orange-500";
  let flameBg = "bg-orange-500/10";
  let flameShadow = "shadow-[0_0_100px_rgba(249,115,22,0.15)]";

  if (streak && streak.currentStreak >= 7) {
    flameColor = "text-rose-500";
    flameBg = "bg-rose-500/10";
    flameShadow = "shadow-[0_0_120px_rgba(244,63,94,0.2)]";
  }
  if (streak && streak.currentStreak >= 30) {
    flameColor = "text-purple-500";
    flameBg = "bg-purple-500/10";
    flameShadow = "shadow-[0_0_150px_rgba(168,85,247,0.3)]";
  }

  return (
    <div className="w-full min-h-screen flex flex-col pb-32 relative overflow-y-auto overflow-x-hidden bg-[var(--muse-bg)]">
      {/* Header Row: Bell + Settings */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        {/* Entanglement Requests Bell */}
        <button
          type="button"
          onClick={() => setShowRequests(!showRequests)}
          className="relative w-12 h-12 rounded-full bg-[var(--muse-surface)] border border-[var(--muse-border)] flex items-center justify-center text-[var(--muse-muted)] hover:text-[var(--muse-text)] transition-all shadow-md"
        >
          {/* @ts-ignore dynamic import */}
          <Icons.Bell size={20} />
          {requests.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
              {requests.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 rounded-full bg-[var(--muse-surface)] border border-[var(--muse-border)] flex items-center justify-center text-[var(--muse-muted)] hover:text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-all shadow-md cursor-pointer"
        >
          {/* @ts-ignore dynamic import */}
          <Icons.Settings2 size={20} />
        </button>
      </div>

      {/* Entanglement Requests Panel */}
      {showRequests && (
        <div className="absolute top-24 right-6 z-50 w-80 bg-[#111] border border-gray-800 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-5 border-b border-gray-800">
            <h3 className="text-sm font-bold text-white">
              Entanglement Requests
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              People who want to streak with you
            </p>
          </div>
          {requests.length === 0
            ? (
              <p className="p-5 text-sm text-gray-500 text-center">
                No pending requests
              </p>
            )
            : (
              <div className="divide-y divide-gray-800">
                {requests.map((req: SocialRequest) => (
                  <div key={req.id} className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500/30 to-rose-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-white">
                        {req.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {req.name}
                      </p>
                      <p className="text-xs text-gray-500">@{req.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleAcceptRequest(req.id)}
                        className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:scale-105 transition-transform"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleIgnoreRequest(req.id)}
                        className="px-3 py-1.5 rounded-full bg-white/10 text-gray-400 text-xs font-bold hover:bg-white/20 transition-colors"
                      >
                        Ignore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      )}

      {/* Decorative background glow */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none opacity-50 ${flameShadow} transition-all duration-1000`}
      />

      <div className="w-full max-w-5xl mx-auto mb-6 px-6 lg:px-0 relative z-10">
        <div className="inline-flex rounded-full border border-[var(--muse-border)] bg-[var(--muse-surface)]/80 p-1.5 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setActiveSocialView("momentum")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] transition ${
              activeSocialView === "momentum"
                ? "bg-white text-black"
                : "text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
            }`}
          >
            <Icons.Flame size={14} />
            Momentum
          </button>
          <button
            type="button"
            onClick={() => setActiveSocialView("circle")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] transition ${
              activeSocialView === "circle"
                ? "bg-white text-black"
                : "text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
            }`}
          >
            <Icons.Users size={14} />
            Streak Circle
          </button>
          <button
            type="button"
            onClick={() => setActiveSocialView("requests")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.28em] transition ${
              activeSocialView === "requests"
                ? "bg-white text-black"
                : "text-[var(--muse-muted)] hover:text-[var(--muse-text)]"
            }`}
          >
            <Icons.Bell size={14} />
            Requests
          </button>
        </div>
      </div>

      {activeSocialView === "circle" && (
        <div className="w-full max-w-5xl mx-auto mb-8 px-6 lg:px-0 relative z-10">
          <div className="rounded-[2rem] border border-[var(--muse-border)] bg-[var(--muse-surface)]/80 p-6 backdrop-blur-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--muse-muted)]">
                  Streak Circle
                </p>
                <h3 className="mt-2 text-2xl font-black text-[var(--muse-text)]">
                  Your people, your rhythm
                </h3>
                <p className="mt-2 max-w-2xl text-sm text-[var(--muse-muted)]">
                  This is the shared layer for friends, followers, and invitees.
                  Open a person to view their latest spark, react, and streak
                  back in the same place.
                </p>
              </div>
              <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-300">
                {circleLoading ? "Loading..." : `${circleCount} active`}
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {circleLoading
                ? (
                  <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-8 text-center text-sm text-[var(--muse-muted)] lg:col-span-2">
                    Loading your streak circle...
                  </div>
                )
                : circlePartners.length > 0
                ? (
                  circlePartners.map((partner: StreakCirclePartner) => (
                    <button
                      key={partner.id}
                      type="button"
                      onClick={() => openPartnerViewer(partner)}
                      className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 text-left transition hover:border-[var(--muse-accent)] hover:bg-white/5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500/30 to-rose-500/30 text-sm font-black text-white">
                            {partner.partnerName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">
                              {partner.partnerName}
                            </p>
                            <p className="text-xs text-[var(--muse-muted)]">
                              {partner.count} day streak
                            </p>
                            {partner.partnerHandle && (
                              <p className="text-[10px] text-[var(--muse-muted)]">
                                @{partner.partnerHandle}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muse-muted)]">
                          Open
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-[var(--muse-muted)]">
                        Tap in to see their latest spark, leave a reaction, or
                        respond with your own parallel streak.
                      </p>
                    </button>
                  ))
                )
                : (
                  <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-5 text-sm text-[var(--muse-muted)] lg:col-span-2">
                    Your circle is still empty. Invite a friend from community
                    or accept a streak request to start building this view.
                  </div>
                )}
            </div>

            {requests.length > 0 && (
              <div className="mt-8 rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--muse-muted)]">
                      Pending invites
                    </p>
                    <p className="mt-1 text-sm text-white">
                      People who want to streak with you
                    </p>
                  </div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muse-muted)]">
                    {requests.length} waiting
                  </div>
                </div>
                <div className="mt-4 space-y-3">
                  {requests.map((request: SocialRequest) => (
                    <div
                      key={request.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500/30 to-rose-500/30 text-sm font-black text-white">
                          {request.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {request.name}
                          </p>
                          <p className="text-xs text-[var(--muse-muted)]">
                            @{request.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIgnoreRequest(request.id)}
                          className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muse-muted)]"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSocialView === "requests" && (
        <div className="w-full max-w-5xl mx-auto mb-8 px-6 lg:px-0 relative z-10">
          <div className="rounded-[2rem] border border-[var(--muse-border)] bg-[var(--muse-surface)]/80 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--muse-muted)]">
                  Requests
                </p>
                <h3 className="mt-2 text-2xl font-black text-[var(--muse-text)]">
                  People who want to streak with you
                </h3>
              </div>
              <div className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muse-muted)]">
                {requests.length} pending
              </div>
            </div>
            {requests.length === 0
              ? (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-6 text-sm text-[var(--muse-muted)]">
                  No one is asking to streak with you yet. When they do, the
                  request will appear here and in the circle view.
                </div>
              )
              : (
                <div className="mt-6 space-y-3">
                  {requests.map((request: SocialRequest) => (
                    <div
                      key={request.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-white/10 bg-black/20 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500/30 to-rose-500/30 text-sm font-black text-white">
                          {request.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {request.name}
                          </p>
                          <p className="text-xs text-[var(--muse-muted)]">
                            @{request.username}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(request.id)}
                          className="rounded-full bg-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-black"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => handleIgnoreRequest(request.id)}
                          className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muse-muted)]"
                        >
                          Ignore
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        </div>
      )}

      {activeSocialView === "momentum" && (
        <>
          {/* Main Flame Section */}
          <div className="w-full max-w-5xl mx-auto mb-8 px-6 lg:px-0">
            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 text-sm text-gray-300">
                <div className="flex items-center gap-2 mb-3 text-[11px] uppercase tracking-[0.3em] text-[var(--muse-muted)]">
                  {/* @ts-ignore dynamic import */}
                  <Icons.Radar size={14} className="text-cyan-400" />
                  <span>Mirror Signal</span>
                </div>
                <p className="leading-relaxed">
                  Your mirror is reading {mirrorPulseLabel}. {mirrorBridge}
                </p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 text-sm text-gray-300">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="text-[11px] uppercase tracking-[0.3em] text-[var(--muse-muted)]">
                    Recent sparks
                  </div>
                  <div className="text-xs text-emerald-400">
                    {currentStreakValue}d active
                  </div>
                </div>
                {recentMomentum.length > 0
              ? (
                <div className="space-y-3">
                  {recentMomentum.map((item: MomentumFeedItem) => (
                    <div
                      key={`${item.type}-${item.created_at}`}
                      className="rounded-2xl border border-white/5 bg-black/20 p-3"
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.3em] text-[var(--muse-muted)]">
                        <span>{item.type}</span>
                        <span>
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-white">{item.content}</p>
                    </div>
                  ))}
                </div>
              )
              : (
                <p className="text-sm text-gray-400">
                  Your first spark will appear here as soon as you capture one.
                </p>
              )}
            <a
              href="/connections"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-300 transition hover:bg-cyan-400/20"
            >
              <Icons.Users size={14} />
              Open community
            </a>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 pt-10 pb-8">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--muse-muted)] mb-4">
          Cognitive Momentum
        </h3>

        <div className="relative flex flex-col items-center justify-center mb-8">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center ${flameBg} border border-[var(--muse-border)] mb-4 transition-all duration-700`}
          >
            {/* @ts-ignore dynamic import */}
            <Icons.Flame
              size={64}
              className={`${flameColor} ${
                streak && streak.currentStreak > 0
                  ? "animate-pulse"
                  : "opacity-50"
              } transition-colors duration-700`}
            />
          </div>
          <div className="text-6xl font-black text-[var(--muse-text)] tracking-tighter">
            {streak ? streak.currentStreak : 0}
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--muse-muted)] mt-1">
            Day Streak
          </p>
          {/* Milestone progress */}
          {streak && (
            (() => {
              const milestones = [7, 30, 100, 365];
              const current = streak.currentStreak || 0;
              let prev = 0;
              let next = milestones[milestones.length - 1];
              for (const m of milestones) {
                if (m <= current) prev = m;
                if (m > current && next === milestones[milestones.length - 1]) {
                  next = m;
                }
              }
              const span = Math.max(1, next - prev);
              const progress = Math.min(
                100,
                Math.round(((current - prev) / span) * 100),
              );

              return (
                <div className="w-full max-w-xs mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[var(--muse-muted)]">
                      Next milestone: {next}d
                    </span>
                    <span className="text-xs font-bold text-[var(--muse-text)]">
                      {progress}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-orange-400 to-rose-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {justShared
          ? (
            <div className="w-full max-w-sm text-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* @ts-ignore dynamic import */}
              <Icons.CheckCircle
                size={32}
                className="text-emerald-500 mx-auto mb-4"
              />
              <p className="text-xl font-bold text-[var(--muse-text)]">
                Spark Shared
              </p>
              <p className="text-sm text-[var(--muse-muted)]">
                Momentum captured.
              </p>
            </div>
          )
          : (
            <div className="w-full max-w-5xl flex flex-col gap-8">
              <div className="grid gap-4 sm:grid-cols-3 w-full">
                <button
                  type="button"
                  onClick={() => handleOpenCapture("room")}
                  className="px-6 py-4 rounded-3xl bg-gradient-to-r from-indigo-600 to-cyan-500 text-white font-bold text-base shadow-[0_0_25px_rgba(56,189,248,0.25)] hover:shadow-[0_0_40px_rgba(56,189,248,0.35)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-start gap-3"
                >
                  <span className="text-sm uppercase tracking-[0.28em] text-white/70">
                    Quick Streak
                  </span>
                  <span className="text-xl font-black">Streak this room</span>
                  <span className="text-sm text-white/80">
                    Capture the moment and keep your flow alive.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCapture("thread")}
                  className="px-6 py-4 rounded-3xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-base shadow-[0_0_25px_rgba(236,72,153,0.25)] hover:shadow-[0_0_40px_rgba(236,72,153,0.35)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-start gap-3"
                >
                  <span className="text-sm uppercase tracking-[0.28em] text-white/70">
                    Thread Spark
                  </span>
                  <span className="text-xl font-black">Streak a thread</span>
                  <span className="text-sm text-white/80">
                    Mark a discussion or idea as worth sharing.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenCapture("journal")}
                  className="px-6 py-4 rounded-3xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-base shadow-[0_0_25px_rgba(251,191,36,0.25)] hover:shadow-[0_0_40px_rgba(251,191,36,0.35)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col items-start gap-3"
                >
                  <span className="text-sm uppercase tracking-[0.28em] text-black/70">
                    Journal Flex
                  </span>
                  <span className="text-xl font-black">Streak your note</span>
                  <span className="text-sm text-black/80">
                    Quickly log a journal insight or reflection.
                  </span>
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {momentumFeedSignal.value.length > 0
                  ? (
                    momentumFeedSignal.value.map((
                      item: MomentumFeedItem,
                      i: number,
                    ) => (
                      <div
                        key={i}
                        className="p-5 rounded-[2rem] bg-[var(--muse-surface)] border border-[var(--muse-border)] flex flex-col gap-2 relative overflow-hidden group"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--muse-accent)] to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-2 mb-1">
                          {/* @ts-ignore dynamic import */}
                          {item.type === "network"
                            ? (
                              <Icons.Globe
                                size={14}
                                className="text-[var(--muse-muted)]"
                              />
                            )
                            : (
                              <Icons.LayoutGrid
                                size={14}
                                className="text-[var(--muse-muted)]"
                              />
                            )}
                          <p className="text-xs font-bold text-[var(--muse-muted)] uppercase tracking-wider">
                            {item.type === "network"
                              ? "Public Spark"
                              : item.type === "room"
                              ? "Room Created"
                              : "Artifact Added"}
                          </p>
                          <span className="text-[10px] text-gray-600 ml-auto">
                            {new Date(item.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="text-base text-[var(--muse-text)] leading-relaxed">
                          {item.content}
                        </p>
                      </div>
                    ))
                  )
                  : (
                    <p className="text-sm text-gray-400 text-center">
                      No momentum captured yet today. Share a spark to begin.
                    </p>
                  )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Full-Screen Partner Spark Viewer */}
      {selectedPartner && !parallelMode && (() => {
        const spark = partnerSparks[sparkIndex];
        return (
          <div className="fixed inset-0 z-[100] flex flex-col bg-black animate-in fade-in duration-300">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 pt-10 pb-4">
              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className="text-gray-500 hover:text-white transition-colors"
              >
                {/* @ts-ignore dynamic import */}
                <Icons.ChevronLeft size={28} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500/30 to-rose-500/30 flex items-center justify-center">
                  <span className="font-black text-white">
                    {selectedPartner.partnerName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">
                    {selectedPartner.partnerName}
                  </p>
                  <div className="flex items-center gap-1">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Flame size={12} className="text-orange-500" />
                    <span className="text-xs font-bold text-orange-500">
                      {selectedPartner.count} day streak
                    </span>
                  </div>
                </div>
              </div>
              <div className="w-8" />
            </div>

            {/* Loading state */}
            {loadingSparks
              ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border-2 border-white border-t-transparent animate-spin" />
                </div>
              )
              : partnerSparks.length === 0
              ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500 text-sm">No public sparks yet.</p>
                </div>
              )
              : (
                <>
                  {/* Spark progress dots */}
                  <div className="flex gap-1.5 px-6 mb-6">
                    {partnerSparks.map((_ps: PartnerSpark, i: number) => (
                      <div
                        key={i}
                        className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                          i === sparkIndex
                            ? "bg-white"
                            : i < sparkIndex
                            ? "bg-white/40"
                            : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Spark content */}
                  <div className="flex-1 flex flex-col items-center justify-center px-8">
                    <div className="w-full max-w-2xl">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6 block">
                        {spark?.type === "network"
                          ? "Public Spark"
                          : "Artifact"} · {spark
                          ? new Date(spark.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          : ""}
                      </span>
                      <p className="text-2xl md:text-4xl font-bold text-white leading-snug font-serif">
                        {spark?.content}
                      </p>

                      {/* Existing reactions tally */}
                      <div className="flex gap-3 mt-10 flex-wrap">
                        {(spark?.reactions ?? []).map((
                          r: { emoji: string; count: number },
                        ) => (
                          <span
                            key={r.emoji}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-sm font-bold text-white"
                          >
                            {r.emoji}{" "}
                            <span className="text-xs text-gray-300">
                              {r.count}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Prev / Next navigation */}
                  <div className="flex justify-between px-6 mb-4">
                    <button
                      type="button"
                      onClick={() =>
                        setSparkIndex((i: number) => Math.max(0, i - 1))}
                      disabled={sparkIndex === 0}
                      className="p-3 rounded-full bg-white/10 text-white disabled:opacity-20 hover:bg-white/20 transition-colors"
                    >
                      {/* @ts-ignore dynamic import */}
                      <Icons.ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSparkIndex((i: number) =>
                          Math.min(partnerSparks.length - 1, i + 1)
                        )}
                      disabled={sparkIndex >= partnerSparks.length - 1}
                      className="p-3 rounded-full bg-white/10 text-white disabled:opacity-20 hover:bg-white/20 transition-colors"
                    >
                      {/* @ts-ignore dynamic import */}
                      <Icons.ChevronRight size={20} />
                    </button>
                  </div>

                  {/* Interaction bar: Reactions + Comment + Streak Back */}
                  <div className="px-6 pb-10 border-t border-white/10 pt-5 flex flex-col gap-4">
                    {/* Emoji Reactions */}
                    <div className="flex items-center gap-3 justify-center relative">
                      {REACTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => spark && handleReact(emoji, spark.id)}
                          className={`text-2xl w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                            myReaction === emoji
                              ? "bg-white/20 scale-125"
                              : "bg-white/5 hover:bg-white/15 hover:scale-110"
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}

                      {/* Custom Emoji Picker Button */}
                      <button
                        type="button"
                        onClick={() =>
                          setShowEmojiPicker(!showEmojiPicker)}
                        className={`text-gray-400 hover:text-white w-12 h-12 rounded-full flex items-center justify-center transition-all border border-dashed border-white/20 ${
                          showEmojiPicker ? "bg-white/10" : "hover:bg-white/5"
                        }`}
                      >
                        {/* @ts-ignore dynamic import */}
                        <Icons.Plus size={20} />
                      </button>

                      {showEmojiPicker && (
                        <div
                          ref={pickerContainerRef}
                          className="absolute bottom-16 z-50"
                        >
                          {/* @ts-ignore custom element */}
                          <emoji-picker class="dark"></emoji-picker>
                        </div>
                      )}
                    </div>

                    {/* Comment Input */}
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                      <input
                        type="text"
                        value={comment}
                        onInput={(e) => setComment(e.currentTarget.value)}
                        placeholder="Reply with a thought..."
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-600"
                      />
                      {comment.trim() && (
                        <button
                          type="button"
                          onClick={() => spark && handleComment(spark.id)}
                          className="text-[var(--muse-accent)] text-xs font-bold"
                        >
                          Send
                        </button>
                      )}
                    </div>

                    {/* Streak Back / Parallel Spark */}
                    <button
                      type="button"
                      onClick={() => {
                        setParallelMode(true);
                        setDestination(`partner:${selectedPartner.id}`);
                        setActivePrompt(
                          `Responding to ${
                            selectedPartner.partnerName.split(" ")[0]
                          }'s spark...`,
                        );
                        setIsSynthesizing(true);
                        setCaptureMode("text");
                        setSynthesisContent("");
                      }}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-rose-600 text-white font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      {/* @ts-ignore dynamic import */}
                      <Icons.Zap size={18} /> Parallel Spark — Streak Back
                    </button>
                  </div>
                </>
              )}
          </div>
        );
      })()}

      {/* Immersive Contemplation Modal */}
      {isSynthesizing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-700">
          <button
            type="button"
            onClick={() => {
              setIsSynthesizing(false);
              setParallelMode(false);
            }}
            className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors"
          >
            {/* @ts-ignore dynamic import */}
            <Icons.X size={32} />
          </button>

          <div className="w-full max-w-3xl flex flex-col items-center justify-center h-full relative z-10 animate-in slide-in-from-bottom-10 duration-700">
            {/* The Deep Prompt */}
            <h2 className="text-3xl md:text-5xl font-black text-white text-center tracking-tight mb-16 leading-tight italic font-serif">
              "{activePrompt}"
            </h2>

            {/* Input Modes */}
            <div className="w-full flex flex-col items-center gap-8">
              {/* Mode Toggles */}
              <div className="flex items-center gap-4 p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setCaptureMode("text")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                    captureMode === "text"
                      ? "bg-white text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {/* @ts-ignore dynamic import */}
                  <Icons.Type size={16} /> Text
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureMode("voice")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                    captureMode === "voice"
                      ? "bg-white text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {/* @ts-ignore dynamic import */}
                  <Icons.Mic size={16} /> Voice
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureMode("camera")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                    captureMode === "camera"
                      ? "bg-white text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {/* @ts-ignore dynamic import */}
                  <Icons.Camera size={16} /> Camera
                </button>
              </div>

              {/* Input Area */}
              <div className="w-full flex justify-center min-h-[160px]">
                {captureMode === "text" && (
                  <textarea
                    value={synthesisContent}
                    onInput={(e) => setSynthesisContent(e.currentTarget.value)}
                    placeholder="What did you create or synthesize today?"
                    className="w-full max-w-2xl bg-transparent border-b-2 border-white/20 p-4 text-white text-xl focus:border-[var(--muse-accent)] outline-none resize-none min-h-[120px] transition-colors placeholder:text-gray-600 font-serif"
                    autoFocus
                  />
                )}

                {captureMode === "voice" && (
                  <div className="flex flex-col items-center justify-center gap-6">
                    <button
                      type="button"
                      onClick={() => setIsRecording(!isRecording)}
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                        isRecording
                          ? "bg-red-500/20 text-red-500 animate-pulse border-2 border-red-500"
                          : "bg-white/10 text-white hover:bg-white/20 border-2 border-transparent"
                      }`}
                    >
                      {/* @ts-ignore dynamic import */}
                      <Icons.Mic
                        size={40}
                        className={isRecording ? "animate-pulse" : ""}
                      />
                    </button>
                    <p className="text-sm font-bold tracking-widest text-gray-400 uppercase">
                      {isRecording ? "Listening..." : "Tap to Record"}
                    </p>
                  </div>
                )}

                {captureMode === "camera" && (
                  <div className="flex flex-col items-center justify-center gap-6">
                    <div className="w-full max-w-md aspect-video rounded-3xl bg-black border border-white/20 flex items-center justify-center relative overflow-hidden">
                      {/* Mock Viewfinder */}
                      <div className="absolute inset-0 border-4 border-white/5 m-4 rounded-xl" />
                      <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">
                        Camera Viewfinder Active
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsRecording(!isRecording)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-4 ${
                        isRecording
                          ? "border-red-500 bg-red-500"
                          : "border-white bg-white/20 hover:bg-white"
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* Destination & Submit */}
              <div className="w-full max-w-2xl flex items-center justify-between mt-12 pt-8 border-t border-white/10">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Route Artifact To:
                  </span>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.currentTarget.value)}
                    className="bg-transparent text-white font-bold text-lg outline-none cursor-pointer"
                  >
                    <option value="network" className="bg-black text-white">
                      Publish to Network
                    </option>
                    <option value="new_room" className="bg-black text-white">
                      Create New Room
                    </option>
                    <option
                      value="room-sys-arch"
                      className="bg-black text-white"
                    >
                      Add to Room: System Architecture
                    </option>
                    <option
                      value="thread:general"
                      className="bg-black text-white"
                    >
                      Add to Thread: General
                    </option>
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Attachments
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleTriggerFileSelect}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 transition"
                    >
                      <Icons.Plus size={16} /> Attach file
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddAttachment({
                          id: crypto.randomUUID(),
                          type: "photo",
                          name: "Captured photo",
                        })}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 transition"
                    >
                      <Icons.Camera size={16} /> Photo
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleAddAttachment({
                          id: crypto.randomUUID(),
                          type: "video",
                          name: "Captured video",
                        })}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 transition"
                    >
                      <Icons.Video size={16} /> Video
                    </button>
                    <button
                      type="button"
                      onClick={handleToggleRecording}
                      className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white hover:bg-white/10 transition"
                    >
                      <Icons.Mic size={16} /> {isRecording ? "Stop" : "Voice"}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => handleSelectFiles(e.currentTarget.files)}
                  />
                  {attachments.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {attachments.map((attachment: AttachmentItem) => (
                        <span
                          key={attachment.id}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs text-white"
                        >
                          {attachment.type === "file"
                            ? "📎"
                            : attachment.type === "photo"
                            ? "🖼️"
                            : attachment.type === "video"
                            ? "🎥"
                            : "🎤"}
                          {attachment.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing ||
                    (captureMode === "text" && !synthesisContent.trim())}
                  className="px-10 py-4 rounded-full bg-white text-black font-black uppercase tracking-widest text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                  {sharing ? "Anchoring..." : "Capture Momentum"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
