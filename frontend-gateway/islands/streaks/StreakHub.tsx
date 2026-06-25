import { useEffect, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  globalStreakSignal,
  momentumFeedSignal,
  loadGlobalStreak,
  setSparkPermissions,
  captureMomentum,
  streaksSignal,
  type UserStreak,
} from "../../signals/streaks.ts";
import { userSignal } from "../../signals/user.ts";

const PROMPTS = [
  "Synthesize your current hyperfocus into one public insight.",
  "What abstract concept did you finally connect today?",
  "Share a raw, unpolished idea that needs community feedback.",
  "Distill today's research into a single spark for your network.",
  "What is a pattern you noticed today that others should see?"
];

const REACTIONS = ["❤️", "🤯", "🔥", "💡", "🫀"];

const PENDING_REQUESTS = [
  { id: "req-1", name: "Kwame Otieno", handle: "@kwame.synthesizes", mutual: 2 },
  { id: "req-2", name: "Amara Diallo", handle: "@amara.mind", mutual: 5 },
];

const PARTNER_SPARKS: Record<string, Array<{id: string; content: string; type: string; time: string; reactions: Record<string, number>}>> = {
  default: [
    { id: "s1", content: "Finished mapping the relationship between entropy and creative blocks. The parallel is striking — systems resist order until energy is applied.", type: "network", time: "2h ago", reactions: { "🔥": 3, "💡": 7 } },
    { id: "s2", content: "Started a new room: Quantum Cognition. Exploring how superposition might apply to decision-making under uncertainty.", type: "room", time: "5h ago", reactions: { "❤️": 2, "🤯": 4 } },
  ]
};

export default function StreakHub() {
  const [sharing, setSharing] = useState(false);
  const [justShared, setJustShared] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisContent, setSynthesisContent] = useState("");
  const [captureMode, setCaptureMode] = useState<"text" | "voice" | "camera">("text");
  const [destination, setDestination] = useState<string>("network");
  const [isRecording, setIsRecording] = useState(false);
  const [activePrompt, setActivePrompt] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<UserStreak | null>(null);
  const [sparkIndex, setSparkIndex] = useState(0);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [showRequests, setShowRequests] = useState(false);
  const [requests, setRequests] = useState(PENDING_REQUESTS);
  const [parallelMode, setParallelMode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const streak = globalStreakSignal.value;
  const user = userSignal.value;
  const partnerStreaks = streaksSignal.value;

  useEffect(() => {
    loadGlobalStreak().then(() => setIsInitializing(false));
  }, []);

  if (!user || isInitializing) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[var(--muse-accent)] border-t-transparent animate-spin" />
      </div>
    );
  }

  const handleSetPermission = async (key: "show_active" | "show_mood" | "show_room_titles" | "show_journal_previews") => {
    setSharing(true);
    await setSparkPermissions({ [key]: !streak?.permissions?.[key] });
    setSharing(false);
  };

  const handleShare = async () => {
    if (captureMode === "text" && !synthesisContent.trim()) return;
    
    // For voice/camera, simulate finishing recording
    if (isRecording) setIsRecording(false);
    
    setSharing(true);
    // In a real app, voice/camera would upload a file and return a URL.
    // Here we just use a placeholder text if not in text mode.
    const finalContent = captureMode === "text" 
      ? synthesisContent 
      : `[Captured ${captureMode} artifact]`;
      
    const success = await captureMomentum(captureMode, finalContent, destination);
    setSharing(false);
    
    if (success) {
      setJustShared(true);
      setIsSynthesizing(false);
      setSynthesisContent("");
      setTimeout(() => setJustShared(false), 3000);
    }
  };

  const handleOpenCapture = () => {
    setActivePrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
    setIsSynthesizing(true);
    setCaptureMode("text");
    setDestination("network");
    setSynthesisContent("");
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
              <span className="text-sm font-bold uppercase tracking-widest">Back to Hub</span>
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
                      <p className="text-base font-bold text-white">Show Active Status</p>
                      <p className="text-xs text-gray-400">Let partners see that you synthesized today.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSetPermission("show_active")}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${streak?.permissions?.show_active ? "bg-emerald-500" : "bg-gray-800"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${streak?.permissions?.show_active ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Sparkles size={20} className="text-indigo-400" />
                    <div>
                      <p className="text-base font-bold text-white">Show Mood Aura</p>
                      <p className="text-xs text-gray-400">Share a colorful aura representing your emotion.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSetPermission("show_mood")}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${streak?.permissions?.show_mood ? "bg-indigo-500" : "bg-gray-800"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${streak?.permissions?.show_mood ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Hash size={20} className="text-canvas-primary" />
                    <div>
                      <p className="text-base font-bold text-white">Show Room Titles</p>
                      <p className="text-xs text-gray-400">Display the names of rooms you create.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSetPermission("show_room_titles")}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${streak?.permissions?.show_room_titles ? "bg-canvas-primary" : "bg-gray-800"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${streak?.permissions?.show_room_titles ? "translate-x-6" : "translate-x-0"}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Eye size={20} className="text-rose-400" />
                    <div>
                      <p className="text-base font-bold text-white">Show Journal Previews</p>
                      <p className="text-xs text-gray-400">Show short snippets of your journal entries.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSetPermission("show_journal_previews")}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${streak?.permissions?.show_journal_previews ? "bg-rose-500" : "bg-gray-800"}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${streak?.permissions?.show_journal_previews ? "translate-x-6" : "translate-x-0"}`} />
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
                      <p className="text-base font-bold text-white flex items-center gap-2">Auto-share Sparks <span className="text-[9px] px-1.5 py-0.5 rounded border border-gray-700 bg-gray-800 uppercase tracking-wider">Soon</span></p>
                      <p className="text-xs text-gray-400">Automatically share when you complete a synthesis.</p>
                    </div>
                  </div>
                  <button className="w-12 h-6 rounded-full p-1 bg-gray-800 cursor-not-allowed">
                    <div className="w-4 h-4 bg-gray-500 rounded-full" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 border-b border-gray-800/50 hover:bg-white/5 transition-colors opacity-60">
                  <div className="flex items-center gap-4">
                    {/* @ts-ignore dynamic import */}
                    <Icons.UserPlus size={20} className="text-gray-400" />
                    <div>
                      <p className="text-base font-bold text-white flex items-center gap-2">Allow Streak Invites <span className="text-[9px] px-1.5 py-0.5 rounded border border-gray-700 bg-gray-800 uppercase tracking-wider">Soon</span></p>
                      <p className="text-xs text-gray-400">Let community members invite you to shared streaks.</p>
                    </div>
                  </div>
                  <button className="w-12 h-6 rounded-full p-1 bg-gray-800 cursor-not-allowed">
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
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">{requests.length}</span>
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
            <h3 className="text-sm font-bold text-white">Entanglement Requests</h3>
            <p className="text-xs text-gray-500 mt-0.5">People who want to streak with you</p>
          </div>
          {requests.length === 0 ? (
            <p className="p-5 text-sm text-gray-500 text-center">No pending requests</p>
          ) : (
            <div className="divide-y divide-gray-800">
              {requests.map((req) => (
                <div key={req.id} className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500/30 to-rose-500/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-white">{req.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{req.name}</p>
                    <p className="text-xs text-gray-500">{req.handle} · {req.mutual} mutual</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRequests(r => r.filter(x => x.id !== req.id))}
                      className="px-3 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:scale-105 transition-transform"
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequests(r => r.filter(x => x.id !== req.id))}
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
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full pointer-events-none opacity-50 ${flameShadow} transition-all duration-1000`} />

      {/* Main Flame Section */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 pt-10 pb-8">
        <h3 className="text-[12px] font-bold uppercase tracking-[0.3em] text-[var(--muse-muted)] mb-4">
          Cognitive Momentum
        </h3>
        
        <div className="relative flex flex-col items-center justify-center mb-8">
          <div className={`w-32 h-32 rounded-full flex items-center justify-center ${flameBg} border border-[var(--muse-border)] mb-4 transition-all duration-700`}>
            {/* @ts-ignore dynamic import */}
            <Icons.Flame size={64} className={`${flameColor} ${streak && streak.currentStreak > 0 ? "animate-pulse" : "opacity-50"} transition-colors duration-700`} />
          </div>
          <div className="text-6xl font-black text-[var(--muse-text)] tracking-tighter">
            {streak ? streak.currentStreak : 0}
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--muse-muted)] mt-1">
            Day Streak
          </p>
        </div>

        {justShared ? (
          <div className="w-full max-w-sm text-center py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* @ts-ignore dynamic import */}
            <Icons.CheckCircle size={32} className="text-emerald-500 mx-auto mb-4" />
            <p className="text-xl font-bold text-[var(--muse-text)]">Spark Shared</p>
            <p className="text-sm text-[var(--muse-muted)]">Momentum captured.</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleOpenCapture}
            className="px-8 py-4 rounded-full bg-gradient-to-r from-[var(--muse-accent)] to-[var(--muse-accent-dark)] text-white font-bold text-lg shadow-[0_0_30px_rgba(var(--muse-accent-rgb),0.4)] hover:shadow-[0_0_50px_rgba(var(--muse-accent-rgb),0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-3 cursor-pointer"
          >
            {/* @ts-ignore dynamic import */}
            <Icons.Zap size={20} />
            Ignite Momentum
          </button>
        )}

        {/* Momentum Feed */}
        <div className="w-full max-w-2xl mx-auto mt-16 px-6">
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-[var(--muse-muted)] mb-6 text-center">Daily Momentum Feed</h4>
          {momentumFeedSignal.value.length === 0 ? (
            <p className="text-center text-sm text-[var(--muse-muted)] italic">No momentum captured yet today. Share a spark to begin.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {momentumFeedSignal.value.map((item, i) => (
                <div key={i} className="p-5 rounded-[2rem] bg-[var(--muse-surface)] border border-[var(--muse-border)] flex flex-col gap-2 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--muse-accent)] to-purple-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-2 mb-1">
                    {/* @ts-ignore dynamic import */}
                    {item.type === "network" ? <Icons.Globe size={14} className="text-[var(--muse-muted)]" /> : <Icons.LayoutGrid size={14} className="text-[var(--muse-muted)]" />}
                    <p className="text-xs font-bold text-[var(--muse-muted)] uppercase tracking-wider">
                      {item.type === "network" ? "Public Spark" : item.type === "room" ? "Room Created" : "Artifact Added"}
                    </p>
                    <span className="text-[10px] text-gray-600 ml-auto">{new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-base text-[var(--muse-text)] leading-relaxed">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Social / Entanglements Section */}
      <div className="w-full px-6 py-12 relative z-10 border-t border-[var(--muse-border)] overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-[var(--muse-text)] font-serif italic">The Horizon</h2>
              <p className="text-xs text-[var(--muse-muted)] mt-0.5 uppercase tracking-widest">Your Entanglement Network</p>
            </div>
            <button 
              type="button"
              onClick={() => alert("Network Management feature is coming soon! You will be able to search for partners and manage invites here.")}
              className="text-sm font-bold uppercase tracking-widest text-[var(--muse-accent)] hover:text-[var(--muse-accent-dark)] transition-colors"
            >
              Manage Network
            </button>
          </div>

          {/* THE HORIZON — Stories-style entanglement stream */}
          {partnerStreaks.length > 0 ? (
            <div className="flex overflow-x-auto pb-4 -mx-6 px-6 gap-5 snap-x hide-scrollbar">
              {partnerStreaks.map((pStreak) => {
                const hasNew = pStreak.count > 0;
                return (
                  <button
                    key={pStreak.id}
                    type="button"
                    onClick={() => { setSelectedPartner(pStreak); setSparkIndex(0); setMyReaction(null); setComment(""); }}
                    className="flex flex-col items-center gap-2 flex-shrink-0 snap-center group"
                  >
                    {/* Avatar ring — glows when partner has new sparks */}
                    <div className={`p-[3px] rounded-full ${
                      hasNew
                        ? "bg-gradient-to-tr from-orange-500 via-rose-500 to-indigo-500"
                        : "bg-gray-700"
                    }`}>
                      <div className="p-[2px] rounded-full bg-[var(--muse-bg)]">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500/20 to-rose-500/20 flex items-center justify-center">
                          <span className="text-xl font-black text-white">{pStreak.partnerName.charAt(0)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs font-bold text-[var(--muse-muted)] group-hover:text-[var(--muse-text)] transition-colors max-w-[72px] truncate">{pStreak.partnerName.split(" ")[0]}</p>
                    <div className="flex items-center gap-1">
                      {/* @ts-ignore dynamic import */}
                      <Icons.Flame size={10} className="text-orange-500" />
                      <span className="text-[10px] font-black text-orange-500">{pStreak.count}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="w-full py-12 text-center rounded-3xl bg-[var(--muse-surface-soft)] border border-[var(--muse-border)] border-dashed">
              {/* @ts-ignore dynamic import */}
              <Icons.Users size={48} className="mx-auto text-[var(--muse-muted)] mb-4" />
              <p className="text-lg font-bold text-[var(--muse-text)]">No Entanglements Yet</p>
              <p className="text-sm text-[var(--muse-muted)] mb-6 max-w-sm mx-auto">
                Streaks are more powerful when shared. Invite a resonance partner to lock in your momentum together.
              </p>
              <button 
                type="button"
                onClick={() => alert("Partner discovery coming soon!")}
                className="px-6 py-3 rounded-full bg-[var(--muse-surface)] border border-[var(--muse-border)] text-[var(--muse-text)] hover:bg-[var(--muse-surface-soft)] transition-colors font-medium"
              >
                Find Partners
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Partner Spark Viewer */}
      {selectedPartner && !parallelMode && (() => {
        const sparks = PARTNER_SPARKS[selectedPartner.id] ?? PARTNER_SPARKS.default;
        const spark = sparks[sparkIndex];
        return (
          <div className="fixed inset-0 z-[100] flex flex-col bg-black animate-in fade-in duration-300">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 pt-10 pb-4">
              <button type="button" onClick={() => setSelectedPartner(null)} className="text-gray-500 hover:text-white transition-colors">
                {/* @ts-ignore dynamic import */}
                <Icons.ChevronLeft size={28} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500/30 to-rose-500/30 flex items-center justify-center">
                  <span className="font-black text-white">{selectedPartner.partnerName.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{selectedPartner.partnerName}</p>
                  <div className="flex items-center gap-1">
                    {/* @ts-ignore dynamic import */}
                    <Icons.Flame size={12} className="text-orange-500" />
                    <span className="text-xs font-bold text-orange-500">{selectedPartner.count} day streak</span>
                  </div>
                </div>
              </div>
              <div className="w-8" />
            </div>

            {/* Spark progress dots */}
            <div className="flex gap-1.5 px-6 mb-6">
              {sparks.map((_, i) => (
                <div key={i} className={`h-1 rounded-full flex-1 transition-all duration-300 ${
                  i === sparkIndex ? "bg-white" : i < sparkIndex ? "bg-white/40" : "bg-white/10"
                }`} />
              ))}
            </div>

            {/* Spark content */}
            <div className="flex-1 flex flex-col items-center justify-center px-8">
              <div className="w-full max-w-2xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-6 block">
                  {spark.type === "network" ? "Public Spark" : "Room Creation"} · {spark.time}
                </span>
                <p className="text-2xl md:text-4xl font-bold text-white leading-snug font-serif">
                  {spark.content}
                </p>

                {/* Existing reactions tally */}
                <div className="flex gap-3 mt-10 flex-wrap">
                  {Object.entries(spark.reactions).map(([emoji, count]) => (
                    <span key={emoji} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-sm font-bold text-white">
                      {emoji} <span className="text-xs text-gray-300">{count}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Prev / Next navigation */}
            <div className="flex justify-between px-6 mb-4">
              <button type="button" onClick={() => setSparkIndex(i => Math.max(0, i - 1))} disabled={sparkIndex === 0}
                className="p-3 rounded-full bg-white/10 text-white disabled:opacity-20 hover:bg-white/20 transition-colors">
                {/* @ts-ignore dynamic import */}
                <Icons.ChevronLeft size={20} />
              </button>
              <button type="button" onClick={() => setSparkIndex(i => Math.min(sparks.length - 1, i + 1))} disabled={sparkIndex === sparks.length - 1}
                className="p-3 rounded-full bg-white/10 text-white disabled:opacity-20 hover:bg-white/20 transition-colors">
                {/* @ts-ignore dynamic import */}
                <Icons.ChevronRight size={20} />
              </button>
            </div>

            {/* Interaction bar: Reactions + Comment + Streak Back */}
            <div className="px-6 pb-10 border-t border-white/10 pt-5 flex flex-col gap-4">
              {/* Emoji Reactions */}
              <div className="flex items-center gap-3 justify-center">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setMyReaction(r => r === emoji ? null : emoji)}
                    className={`text-2xl w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      myReaction === emoji ? "bg-white/20 scale-125" : "bg-white/5 hover:bg-white/15 hover:scale-110"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
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
                  <button type="button" onClick={() => setComment("")} className="text-[var(--muse-accent)] text-xs font-bold">
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
                  setActivePrompt(`Responding to ${selectedPartner.partnerName.split(" ")[0]}'s spark...`);
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
          </div>
        );
      })()}

      {/* Immersive Contemplation Modal */}
      {isSynthesizing && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-700">
          <button 
            type="button"
            onClick={() => { setIsSynthesizing(false); setParallelMode(false); }}
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
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${captureMode === "text" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
                >
                  {/* @ts-ignore dynamic import */}
                  <Icons.Type size={16} /> Text
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureMode("voice")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${captureMode === "voice" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
                >
                  {/* @ts-ignore dynamic import */}
                  <Icons.Mic size={16} /> Voice
                </button>
                <button
                  type="button"
                  onClick={() => setCaptureMode("camera")}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold transition-all ${captureMode === "camera" ? "bg-white text-black" : "text-gray-400 hover:text-white"}`}
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
                      className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-red-500/20 text-red-500 animate-pulse border-2 border-red-500" : "bg-white/10 text-white hover:bg-white/20 border-2 border-transparent"}`}
                    >
                      {/* @ts-ignore dynamic import */}
                      <Icons.Mic size={40} className={isRecording ? "animate-pulse" : ""} />
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
                       <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">Camera Viewfinder Active</p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setIsRecording(!isRecording)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all border-4 ${isRecording ? "border-red-500 bg-red-500" : "border-white bg-white/20 hover:bg-white"}`}
                    />
                  </div>
                )}
              </div>

              {/* Destination & Submit */}
              <div className="w-full max-w-2xl flex items-center justify-between mt-12 pt-8 border-t border-white/10">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Route Artifact To:</span>
                  <select 
                    value={destination}
                    onChange={(e) => setDestination(e.currentTarget.value)}
                    className="bg-transparent text-white font-bold text-lg outline-none cursor-pointer"
                  >
                    <option value="network" className="bg-black text-white">Publish to Network</option>
                    <option value="new_room" className="bg-black text-white">Create New Room</option>
                    <option value="room-sys-arch" className="bg-black text-white">Add to Room: System Architecture</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleShare}
                  disabled={sharing || (captureMode === "text" && !synthesisContent.trim())}
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
