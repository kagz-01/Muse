import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import { 
  ArrowLeft, Trash2, AlertTriangle, Clock, Hash, X, Check, 
  ChevronDown, Link2, Plus, Sparkles, Star, Type, Download, 
  ArrowRight, Book 
} from "lucide-preact";
import { 
  journalSignal, type JournalMood, type JournalEntry, 
  updateJournalEntry, deleteJournalEntry, toggleFavoriteJournal, 
  getJournalTitle 
} from "../signals/journal.ts";
import { itemsSignal } from "../signals/items.ts";
import { roomsSignal } from "../signals/rooms.ts";
import { moodConfig } from "./JournalGallery.tsx";

const moods = Object.entries(moodConfig) as [JournalMood, typeof moodConfig[JournalMood]][];

const PROMPTS_BY_MOOD: Record<JournalMood, string[]> = {
  reflective: ['What have you been replaying in your mind lately?', 'What truth are you slowly coming to accept?'],
  grounded: ['Describe the physical space you\'re in right now, in detail.', 'What feels stable right now, and why?'],
  anxious: ['Name the thing you\'re avoiding thinking about.', 'Write down every fear, no matter how irrational.'],
  grateful: ['Who helped you recently that you haven\'t thanked?', 'What ordinary thing are you most glad exists?'],
  melancholic: ['What are you mourning that no one knows about?', 'Write a letter to a past version of yourself.'],
  charged: ['What idea is consuming you right now?', 'Where is this energy trying to take you?'],
  empty: ['Write one sentence. Any sentence.', 'Describe the last thing you noticed that made you feel anything.'],
  alive: ['What made today feel worth it?', 'Write about the last moment you felt completely present.'],
  inspired: ['Where did this inspiration come from?', 'If you acted on this idea right now, what\'s the first step?'],
  nostalgic: ['What memory keeps coming back?', 'What from the past still shapes who you are today?'],
  focused: ['What is the one thing that matters most today?', 'What would you do if distraction was impossible?'],
  tender: ['Who are you feeling soft towards right now?', 'What are you being gentle with in yourself?'],
  custom: ['What\'s on your mind?', 'Start anywhere.'],
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

type FontSize = 'standard' | 'large' | 'huge';
const fontSizes: Record<FontSize, { label: string; class: string }> = {
  standard: { label: 'A', class: 'text-xl md:text-[22px]' },
  large:    { label: 'AA', class: 'text-2xl md:text-[28px]' },
  huge:     { label: 'AAA', class: 'text-3xl md:text-[36px]' }
};

export default function JournalEntryView({ entryId }: { entryId: string }) {
  const entry = journalSignal.value.find(e => e.id === entryId);
  const allItems = itemsSignal.value;
  const rooms = roomsSignal.value;

  const [body, setBody] = useState(entry?.body ?? '');
  const [mood, setMood] = useState<JournalMood>(entry?.mood ?? 'reflective');
  const [customMoodText, setCustomMoodText] = useState(entry?.customMood ?? '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);
  const [linkedItemIds, setLinkedItemIds] = useState<string[]>(entry?.linkedItemIds ?? []);
  const [fontSize, setFontSize] = useState<FontSize>('standard');
  const [saved, setSaved] = useState(true);
  const [showDelete, setShowDelete] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showLinkArtifacts, setShowLinkArtifacts] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(entry?.updatedAt ?? null);
  const [showPrompt, setShowPrompt] = useState(!entry?.body);
  const [promptIdx, setPromptIdx] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!entry?.body) textareaRef.current?.focus();
  }, []);

  const save = useCallback(() => {
    if (!entry) return;
    updateJournalEntry(entry.id, {
      body,
      mood,
      customMood: mood === 'custom' ? customMoodText : undefined,
      tags,
      linkedItemIds,
    });
    setSaved(true);
    setLastSavedTime(Date.now());
  }, [entry, body, mood, customMoodText, tags, linkedItemIds]);

  useEffect(() => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(save, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [body, mood, customMoodText, tags, linkedItemIds, save]);

  if (!entry) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
      <p className="text-2xl font-bold text-white tracking-tight">Entry not found.</p>
      <a href="/journal" className="text-gray-400 hover:text-white text-sm underline">Back to Journal</a>
    </div>
  );

  const cfg = moodConfig[mood] || moodConfig['reflective'];
  const prompts = PROMPTS_BY_MOOD[mood] || PROMPTS_BY_MOOD['reflective'];
  const currentPrompt = prompts[promptIdx % prompts.length];
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
  const charCount = body.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const handleAddTag = (e: KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
      if (newTag && !tags.includes(newTag)) setTags(prev => [...prev, newTag]);
      setTagInput('');
    }
  };

  const toggleLinkedItem = (itemId: string) => {
    setLinkedItemIds(prev => prev.includes(itemId) ? prev.filter(i => i !== itemId) : [...prev, itemId]);
  };

  const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name ?? 'Unknown Room';

  const handleDelete = () => { deleteJournalEntry(entry.id); globalThis.location.href = '/journal'; };

  const linkedItems = allItems.filter(i => linkedItemIds.includes(i.id));
  const unlinkable = allItems.filter(i => !linkedItemIds.includes(i.id));

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] relative">
      <div className="fixed inset-0 pointer-events-none opacity-[0.1] transition-colors duration-1000"
        style={{ background: `radial-gradient(ellipse at top, ${cfg.color}50, transparent 60%)` }} />

      <header className="sticky top-0 z-30 px-6 md:px-10 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-xl bg-[#0a0a0a]/80">
        <div className="flex items-center gap-4">
          <a href="/journal" className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft size={18} />
          </a>

          <div className="relative">
            <button onClick={() => setShowMoodPicker(!showMoodPicker)}
              type="button"
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer"
              style={{ backgroundColor: cfg.color + '22', borderColor: cfg.color + '55', color: cfg.color }}>
              <span>{cfg.emoji}</span>
              {mood === 'custom' && customMoodText ? customMoodText : cfg.label}
              <ChevronDown size={12} />
            </button>

            {showMoodPicker && (
              <div className="absolute top-full left-0 mt-3 bg-[#151515] border border-white/10 rounded-4xl p-4 shadow-2xl z-40 w-72 animate-in fade-in slide-in-from-top-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4 px-1">How are you feeling?</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {moods.filter(([m]) => m !== 'custom').map(([m, c]) => (
                    <button key={m} type="button" onClick={() => { setMood(m as JournalMood); setShowMoodPicker(false); }}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all text-left ${mood === m ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      style={mood === m ? { backgroundColor: c.color + '25' } : {}}
                    >
                      <span className="text-lg">{c.emoji}</span> {c.label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/10 pt-4">
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2 px-1">Custom Mood</p>
                   <input
                    value={customMoodText}
                    onInput={e => setCustomMoodText((e.target as HTMLInputElement).value)}
                    onKeyDown={e => { if (e.key === 'Enter' && customMoodText.trim()) { setMood('custom'); setShowMoodPicker(false); } }}
                    placeholder="Wistful, electric..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-xs focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 mr-2 hidden md:flex">
            {(Object.entries(fontSizes) as [FontSize, typeof fontSizes[FontSize]][]).map(([size, config]) => (
              <button key={size} type="button" onClick={() => setFontSize(size)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all cursor-pointer ${fontSize === size ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}>
                {config.label}
              </button>
            ))}
          </div>

          <button onClick={() => toggleFavoriteJournal(entry.id)}
            type="button"
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${entry.isFavorited ? 'border-amber-500/40 bg-amber-500/10 text-amber-500' : 'border-white/10 text-gray-600 hover:text-white hover:bg-white/5'}`}>
            <Star size={18} fill={entry.isFavorited ? 'currentColor' : 'transparent'} />
          </button>

          <div className="w-px h-6 bg-white/10 mx-2" />

          <div className="flex items-center gap-4 font-bold text-[10px] uppercase tracking-widest">
            {saved ? (
              <span className="text-gray-600 flex items-center gap-2">
                <Check size={12} strokeWidth={3} className="text-emerald-500" /> {lastSavedTime ? formatTime(lastSavedTime) : 'Saved'}
              </span>
            ) : (
              <span className="text-amber-500/80 flex items-center gap-2 italic">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" /> Saving
              </span>
            )}
            <button onClick={() => setShowDelete(!showDelete)}
              type="button"
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-gray-600 hover:text-rose-400 hover:border-rose-500/30 transition-all cursor-pointer">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </header>

      {showDelete && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 px-6 md:px-10 py-5 flex items-center justify-between relative z-20 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4 text-sm font-bold text-rose-200 uppercase tracking-widest">
            <AlertTriangle size={18} className="text-rose-500" /> Confirm permanent deletion.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowDelete(false)} type="button" className="text-[11px] font-bold uppercase tracking-widest text-gray-400 hover:text-white transition-colors cursor-pointer">Cancel</button>
            <button onClick={handleDelete} type="button" className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all cursor-pointer">Delete Forever</button>
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 md:px-16 py-12 relative z-10">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-white" style={{ color: cfg.color }}>
              {formatDate(entry.createdAt)}
            </p>
            <div className="mt-4 w-16 h-1 rounded-full" style={{ backgroundColor: cfg.color + '40' }} />
          </div>
          <button onClick={() => setShowPrompt(!showPrompt)}
            type="button"
            className="flex items-center gap-2 group text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-all cursor-pointer shadow-lg">
            <Sparkles size={14} className="group-hover:rotate-12 transition-transform" />
            Prompt Engine
          </button>
        </div>

        {showPrompt && (
          <div className="mb-10 flex items-start gap-5 bg-white/[0.03] border rounded-4xl p-7 animate-in fade-in slide-in-from-top-4 duration-500 backdrop-blur-sm"
            style={{ borderColor: cfg.color + '25' }}>
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.color + '20' }}>
              <Sparkles size={18} style={{ color: cfg.color }} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Contemplation Seed</p>
              <h5 className="text-white font-serif italic text-[17px] leading-relaxed">"{currentPrompt}"</h5>
            </div>
            <button onClick={() => setPromptIdx(p => p + 1)}
              type="button"
              className="px-4 py-2 rounded-full border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all cursor-pointer">
              Next
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={body}
          onInput={e => setBody((e.target as HTMLTextAreaElement).value)}
          placeholder={'Start writing...'}
          className={`flex-1 w-full min-h-[60vh] bg-transparent text-white/95 resize-none outline-none font-serif leading-[2.1] placeholder-gray-800 transition-all tracking-wide ${fontSizes[fontSize].class} custom-scrollbar`}
          style={{ caretColor: cfg.color }}
        />

        <div className="mt-16 pt-12 border-t border-white/5 space-y-12">
          <div>
            <div className="flex items-center justify-between mb-6">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2.5">
                <Link2 size={13} className="text-violet-400" /> Inspiration Artifacts
              </label>
              <button onClick={() => setShowLinkArtifacts(!showLinkArtifacts)}
                type="button"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                <Plus size={11} /> Link From Rooms
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {linkedItems.map(item => (
                <div key={item.id} className="group flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3.5 hover:border-white/20 transition-all">
                  <div className="w-2 h-2 rounded-full bg-gray-500 shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold text-white max-w-[200px] truncate">{item.title}</p>
                    <p className="text-[9px] text-gray-600 uppercase tracking-widest font-bold mt-0.5">{getRoomName(item.roomId)}</p>
                  </div>
                  <button onClick={() => toggleLinkedItem(item.id)} type="button" className="text-gray-700 hover:text-rose-400 transition-colors ml-2 cursor-pointer">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {showLinkArtifacts && (
              <div className="mt-6 bg-[#111318] border border-white/10 rounded-4xl p-6 animate-in slide-in-from-bottom-4 duration-500 shadow-xl">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-5">Your Room Collective</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {unlinkable.length === 0 ? <p className="text-gray-600 text-xs italic p-2">Everything is already connected.</p> :
                  unlinkable.map(item => (
                    <button key={item.id} type="button" onClick={() => toggleLinkedItem(item.id)}
                      className="group w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-transparent hover:border-white/10 hover:bg-white/5 transition-all text-left cursor-pointer">
                      <Plus size={14} className="text-gray-600 group-hover:text-white" />
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors line-clamp-1">{item.title}</p>
                        <p className="text-[9px] text-gray-600 uppercase font-bold tracking-widest">{getRoomName(item.roomId)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-5 flex items-center gap-2.5">
                <Hash size={13} className="text-rose-400" /> Introspection Tags
              </label>
              <div className="flex flex-wrap gap-2.5">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-gray-400 hover:text-white transition-all">
                    #{tag}
                    <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} type="button" className="text-gray-600 hover:text-rose-400 transition-colors cursor-pointer">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input value={tagInput} onInput={e => setTagInput((e.target as HTMLInputElement).value)} onKeyDown={handleAddTag}
                  placeholder="New tag..."
                  className="bg-transparent text-[11px] font-bold text-gray-500 placeholder-gray-800 outline-none w-24 py-2"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold font-mono tracking-widest text-gray-700 pt-8 border-t border-white/5">
            <div className="flex gap-8">
              <span>W:{wordCount.toLocaleString()}</span>
              <span>C:{charCount.toLocaleString()}</span>
              <span>R:{readingTime}M</span>
            </div>
            <div className="flex items-center gap-2 uppercase tracking-widest" style={{ color: cfg.color }}>
               {mood === 'custom' && customMoodText ? customMoodText : cfg.label}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
