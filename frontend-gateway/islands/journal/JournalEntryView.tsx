import { useCallback, useEffect, useMemo, useRef, useState } from "preact/hooks";
import * as Icons from "lucide-preact";
import {
  deleteJournalEntry,
  type JournalEntry as _JournalEntry,
  type JournalMood,
  journalSignal,
  toggleFavoriteJournal,
  togglePinJournal,
  toggleArchiveJournal,
  updateJournalEntry,
} from "../../signals/journal.ts";
import { itemsSignal } from "../../signals/items.ts";
import { roomsSignal } from "../../signals/rooms.ts";
import { moodConfig } from "./JournalGallery.tsx";
import {
  AIInsightsResponse,
  BlockchainStoreResponse,
  getAIInsights,
  mintReward,
  storeJournalOnBlockchain,
} from "../../utils/api.ts";
import { userSignal } from "../../signals/user.ts";
import { ExportModal } from "./ExportModal.tsx";
import { setResonanceMode, setAmbientGlow } from "../../signals/resonance.ts";

const moods = Object.entries(moodConfig) as [
  JournalMood,
  typeof moodConfig[JournalMood],
][];

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Simulated AI Questions for immersion
const SOCRATIC_QUESTIONS = [
  "How does this challenge your previous assumptions?",
  "What is the underlying fear or desire driving this thought?",
  "If this is true, what else must be true?",
  "What context might you be missing here?",
  "How does this connect to your broader goals?",
];

export default function JournalEntryView({ entryId }: { entryId: string }) {
  const entries = journalSignal.value;
  const entry = useMemo(() => entries.find((e) => e.id === entryId), [entries, entryId]);
  const allItems = itemsSignal.value;
  const rooms = roomsSignal.value;

  const [isHydrated, setIsHydrated] = useState(false);
  const [body, setBody] = useState(entry?.body ?? "");
  const [mood, setMood] = useState<JournalMood>(entry?.mood ?? "reflective");
  const [customMoodText, setCustomMoodText] = useState(entry?.customMood ?? "");
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);
  const [linkedItemIds, setLinkedItemIds] = useState<string[]>(
    entry?.linkedItemIds ?? [],
  );
  const [isPublic, setIsPublic] = useState(entry?.isPublic ?? false);
  const [saved, setSaved] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(
    entry?.updatedAt ?? null,
  );
  const [showExportModal, setShowExportModal] = useState(false);
  
  // Phase 2: Conversational State
  const [currentInput, setCurrentInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [aiResponses, setAiResponses] = useState<Record<number, string>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (entry && !body && !isHydrated) return;
    if (entry) {
      setBody((prev) => prev || entry.body);
      setMood(entry.mood);
      setCustomMoodText(entry.customMood ?? "");
      setTags(entry.tags);
      setLinkedItemIds(entry.linkedItemIds);
      setIsPublic(entry.isPublic);
      setLastSavedTime(entry.updatedAt);
    }
  }, [entry?.id]);

  useEffect(() => {
    if (!isHydrated) return;
    const currentMoodConfig = moodConfig[mood] || moodConfig["reflective"];
    setAmbientGlow(currentMoodConfig.hex);
    setResonanceMode("deep");
    return () => {
      setResonanceMode("light");
      setAmbientGlow(null);
    };
  }, [isHydrated, mood]);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(() => {
    if (!entry) return;
    updateJournalEntry(entry.id, {
      body,
      mood,
      customMood: mood === "custom" ? customMoodText : undefined,
      tags,
      linkedItemIds,
      isPublic,
    });
    setSaved(true);
    setLastSavedTime(Date.now());
  }, [entry, body, mood, customMoodText, tags, linkedItemIds, isPublic]);

  useEffect(() => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 1000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [body, mood, customMoodText, tags, linkedItemIds, isPublic, save]);

  const handleCommitThought = () => {
    if (!currentInput.trim()) return;
    
    // Append to body
    const newBody = body.trim() ? `${body}\n\n${currentInput.trim()}` : currentInput.trim();
    setBody(newBody);
    setCurrentInput("");
    
    // Simulate AI thinking and responding
    setIsAiTyping(true);
    setTimeout(() => {
      const q = SOCRATIC_QUESTIONS[Math.floor(Math.random() * SOCRATIC_QUESTIONS.length)];
      setAiResponses(prev => ({ ...prev, [newBody.split("\n\n").length - 1]: q }));
      setIsAiTyping(false);
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 1500);

    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleDelete = () => {
    deleteJournalEntry(entry!.id);
    globalThis.location.href = "/journal";
  };

  if (!entry) {
    if (!isHydrated) return <div className="min-h-screen bg-[#0a0a0a]" />;
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
        <p className="text-2xl font-bold text-white tracking-tight">Entry not found.</p>
        <a href="/journal" className="text-gray-400 hover:text-white text-sm mt-4 underline">Back to Journal</a>
      </div>
    );
  }

  const cfg = moodConfig[mood] || moodConfig["reflective"];
  const blocks = body.split("\n\n").filter(b => b.trim().length > 0);

  // Floating Context (Match items based on current input)
  const floatingContext = useMemo(() => {
    if (!currentInput.trim()) return [];
    const words = currentInput.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    if (words.length === 0) return [];
    
    return allItems.filter(item => {
      const text = `${item.title} ${item.content || ""}`.toLowerCase();
      return words.some(w => text.includes(w));
    }).slice(0, 3);
  }, [currentInput, allItems]);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] relative overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.08] transition-colors duration-1000"
        style={{ background: `radial-gradient(circle at 50% 0%, ${cfg.color}, transparent 60%)` }}
      />

      {/* HEADER */}
      <header className="sticky top-0 z-30 px-6 md:px-10 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-2xl bg-[#0a0a0a]/80 shadow-2xl">
        <div className="flex items-center gap-4">
          <a
            href="/journal"
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all shadow-lg"
          >
            <Icons.ArrowLeft size={18} />
          </a>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Icons.Terminal size={10} /> Active Session
            </span>
            <span className="text-sm font-serif italic text-white/80">{formatDate(entry.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button
             onClick={() => setIsPublic(!isPublic)}
             className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer shadow-lg group relative ${
               isPublic ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-500" : "border-white/10 text-gray-600 hover:text-white hover:bg-white/5"
             }`}
           >
             {isPublic ? <Icons.Globe size={16} /> : <Icons.Lock size={16} />}
           </button>
           
           <button
             onClick={() => setShowExportModal(true)}
             className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
           >
             <Icons.Download size={16} />
           </button>

           <div className="w-px h-6 bg-white/10 mx-1" />

           <div className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-2">
             {saved ? (
               <span className="text-emerald-500/80 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Synced</span>
             ) : (
               <span className="text-amber-500/80 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Syncing</span>
             )}
           </div>
        </div>
      </header>

      {/* MAIN CONVERSATIONAL UI */}
      <main className="flex-1 flex w-full max-w-[1400px] mx-auto relative z-10">
        
        {/* LEFT COLUMN: THE CHAT/JOURNAL FEED */}
        <div className="flex-1 flex flex-col min-h-[calc(100vh-80px)] border-r border-white/5">
          
          <div className="flex-1 overflow-y-auto px-6 md:px-12 py-10 space-y-12 pb-48 custom-scrollbar">
            
            {/* AI Greeting */}
            <div className="flex gap-4 animate-in fade-in duration-500">
               <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                 <Icons.Cpu size={14} className="text-indigo-400" />
               </div>
               <div className="flex flex-col gap-2">
                 <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Synthesis Engine</span>
                 <p className="text-gray-300 font-serif italic leading-relaxed text-lg">
                   The session is open. What's on your mind today? Let's break it down.
                 </p>
               </div>
            </div>

            {/* Conversation Blocks */}
            {blocks.map((block, i) => (
              <div key={i} className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                {/* User Message */}
                <div className="flex gap-4 flex-row-reverse">
                   <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                     <Icons.User size={14} className="text-emerald-400" />
                   </div>
                   <div className="flex flex-col gap-2 items-end">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">You</span>
                     <div className="bg-white/[0.03] border border-white/5 rounded-2xl rounded-tr-sm px-6 py-4 max-w-[85%] shadow-xl">
                       <p className="text-white font-serif leading-[1.8] text-lg whitespace-pre-wrap">
                         {block}
                       </p>
                     </div>
                   </div>
                </div>

                {/* AI Response (if available) */}
                {aiResponses[i] && (
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                       <Icons.Cpu size={14} className="text-indigo-400" />
                     </div>
                     <div className="flex flex-col gap-2">
                       <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                         Synthesis Engine <Icons.Sparkles size={10} />
                       </span>
                       <div className="bg-indigo-500/[0.02] border border-indigo-500/10 rounded-2xl rounded-tl-sm px-6 py-4 max-w-[85%] shadow-xl relative overflow-hidden">
                         <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500/50 to-transparent" />
                         <p className="text-indigo-100 font-serif italic leading-[1.8] text-lg">
                           "{aiResponses[i]}"
                         </p>
                         <div className="mt-4 flex gap-2">
                           <span className="px-2 py-1 rounded bg-white/5 text-[9px] uppercase tracking-widest text-gray-400 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors">Answer inline</span>
                           <span className="px-2 py-1 rounded bg-white/5 text-[9px] uppercase tracking-widest text-gray-400 border border-white/5 hover:bg-white/10 cursor-pointer transition-colors">Extract tags</span>
                         </div>
                       </div>
                     </div>
                  </div>
                )}
              </div>
            ))}

            {isAiTyping && (
              <div className="flex gap-4 animate-in fade-in duration-300">
                 <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                   <Icons.Cpu size={14} className="text-indigo-400 animate-pulse" />
                 </div>
                 <div className="flex flex-col gap-2 justify-center">
                   <div className="flex gap-1.5 px-4 py-3 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-2xl rounded-tl-sm w-fit">
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                     <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                 </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* THE INPUT TERMINAL */}
          <div className="absolute bottom-0 left-0 w-full p-6 md:px-12 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-20 pointer-events-none">
            <div className="w-full bg-[#111111] border border-white/10 rounded-[2rem] p-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto transition-all focus-within:border-emerald-500/30 focus-within:shadow-[0_0_50px_rgba(16,185,129,0.1)] flex flex-col">
               <textarea
                 value={currentInput}
                 onInput={(e) => setCurrentInput((e.target as HTMLTextAreaElement).value)}
                 onKeyDown={(e) => {
                   if (e.key === "Enter" && !e.shiftKey) {
                     e.preventDefault();
                     handleCommitThought();
                   }
                 }}
                 placeholder="Type your thought. Press Enter to commit, Shift+Enter for new line..."
                 className="w-full bg-transparent text-white resize-none outline-none font-serif text-lg leading-relaxed placeholder-gray-600 min-h-[60px] max-h-[200px] custom-scrollbar px-2"
               />
               <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 px-2">
                 <div className="flex items-center gap-3">
                   <button type="button" className="text-gray-500 hover:text-white transition-colors cursor-pointer"><Icons.Hash size={16} /></button>
                   <button type="button" className="text-gray-500 hover:text-white transition-colors cursor-pointer"><Icons.Link2 size={16} /></button>
                 </div>
                 <button
                   onClick={handleCommitThought}
                   disabled={!currentInput.trim() || isAiTyping}
                   type="button"
                   className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 disabled:opacity-30 transition-all cursor-pointer"
                 >
                   <Icons.ArrowUp size={16} />
                 </button>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FLOATING CONTEXT */}
        <div className="hidden lg:block w-[350px] shrink-0 border-l border-white/5 bg-[#0a0a0a]/50 p-6 space-y-8">
           <div>
             <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-canvas-primary mb-6 flex items-center gap-2">
               <Icons.BrainCircuit size={14} /> Floating Context
             </h3>
             
             {floatingContext.length > 0 ? (
               <div className="space-y-4">
                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Resonating with your input:</p>
                 {floatingContext.map(item => (
                   <div key={item.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-canvas-primary/30 transition-all cursor-pointer animate-in fade-in slide-in-from-right-4">
                     <div className="flex items-center gap-2 mb-2 text-gray-500">
                       <Icons.FileText size={12} />
                       <span className="text-[9px] uppercase tracking-widest font-bold">{rooms.find(r => r.id === item.roomId)?.name || "Artifact"}</span>
                     </div>
                     <p className="text-sm text-gray-300 font-serif line-clamp-2">{item.title}</p>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-center opacity-50">
                 <Icons.Radar size={32} className="text-gray-600 mb-4 animate-[spin-slow_10s_linear_infinite]" />
                 <p className="text-xs text-gray-500 italic font-serif">Awaiting semantic resonance...<br/>Start typing to surface connections.</p>
               </div>
             )}
           </div>

           <div className="pt-8 border-t border-white/5">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 mb-6 flex items-center gap-2">
                <Icons.Activity size={14} /> Session Telemetry
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-gray-500 mb-1">Words</p>
                  <p className="text-xl font-mono text-white">{body.trim().split(/\s+/).filter(Boolean).length}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <p className="text-[9px] uppercase tracking-widest font-bold text-gray-500 mb-1">Blocks</p>
                  <p className="text-xl font-mono text-white">{blocks.length}</p>
                </div>
              </div>
           </div>
        </div>

      </main>

      {showExportModal && entry && (
        <ExportModal
          entries={[entry]}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
}
